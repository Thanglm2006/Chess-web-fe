import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import friendsIcon from '../assets/friends.svg';

export default function Sidebar({ username }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

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
                    className={`nav-item ${isActive('/friends') ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); navigate('/friends'); }}
                >
                    <span className="icon">
                        <img src={friendsIcon} alt="Friends" style={{ width: '24px', height: '24px' }} />
                    </span> Bạn bè
                </a>
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
