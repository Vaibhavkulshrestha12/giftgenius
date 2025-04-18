import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import { ChatProvider } from './context/ChatContext';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <Router>
      <ChatProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </SocketProvider>
      </ChatProvider>
    </Router>
  );
}

export default App;