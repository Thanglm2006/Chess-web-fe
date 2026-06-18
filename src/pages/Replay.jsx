import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { ReplayService } from '../services/ReplayService';
import { AuthService } from '../services/AuthService';
import '../index.css';

export default function Replay() {
    const navigate = useNavigate();
    const { gameId } = useParams();
    const [username, setUsername] = useState('Người chơi');
    const [game, setGame] = useState(null);
    const [moves, setMoves] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [currentMoveIdx, setCurrentMoveIdx] = useState(-1); // -1 is starting position
    const [errorMsg, setErrorMsg] = useState('');

    const gameRef = useRef(null);
    const boardRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            const token = await AuthService.getValidToken();
            if (!token) {
                navigate('/login');
                return;
            }
            const payload = AuthService.parseToken(token);
            if (payload) {
                setUsername(payload.username || 'Người chơi');
            }

            try {
                const gameData = await ReplayService.getGame(gameId);
                setGame(gameData);

                const moveList = await ReplayService.getGameMoves(gameId);
                setMoves(moveList || []);

                const analysisData = await ReplayService.getGameAnalysis(gameId);
                setAnalysis(analysisData);

                // Initialize board after data loads
                if (window.Chess && window.Chessboard) {
                    gameRef.current = new window.Chess();
                    
                    const config = {
                        position: 'start',
                        draggable: false, // Replay mode is read-only
                        pieceTheme: '/chessPieces/{piece}.png'
                    };

                    setTimeout(() => {
                        const boardEl = document.getElementById('replay-board');
                        if (boardEl) {
                            boardRef.current = window.Chessboard('replay-board', config);
                        }
                    }, 200);
                }
            } catch (err) {
                console.error(err);
                if (err.response?.status === 403) {
                    setErrorMsg(err.response?.data?.message || "Replay trận đấu trong giải chỉ khả dụng sau khi giải đấu đã kết thúc hoàn toàn.");
                } else {
                    setErrorMsg("Không thể tải thông tin ván đấu.");
                }
            }
        };

        init();
    }, [gameId, navigate]);

    const handleJumpToMove = (idx) => {
        if (!gameRef.current || !boardRef.current) return;
        
        gameRef.current.reset();
        for (let i = 0; i <= idx; i++) {
            gameRef.current.move(moves[i].sanMove);
        }
        
        boardRef.current.position(gameRef.current.fen());
        setCurrentMoveIdx(idx);
    };

    const handleNext = () => {
        if (currentMoveIdx < moves.length - 1) {
            handleJumpToMove(currentMoveIdx + 1);
        }
    };

    const handlePrev = () => {
        if (currentMoveIdx >= 0) {
            handleJumpToMove(currentMoveIdx - 1);
        }
    };

    const handleFirst = () => {
        if (!gameRef.current || !boardRef.current) return;
        gameRef.current.reset();
        boardRef.current.position(gameRef.current.fen());
        setCurrentMoveIdx(-1);
    };

    const handleLast = () => {
        if (moves.length > 0) {
            handleJumpToMove(moves.length - 1);
        }
    };

    // Calculate evaluation bar height
    // Standard starting FEN is 50%
    const getEvalPercentage = () => {
        if (currentMoveIdx === -1 || moves.length === 0) return 50;
        const currentMove = moves[currentMoveIdx];
        if (currentMove.evaluation === null || currentMove.evaluation === undefined) return 50;
        
        let evalVal = currentMove.evaluation;
        // Map evaluation (-5 to +5) to percentage (5% to 95%)
        let percentage = 50 + (evalVal * 8); // 8% per pawn advantage
        return Math.max(5, Math.min(95, percentage));
    };

    const getEvalText = () => {
        if (currentMoveIdx === -1 || moves.length === 0) return '0.0';
        const currentMove = moves[currentMoveIdx];
        if (currentMove.evaluation === null || currentMove.evaluation === undefined) return '-';
        return currentMove.evaluation > 0 ? `+${currentMove.evaluation.toFixed(1)}` : currentMove.evaluation.toFixed(1);
    };

    if (errorMsg) {
        return (
            <div className="friends-page-wrapper">
                <Sidebar username={username} />
                <div className="friends-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%' }}>
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', maxWidth: '500px' }}>
                        <h2 style={{ color: '#ef4444', marginBottom: '15px' }}>🚫 Truy cập bị từ chối</h2>
                        <p style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: '1.5' }}>{errorMsg}</p>
                        <button className="primary-btn" style={{ marginTop: '20px' }} onClick={() => navigate('/tournaments')}>Quay lại Giải đấu</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="friends-page-wrapper">
            <Sidebar username={username} />

            <div className="friends-content" style={{ display: 'flex', gap: '30px', width: '100%' }}>
                {/* Board Area */}
                <div className="board-column" style={{ flex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="friends-header" style={{ width: '100%', maxWidth: '600px' }}>
                        <h1>🎬 Replay ván đấu</h1>
                        {game && (
                            <p style={{ color: 'var(--text-muted)' }}>
                                {game.whitePlayer?.username || 'Không rõ'} vs {game.blackPlayer?.username || 'Không rõ'} | Kết quả: {game.result || '*'}
                            </p>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '20px' }}>
                        {/* Eval Bar */}
                        <div className="eval-wrapper">
                            <div className="eval-fill" style={{ height: `${getEvalPercentage()}%` }}></div>
                            <div className="eval-text">{getEvalText()}</div>
                        </div>

                        {/* Chessboard */}
                        <div id="replay-board" style={{ width: '500px' }}></div>
                    </div>

                    {/* Replay Controls */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px', width: '500px' }}>
                        <button className="secondary-btn" onClick={handleFirst}>⏮️</button>
                        <button className="secondary-btn" onClick={handlePrev}>◀️</button>
                        <button className="secondary-btn" onClick={handleNext}>▶️</button>
                        <button className="secondary-btn" onClick={handleLast}>⏭️</button>
                    </div>
                </div>

                {/* Analysis/Move history Sidebar */}
                <div className="friends-sidebar-col" style={{ flex: 1.5, minWidth: '320px' }}>
                    <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <h2>Phân tích trận đấu</h2>

                        {analysis && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                                <div className="stat-box">
                                    <span>Lỗi nghiêm trọng (Blunders)</span>
                                    <strong style={{ color: '#ef4444' }}>{analysis.blundersCount}</strong>
                                </div>
                                <div className="stat-box">
                                    <span>Sai sót (Mistakes)</span>
                                    <strong style={{ color: '#f57c00' }}>{analysis.mistakesCount}</strong>
                                </div>
                            </div>
                        )}

                        <h3>Danh sách nước đi</h3>
                        <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '10px', overflowY: 'auto' }}>
                            {moves.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>Không có nước đi nào.</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '5px', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                                    {Array.from({ length: Math.ceil(moves.length / 2) }).map((_, idx) => {
                                        const wIdx = idx * 2;
                                        const bIdx = idx * 2 + 1;
                                        return (
                                            <React.Fragment key={idx}>
                                                <div
                                                    onClick={() => handleJumpToMove(wIdx)}
                                                    style={{
                                                        padding: '5px',
                                                        cursor: 'pointer',
                                                        borderRadius: '4px',
                                                        background: currentMoveIdx === wIdx ? 'rgba(59,130,246,0.2)' : 'transparent',
                                                        color: currentMoveIdx === wIdx ? 'var(--accent-blue-hover)' : 'white'
                                                    }}
                                                >
                                                    {idx + 1}. {moves[wIdx].sanMove}
                                                    {moves[wIdx].evaluation !== null && (
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '5px' }}>
                                                            ({moves[wIdx].evaluation > 0 ? '+' : ''}{moves[wIdx].evaluation.toFixed(1)})
                                                        </span>
                                                    )}
                                                </div>
                                                {moves[bIdx] ? (
                                                    <div
                                                        onClick={() => handleJumpToMove(bIdx)}
                                                        style={{
                                                            padding: '5px',
                                                            cursor: 'pointer',
                                                            borderRadius: '4px',
                                                            background: currentMoveIdx === bIdx ? 'rgba(59,130,246,0.2)' : 'transparent',
                                                            color: currentMoveIdx === bIdx ? 'var(--accent-blue-hover)' : 'white'
                                                        }}
                                                    >
                                                        {moves[bIdx].sanMove}
                                                        {moves[bIdx].evaluation !== null && (
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '5px' }}>
                                                                ({moves[bIdx].evaluation > 0 ? '+' : ''}{moves[bIdx].evaluation.toFixed(1)})
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div>-</div>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <button className="secondary-btn" onClick={() => navigate('/tournaments')} style={{ marginTop: '20px' }}>
                            Quay lại giải đấu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
