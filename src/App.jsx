import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import MainMenu from './pages/MainMenu';
import AIPlay from './pages/AIPlay';
import OnlinePlay from './pages/OnlinePlay';
import './index.css';

// Simple PrivateRoute wrapper
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
  const token = localStorage.getItem('token');
  return (
    <Router>
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
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    </Router>
  );
}

export default App;
