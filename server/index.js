import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  path: '/socket.io'
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
const conversationHistory = new Map();

const generateGeminiPrompt = async (userInputs) => {
  try {
    // Validate all required inputs
    if (!userInputs.gender || !userInputs.relationship || 
        typeof userInputs.age !== 'number' || typeof userInputs.budget !== 'number') {
      throw new Error('Missing or invalid user inputs');
    }

    // Ensure positive numbers for age and budget
    if (userInputs.age <= 0 || userInputs.budget <= 0) {
      throw new Error('Age and budget must be positive numbers');
    }

    const socketId = userInputs.socketId;
    let history = conversationHistory.get(socketId) || [];
    
    // If this is a refinement request, add the user's follow-up question
    if (userInputs.refinement) {
      history.push({
        role: "user",
        parts: [{ text: userInputs.refinement }]
      });
    }

    // Initialize history if empty
    if (history.length === 0) {
      const systemPrompt = {
        role: "model",
        parts: [{ text: `You are GiftGenius, an expert gift recommendation assistant for the Indian market. You provide thoughtful, personalized gift suggestions. You maintain a friendly, helpful tone and structure your responses in an easy-to-read format.` }]
      };
      history.push(systemPrompt);
    }

    // Create the main prompt or use refinement
    let promptText;
    if (!userInputs.refinement) {
      promptText = `I need gift recommendations for a ${userInputs.age}-year-old ${userInputs.gender.toLowerCase()} who is my ${userInputs.relationship.toLowerCase()} in India. My budget is ₹${userInputs.budget}.

Please provide 5 gift suggestions that are:
- Available in India (mention specific Indian stores or websites)
- Within my budget of ₹${userInputs.budget}
- Age-appropriate for a ${userInputs.age}-year-old
- A mix of practical and sentimental options

Format your response like this:
## Gift Suggestion 1: [Name of Item]
* **Price Range:** ₹[price] to ₹[price]
* **Where to Buy:** [Store/Website with hyperlink if online]
* **Why It's Perfect:** [Brief explanation]

## Gift Suggestion 2: [Name of Item]
...and so on.

End with a brief summary of why these would be meaningful gifts for my ${userInputs.relationship.toLowerCase()}.`;
    } else {
      // The refinement request is already in the history, so we don't need separate prompt text
      promptText = "";
    }

    // Add the new prompt to history if it's not a refinement or if it's the first refinement
    if (promptText) {
      history.push({
        role: "user",
        parts: [{ text: promptText }]
      });
    }

    console.log('Sending prompt to Gemini API');
    
    // Generate content with history for context
    const result = await model.generateContent({
      contents: history,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    if (!result) {
      throw new Error('No response from Gemini API');
    }

    const response = await result.response;
    if (!response) {
      throw new Error('Empty response from Gemini API');
    }

    const text = response.text();
    if (!text) {
      throw new Error('Empty text in Gemini response');
    }

    // Add response to conversation history
    history.push({
      role: "model",
      parts: [{ text: text }]
    });

    // Save updated history
    conversationHistory.set(socketId, history);

    console.log('Received Gemini response:', text.substring(0, 100) + '...');
    return text;
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw error;
  }
};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  activeConnections.set(socket.id, { 
    connectedAt: new Date(),
    lastActivity: new Date()
  });
  
  socket.emit('options', predefinedOptions);

  const keepAliveInterval = setInterval(() => {
    if (socket.connected) {
      socket.emit('ping');
    }
  }, 20000);

  socket.on('pong', () => {
    const connection = activeConnections.get(socket.id);
    if (connection) {
      connection.lastActivity = new Date();
    }
  });

  socket.on('request-options', () => {
    socket.emit('options', predefinedOptions);
  });

  socket.on('user-message', (message) => {
    console.log(`User ${socket.id} sent message:`, message);
  });

  socket.on('gemini-prompt', async (userInputs) => {
    try {
      console.log(`Processing Gemini prompt for ${socket.id}:`, userInputs);
      socket.emit('typing-start');
      
      // Add socket ID to inputs for conversation tracking
      const response = await generateGeminiPrompt({
        ...userInputs,
        socketId: socket.id
      });
      
      socket.emit('bot-message', response);
    } catch (error) {
      console.error(`Error processing prompt for ${socket.id}:`, error);
      socket.emit('bot-message', `Sorry, I couldn't generate gift suggestions. ${error.message}`);
    } finally {
      socket.emit('typing-end');
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`User disconnected (${reason}):`, socket.id);
    clearInterval(keepAliveInterval);
    activeConnections.delete(socket.id);
    // Keep conversation history for a potential reconnect
  });

  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

setInterval(() => {
  const now = new Date();
  for (const [id, connection] of activeConnections.entries()) {
    if (now.getTime() - connection.lastActivity.getTime() > 300000) {
      const socket = io.sockets.sockets.get(id);
      if (socket) {
        socket.disconnect(true);
      }
      activeConnections.delete(id);
      // Clean up conversation history for disconnected users
      conversationHistory.delete(id);
    }
  }
}, 60000);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    connections: activeConnections.size,
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});