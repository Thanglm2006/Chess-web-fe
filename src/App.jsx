import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import MainMenu from './pages/MainMenu';
import AIPlay from './pages/AIPlay';
import OnlinePlay from './pages/OnlinePlay';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import './index.css';

import { socketClient } from './services/SocketService';

// Simple PrivateRoute wrapper
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

const GlobalSocket = ({ children }) => {
    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            socketClient.connect(token);
        }
    }, []);
    return children;
};

function App() {
  const token = localStorage.getItem('token');
  return (
    <Router>
      <GlobalSocket>
        <Routes>
            <Route path="/" element={token ? <Navigate to="/menu" /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
                path="/menu" 
                element={
                    <PrivateRoute>
                        <MainMenu />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/play-ai" 
                element={
                    <PrivateRoute>
                        <AIPlay />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/play-online" 
                element={
                    <PrivateRoute>
                        <OnlinePlay />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/profile" 
                element={
                    <PrivateRoute>
                        <Profile />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/friends" 
                element={
                    <PrivateRoute>
                        <Friends />
                    </PrivateRoute>
                } 
            />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </GlobalSocket>
    </Router>
  );
}

export default App;
