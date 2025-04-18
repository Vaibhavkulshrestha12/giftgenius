import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 120000, 
  pingInterval: 25000, 
  transports: ['polling', 'websocket'] 
});


const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Missing GEMINI_API_KEY in environment variables');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const predefinedOptions = {
  gender: ['Male', 'Female', 'Other'],
  relationship: ['Friend', 'Partner', 'Parent', 'Sibling', 'Colleague', 'Other'],
 
};


const activeConnections = new Map();

const generateGeminiPrompt = async (userInputs) => {
  console.log('Generating Gemini prompt for inputs:', userInputs);
  
  try {
  
    if (!userInputs.gender || !userInputs.relationship || 
        userInputs.age === undefined || userInputs.budget === undefined) {
      throw new Error('Missing required user inputs');
    }
    
    const prompt = `Act as a gift recommendation expert for the Indian market. Suggest thoughtful and personalized gifts for a ${userInputs.gender} who is my ${userInputs.relationship}, aged ${userInputs.age}, with a budget of ₹${userInputs.budget}.

  Consider the following:
  - All suggestions must be available in India
  - Stay within the specified budget of ₹${userInputs.budget}
  - Consider age-appropriate items
  - Include a mix of practical and sentimental options
  - Suggest specific brands and where to buy them
  - Focus on items available both online and in physical stores

  Format your response as follows:
  1. First suggestion (include store/website)
  2. Second suggestion (include store/website)
  3. Third suggestion (include store/website)

  End with a brief note about why these suggestions would be meaningful.`;

    console.log('Sending prompt to Gemini API');
    
    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 800,
    };
    
    const safetySettings = [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ];
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings
    });
    
    const response = await result.response;
    const text = response.text();
    console.log('Received Gemini response:', text.substring(0, 100) + '...');
    return text;
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    return `Sorry, I couldn't generate gift suggestions at this time. Error: ${error.message || 'Unknown error'}. Please try again.`;
  }
};


const generateFallbackSuggestions = (userInputs) => {
  const { gender, relationship, age, budget } = userInputs;
  
  let suggestions = `Based on your inputs (${gender}, ${relationship}, age ${age}, budget ₹${budget}), here are some gift suggestions:\n\n`;
  
  if (gender === 'Female') {
    suggestions += `1. Handcrafted Jewelry Set - A beautiful necklace and earring combo available at Tanishq (₹${Math.min(budget, 1500)})\n`;
    suggestions += `2. Personalized Photo Frame with a heartfelt message from Amazon.in (₹${Math.min(budget, 800)})\n`;
    suggestions += `3. Scented Candle Gift Set from Bath & Body Works (₹${Math.min(budget, 1200)})\n`;
  } else {
    suggestions += `1. Premium Leather Wallet from Hidesign (₹${Math.min(budget, 1500)})\n`;
    suggestions += `2. Wireless Bluetooth Earbuds from Boat on Flipkart (₹${Math.min(budget, 1800)})\n`;
    suggestions += `3. Customized Name Keychain from Giftsmate.com (₹${Math.min(budget, 500)})\n`;
  }
  
  suggestions += `\nThese gifts are thoughtful options that show you care while staying within your budget. They combine practicality with a personal touch, making them perfect for your ${relationship}.`;
  
  return suggestions;
};


io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  activeConnections.set(socket.id, { connectedAt: new Date() });
  
  
  socket.emit('options', predefinedOptions);
  console.log(`Sent options to user ${socket.id}`);

  
  socket.on('request-options', () => {
    if (activeConnections.has(socket.id)) {
      socket.emit('options', predefinedOptions);
      console.log(`Re-sent options to user ${socket.id} upon request`);
    }
  });

  socket.on('user-message', (message) => {
    if (activeConnections.has(socket.id)) {
      console.log(`User ${socket.id} sent message:`, message);
    }
  });

  socket.on('gemini-prompt', async (userInputs) => {
    try {
      if (!activeConnections.has(socket.id)) {
        console.log(`User ${socket.id} disconnected before processing prompt`);
        return;
      }
      
      console.log(`User ${socket.id} sent inputs for Gemini:`, userInputs);
      socket.emit('typing-start');
      
     
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API request timed out')), 15000)
      );
      
      let response;
      try {
        
        response = await Promise.race([
          generateGeminiPrompt(userInputs),
          timeoutPromise
        ]);
      } catch (error) {
        console.warn(`API request failed or timed out for ${socket.id}:`, error.message);
       
        response = generateFallbackSuggestions(userInputs);
      }
      
      
      if (activeConnections.has(socket.id) && socket.connected) {
        console.log(`Sending response to user ${socket.id}`);
        socket.emit('bot-message', response);
      } else {
        console.log(`User ${socket.id} disconnected before receiving response`);
      }
    } catch (error) {
      console.error(`Error processing prompt for ${socket.id}:`, error);
      
      
      if (activeConnections.has(socket.id) && socket.connected) {
        socket.emit('typing-end');
        socket.emit('bot-message', `Sorry, I encountered an error while processing your request. Please try again.`);
      }
    }
  });

  
  socket.on('ping-server', () => {
    socket.emit('pong-client');
  });

  socket.on('disconnect', (reason) => {
    console.log(`User disconnected (${reason}):`, socket.id);
    activeConnections.delete(socket.id);
  });
});


app.get('/health', (req, res) => {
  const activeUsers = activeConnections.size;
  res.status(200).send(`Server is running with ${activeUsers} active connections`);
});


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}/health to check server status`);
  console.log('Waiting for socket connections...');
});