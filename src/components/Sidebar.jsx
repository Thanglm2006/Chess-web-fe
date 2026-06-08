import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { socketClient } from '../services/SocketService';
import friendsIcon from '../assets/friends.svg';

export default function Sidebar({ username }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        socketClient.disconnect();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const token = localStorage.getItem('accessToken');
    const payload = token ? AuthService.parseToken(token) : null;
    const isAdmin = payload?.role === 'ROLE_ADMIN';

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <h2>Alpha<span>One</span></h2>
            </div>
            <nav className="sidebar-nav">
                <a 
                    href="#" 
                    className={`nav-item ${isActive('/menu') ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); navigate('/menu'); }}
                >
                    <span className="icon" style={{ color: isActive('/menu') ? '#3b82f6' : '#d1d5db' }}>♟️</span> Chơi
                </a>
                <a 
                    href="#" 
                    className={`nav-item ${isActive('/tournaments') ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); navigate('/tournaments'); }}
                >
                    <span className="icon">🏆</span> Giải đấu
                </a>
                <a 
                    href="#" 
                    className={`nav-item ${isActive('/friends') ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); navigate('/friends'); }}
                >
                    <span className="icon">
                        <img src={friendsIcon} alt="Friends" style={{ width: '24px', height: '24px' }} />
                    </span> Bạn bè
                </a>
                {isAdmin && (
                    <a 
                        href="#" 
                        className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); navigate('/admin'); }}
                    >
                        <span className="icon">🛡️</span> Admin
                    </a>
                )}
            </nav>
            <div className="sidebar-bottom">
                <div className="search-bar">
                    <span className="icon">🔍</span>
                    <input type="text" placeholder="Tìm kiếm" />
                </div>
                <div className="user-profile">
                    <div className="avatar">
                        <span className="icon">👤</span>
                    </div>
                    <span className="username">{username}</span>
                    <button className="settings-btn" onClick={handleLogout}>⚙️</button>
                </div>
            </div>
        </div>
    );
}
