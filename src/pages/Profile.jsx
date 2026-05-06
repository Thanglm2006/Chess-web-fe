import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../services/UserService';
import { GameService } from '../services/GameService';
import '../index.css';

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Replay State
    const [selectedGame, setSelectedGame] = useState(null);
    const [replayMoves, setReplayMoves] = useState([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
    
    const boardRef = useRef(null);
    const chessRef = useRef(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const userData = await UserService.getMe();
            setUser(userData);
            
            if (userData?.userId) {
                const statsData = await UserService.getStats(userData.userId);
                setStats(statsData);
                
                const historyData = await GameService.getHistory(userData.userId);
                console.log("History Data received:", historyData);
                setHistory(Array.isArray(historyData) ? historyData : []);
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReplay = (gameData) => {
        if (!window.Chess || !window.Chessboard) return;
        
        setSelectedGame(gameData);
        
        // Initialize logic for replay
        setTimeout(() => {
            chessRef.current = new window.Chess();
            if (gameData.pgn) {
                chessRef.current.load_pgn(gameData.pgn);
                setReplayMoves(chessRef.current.history({ verbose: true }));
            } else {
                setReplayMoves([]);
            }
            
            // Reset to start
            chessRef.current.reset();
            setCurrentMoveIndex(-1);

            const config = {
                draggable: false,
                position: 'start',
                pieceTheme: '/chessPieces/{piece}.png'
            };
            boardRef.current = window.Chessboard('replay-board', config);
        }, 100);
    };

    const nextMove = () => {
        if (currentMoveIndex < replayMoves.length - 1) {
            const newIndex = currentMoveIndex + 1;
            chessRef.current.move(replayMoves[newIndex]);
            boardRef.current.position(chessRef.current.fen());
            setCurrentMoveIndex(newIndex);
        }
    };

    const prevMove = () => {
        if (currentMoveIndex >= 0) {
            chessRef.current.undo();
            boardRef.current.position(chessRef.current.fen());
            setCurrentMoveIndex(currentMoveIndex - 1);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            <header style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>My <span>Profile</span></h1>
                <button onClick={() => navigate('/menu')} className="secondary-btn">Back to Menu</button>
            </header>
            
            <div className="main-layout" style={{ maxWidth: '1000px', width: '100%', marginTop: '20px' }}>
                
                {/* Stats Column */}
                <div className="dashboard-column" style={{ flex: '1', minWidth: '300px' }}>
                    <div className="glass-panel">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-purple)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {user?.username?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                                <h2 style={{ margin: 0 }}>{user?.username}</h2>
                                <span style={{ color: 'var(--text-muted)' }}>{user?.countryCode}</span>
                            </div>
                        </div>
                        
                        <div className="stat-box">
                            <span>Rating</span>
                            <strong style={{ color: 'var(--accent-blue)' }}>{stats?.rating || 1200}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div className="stat-box" style={{ flex: 1, textAlign: 'center' }}>
                                <span style={{ color: '#4ade80' }}>Wins</span>
                                <strong>{stats?.wins || 0}</strong>
                            </div>
                            <div className="stat-box" style={{ flex: 1, textAlign: 'center' }}>
                                <span style={{ color: '#f87171' }}>Losses</span>
                                <strong>{stats?.losses || 0}</strong>
                            </div>
                            <div className="stat-box" style={{ flex: 1, textAlign: 'center' }}>
                                <span style={{ color: '#9ca3af' }}>Draws</span>
                                <strong>{stats?.draws || 0}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Column */}
                <div className="glass-panel" style={{ flex: '2', minWidth: '400px', overflowY: 'auto', maxHeight: '70vh' }}>
                    <h2>Match History</h2>
                    {history.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No matches played yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {history.map((game, idx) => (
                                <div key={idx} className="stat-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }} 
                                     onClick={() => handleReplay(game)}
                                     onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
                                     onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>vs {game.opponentName}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{new Date(game.playedAt).toLocaleDateString()} • As {game.myColor}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', color: game.result.startsWith('1') && game.myColor === 'WHITE' || game.result.endsWith('1') && game.myColor === 'BLACK' ? '#4ade80' : (game.result === '1/2-1/2' ? '#9ca3af' : '#f87171') }}>
                                            {game.result}
                                        </div>
                                        <button className="primary-btn" style={{ padding: '5px 10px', fontSize: '0.8rem', marginTop: '5px' }}>Replay</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Replay Overlay */}
            {selectedGame && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-panel" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', padding: '30px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <h3>Replay: vs {selectedGame.opponentName}</h3>
                                <button onClick={() => setSelectedGame(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                            </div>
                            <div id="replay-board" style={{ width: '400px' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
                                <button onClick={prevMove} disabled={currentMoveIndex < 0} className="secondary-btn" style={{ minWidth: '80px' }}>◀ Prev</button>
                                <button onClick={nextMove} disabled={currentMoveIndex >= replayMoves.length - 1} className="primary-btn" style={{ minWidth: '80px' }}>Next ▶</button>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '10px', color: 'var(--text-muted)' }}>
                                Move: {currentMoveIndex + 1} / {replayMoves.length}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
