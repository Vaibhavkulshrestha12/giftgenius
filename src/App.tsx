import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import { ChatProvider } from './context/ChatContext';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return currentUser ? <>{children}</> : <Navigate to="/signin" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ChatProvider>
          <SocketProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route 
                path="/chat" 
                element={
                  <PrivateRoute>
                    <ChatPage />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </SocketProvider>
        </ChatProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;