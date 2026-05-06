import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { GameService } from '../services/GameService';
import '../index.css';

export default function MainMenu() {
    const navigate = useNavigate();
    const boardRef = useRef(null);
    const [username, setUsername] = useState('Guest');

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

        const handleResize = () => {
            if (boardRef.current) {
                boardRef.current.resize();
            }
        };
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
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
                    <a href="#" className="nav-item">
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

                        <button className="action-btn secondary-action">
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
                        <a href="#" className="footer-link">📁 Lịch sử ván đấu</a>
                        <a href="#" className="footer-link">📊 Bảng xếp hạng</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
