import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { socketClient } from '../services/SocketService';
import friendsIcon from '../assets/friends.svg';

export default function Sidebar({ username }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [userRating, setUserRating] = useState(localStorage.getItem('rating') ? Number(localStorage.getItem('rating')) : null);
    const [displayUsername, setDisplayUsername] = useState(username || localStorage.getItem('username') || 'Khách');

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('username');
        localStorage.removeItem('rating');
        localStorage.removeItem('countryCode');
        socketClient.disconnect();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const token = localStorage.getItem('accessToken');
    const payload = token ? AuthService.parseToken(token) : null;
    const isAdmin = payload?.role === 'ROLE_ADMIN';

    useEffect(() => {
        if (username) {
            setDisplayUsername(username);
        } else {
            const saved = localStorage.getItem('username');
            if (saved) setDisplayUsername(saved);
        }
    }, [username]);

    useEffect(() => {
        const fetchUserStats = async () => {
            if (payload && payload.userId) {
                try {
                    const stats = await UserService.getStats(payload.userId);
                    if (stats) {
                        setUserRating(stats.rating);
                        localStorage.setItem('rating', String(stats.rating));
                        if (stats.username) {
                            setDisplayUsername(stats.username);
                            localStorage.setItem('username', stats.username);
                        }
                        if (stats.countryCode) {
                            localStorage.setItem('countryCode', stats.countryCode);
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch sidebar user stats:", err);
                }
            }
        };
        fetchUserStats();
    }, [payload?.userId]);

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
                    className={`nav-item ${isActive('/leaderboard') ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); navigate('/leaderboard'); }}
                >
                    <span className="icon">📊</span> Bảng xếp hạng
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
                    <div className="user-details" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, marginLeft: '10px' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{displayUsername}</span>
                        {userRating !== null && (
                            <span className="user-rating" style={{ fontSize: '0.75rem', color: '#81b64c', fontWeight: 'bold', marginTop: '2px' }}>⭐ {userRating} ELO</span>
                        )}
                    </div>
                    <button className="settings-btn" onClick={handleLogout}>⚙️</button>
                </div>
            </div>
        </div>
    );
}
