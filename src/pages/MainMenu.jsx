import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { GameService } from '../services/GameService';
import { FriendService } from '../services/FriendService';
import { socketClient } from '../services/SocketService';
import '../index.css';

export default function MainMenu() {
    const navigate = useNavigate();
    const boardRef = useRef(null);
    const [username, setUsername] = useState('Guest');
    const [friends, setFriends] = useState([]);
    const [matchType, setMatchType] = useState('rapid');

    useEffect(() => {
        const init = async () => {
            const token = await AuthService.getValidToken();
            if (!token) {
                navigate('/login');
                return;
            }

            const payload = AuthService.parseToken(token);
            if (payload) {
                setUsername(payload.username || payload.sub || 'User');
                
                // Fetch friends
                try {
                    const friendsList = await FriendService.getList(payload.userId);
                    setFriends(friendsList || []);
                } catch (err) {
                    console.error("Failed to load friends", err);
                }
            }

            // Check for active game
            try {
                const activeGameId = await GameService.getActiveGame(payload.userId);
                if (activeGameId) {
                    console.log("Found active game, redirecting...", activeGameId);
                    navigate('/play-online');
                }
            } catch (error) {
                console.error("Reconnection check failed", error);
            }

            // Render background board
            if (window.Chessboard && !boardRef.current) {
                setTimeout(() => {
                    const boardEl = document.getElementById('main-menu-board');
                    if (boardEl) {
                        boardRef.current = window.Chessboard('main-menu-board', {
                            position: 'start',
                            showNotation: true,
                            pieceTheme: '/chessPieces/{piece}.png'
                        });
                    }
                }, 100);
            }
        };

        init();

        const handleSocketMessage = (data) => {
            try {
                const msg = JSON.parse(data);
                if (msg.type === 'USER_ONLINE') {
                    setFriends(prev => prev.map(f => f.userId === msg.userId ? { ...f, status: 'ONLINE' } : f));
                } else if (msg.type === 'USER_OFFLINE') {
                    setFriends(prev => prev.map(f => f.userId === msg.userId ? { ...f, status: 'OFFLINE' } : f));
                }
            } catch (e) {
                console.error("Presence update error", e);
            }
        };

        socketClient.addListener(handleSocketMessage);

        const handleResize = () => {
            if (boardRef.current) {
                boardRef.current.resize();
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            socketClient.removeListener(handleSocketMessage);
            window.removeEventListener('resize', handleResize);
        };
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    const handleInvite = (friendId) => {
        navigate('/play-online', { state: { inviteFriendId: friendId, matchType: matchType } });
    };

    return (
        <div className="main-menu-wrapper">
            {/* Left Sidebar */}
            <div className="sidebar">
                <div className="sidebar-logo">
                    <h2>Alpha<span>One</span></h2>
                </div>
                <nav className="sidebar-nav">
                    <a href="#" className="nav-item active">
                        <span className="icon">♟️</span> Chơi
                    </a>
                    <a href="#" className="nav-item">
                        <span className="icon">🧩</span> Câu đố
                    </a>
                    <a href="#" className="nav-item">
                        <span className="icon">🎓</span> Học
                    </a>
                    <a href="#" className="nav-item">
                        <span className="icon">🔭</span> Đào tạo
                    </a>
                    <a href="#" className="nav-item">
                        <span className="icon">📺</span> Xem
                    </a>
                    <a href="#" className="nav-item" onClick={() => navigate('/friends')}>
                        <span className="icon">👥</span> Cộng đồng
                    </a>
                    <a href="#" className="nav-item">
                        <span className="icon">⚙️</span> Khác
                    </a>
                    <a href="#" className="nav-item trial">
                        <span className="icon">💎</span> Dùng thử miễn phí
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
                        <span className="username" style={{ textTransform: 'capitalize' }}>{username}</span>
                        <button className="settings-btn" onClick={handleLogout}>⚙️</button>
                    </div>
                </div>
            </div>

            {/* Center Area (Board) */}
            <div className="board-area">
                <div className="board-container">
                    <div id="main-menu-board" className="chess-board-wrapper"></div>
                    <div className="player-info-bottom">
                        <div className="avatar-small"><span className="icon">👤</span></div>
                        <span className="username" style={{ textTransform: 'capitalize' }}>{username} <span className="flag">🇻🇳</span></span>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="right-panel">
                <div className="glass-panel menu-glass-panel">
                    <div className="panel-header">
                        <h2>🏆 So tài cờ vua</h2>
                    </div>
                    <div className="action-buttons">
                        <button onClick={() => navigate('/play-online')} className="action-btn primary-action">
                            <span className="btn-icon">⚡</span>
                            <div className="btn-text">
                                <strong>Chơi trực tuyến</strong>
                                <span>Chơi với người khác cùng kĩ năng</span>
                            </div>
                        </button>

                        <button onClick={() => navigate('/play-ai')} className="action-btn secondary-action">
                            <span className="btn-icon">🤖</span>
                            <div className="btn-text">
                                <strong>Chơi với Bot</strong>
                                <span>Thách đấu với máy từ mức độ Dễ đến Kiện Tướng</span>
                            </div>
                        </button>

                        <button className="action-btn secondary-action">
                            <span className="btn-icon">👨‍🏫</span>
                            <div className="btn-text">
                                <strong>Bật huấn luyện viên</strong>
                                <span>Học khi bạn chơi với Huấn luyện viên</span>
                            </div>
                        </button>

                        <button className="action-btn secondary-action" onClick={() => navigate('/friends')}>
                            <span className="btn-icon">🤝</span>
                            <div className="btn-text">
                                <strong>Chơi với một người bạn</strong>
                                <span>Mời bạn đấu một ván cờ</span>
                            </div>
                        </button>

                        <button className="action-btn secondary-action">
                            <span className="btn-icon">🏅</span>
                            <div className="btn-text">
                                <strong>Các giải đấu</strong>
                                <span>Tham gia đấu trường nơi mọi người đều có cơ hội chiến thắng</span>
                            </div>
                        </button>

                        <button className="action-btn secondary-action">
                            <span className="btn-icon">🎲</span>
                            <div className="btn-text">
                                <strong>Cờ biến thể</strong>
                                <span>Tìm cách chơi cờ mới và thú vị hơn</span>
                            </div>
                        </button>
                    </div>

                    <div className="panel-footer">
                        <a href="#" className="footer-link" onClick={() => navigate('/profile')}>📁 Lịch sử ván đấu</a>
                        <a href="#" className="footer-link">📊 Bảng xếp hạng</a>
                    </div>
                </div>

                {/* Friends Zone */}
                <div className="glass-panel" style={{ marginTop: '20px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Bạn bè trực tuyến</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', cursor: 'pointer' }} onClick={() => navigate('/friends')}>Xem tất cả</span>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {friends.filter(f => f.status === 'ONLINE').length === 0 ? (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>Không có bạn bè nào trực tuyến</p>
                        ) : (
                            friends.filter(f => f.status === 'ONLINE').map(friend => (
                                <div key={friend.userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ width: '32px', height: '32px', background: 'var(--eval-white)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                {friend.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '10px', height: '10px', background: '#4ade80', borderRadius: '50%', border: '2px solid var(--bg-dark)' }}></div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{friend.username}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{friend.rating}</span>
                                        </div>
                                    </div>
                                    <button 
                                        className="primary-btn" 
                                        style={{ padding: '5px 10px', fontSize: '0.75rem', flex: 'none' }}
                                        onClick={() => handleInvite(friend.userId)}
                                    >
                                        Mời
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{ marginTop: '15px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                        <select 
                            value={matchType} 
                            onChange={(e) => setMatchType(e.target.value)}
                            className="custom-input"
                            style={{ fontSize: '0.8rem', padding: '5px' }}
                        >
                            <option value="bullet">Bullet (1m)</option>
                            <option value="blitz">Blitz (3m)</option>
                            <option value="rapid">Rapid (10m)</option>
                            <option value="classical">Classical (30m)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
