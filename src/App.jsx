import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import MainMenu from './pages/MainMenu';
import AIPlay from './pages/AIPlay';
import OnlinePlay from './pages/OnlinePlay';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import Tournaments from './pages/Tournaments';
import AdminDashboard from './pages/AdminDashboard';
import Replay from './pages/Replay';
import { AuthService } from './services/AuthService';
import { useEffect, useState } from "react";
import './index.css';

import { socketClient } from './services/SocketService';

// Simple PrivateRoute wrapper
const PrivateRoute = ({ children }) => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkToken = async () => {
            const t = await AuthService.getValidToken();
            setToken(t);
            setLoading(false);
            if (t) {
                socketClient.connect();
            }
        };

        checkToken();
    }, []);

    if (loading) return <div>Loading...</div>;

    return token ? children : <Navigate to="/login" />;
};

const GlobalSocket = ({ children }) => {
    React.useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            socketClient.connect(token);
        }
    }, []);
    return children;
};
function App() {
    const token = localStorage.getItem('accessToken');
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
                    <Route
                        path="/tournaments"
                        element={
                            <PrivateRoute>
                                <Tournaments />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <PrivateRoute>
                                <AdminDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/replay/:gameId"
                        element={
                            <PrivateRoute>
                                <Replay />
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
