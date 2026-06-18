import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { UserService } from '../services/UserService';
import '../index.css';

export default function ReplayPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const gameData = location.state?.gameData;

    const [replayMoves, setReplayMoves] = useState([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playSpeed, setPlaySpeed] = useState(1500); // ms per move
    const [user, setUser] = useState(null);

    const boardRef = useRef(null);
    const chessRef = useRef(null);

    // Load actual user data on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const u = await UserService.getMe();
                setUser(u);
            } catch (e) {
                console.error("Failed to load user info in ReplayPage", e);
            }
        };
        loadUser();
    }, []);

    // Redirect to profile if no game data is passed in routing state
    useEffect(() => {
        if (!gameData) {
            navigate('/profile');
        }
    }, [gameData, navigate]);

    // Handle replay load and setup board
    useEffect(() => {
        if (!gameData || !window.Chess || !window.Chessboard) return;

        const boardDiv = document.getElementById('replay-board');
        if (boardDiv) {
            boardDiv.innerHTML = ''; // Sanitize container

            chessRef.current = new window.Chess();
            let parsedMoves = [];
            console.log("===> Replay Page loaded Game Data:", gameData);

            if (gameData.pgn && gameData.pgn.trim() !== "") {
                try {
                    const loaded = chessRef.current.load_pgn(gameData.pgn);
                    if (loaded) {
                        parsedMoves = chessRef.current.history({ verbose: true });
                    } else {
                        // Fallback coordinate parser
                        const cleanPgn = gameData.pgn.replace(/\[.*?\]/g, '').trim();
                        const noNumbers = cleanPgn.replace(/\d+\.+/g, ' ');
                        const tokens = noNumbers.split(/\s+/);
                        const results = ["1-0", "0-1", "1/2-1/2", "*"];
                        const rawMoves = tokens.filter(t => t && !results.includes(t));

                        const tempChess = new window.Chess();
                        const verboseHistory = [];
                        const coordRegex = /^[a-h][1-8][a-h][1-8][qrbn]?$/;

                        for (const moveStr of rawMoves) {
                            try {
                                const token = moveStr.trim().toLowerCase();
                                let moveObj = null;

                                if (coordRegex.test(token)) {
                                    const from = token.slice(0, 2);
                                    const to = token.slice(2, 4);
                                    const promotion = token.length === 5 ? token.slice(4, 5) : undefined;
                                    moveObj = tempChess.move({ from, to, promotion });
                                } else {
                                    const normalizedMove = moveStr.replace(/0-0-0/g, 'O-O-O').replace(/0-0/g, 'O-O');
                                    moveObj = tempChess.move(normalizedMove);
                                }

                                if (moveObj) {
                                    verboseHistory.push(moveObj);
                                }
                            } catch (err) {
                                console.warn("Custom parser failed on move token:", moveStr, err);
                                break;
                            }
                        }
                        parsedMoves = verboseHistory;
                    }
                } catch (e) {
                    console.error("PGN parse error, using blank:", e);
                }
            }
            setReplayMoves(parsedMoves);
            chessRef.current.reset();
            setCurrentMoveIndex(-1);

            const playerSide = (gameData.myColor || 'WHITE').toLowerCase();
            const config = {
                draggable: false,
                position: 'start',
                orientation: playerSide,
                pieceTheme: '/chessPieces/{piece}.png'
            };
            boardRef.current = window.Chessboard('replay-board', config);
        }
    }, [gameData]);

    // Autoplay Timer effect
    useEffect(() => {
        if (!isPlaying) return;

        const timer = setTimeout(() => {
            if (currentMoveIndex < replayMoves.length - 1) {
                const nextIdx = currentMoveIndex + 1;
                chessRef.current.move(replayMoves[nextIdx]);
                boardRef.current.position(chessRef.current.fen());
                setCurrentMoveIndex(nextIdx);
            } else {
                setIsPlaying(false);
            }
        }, playSpeed);

        return () => clearTimeout(timer);
    }, [isPlaying, currentMoveIndex, replayMoves, playSpeed]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                prevMove();
            } else if (e.key === 'ArrowRight') {
                nextMove();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentMoveIndex, replayMoves]);

    const jumpToMove = (index) => {
        if (!chessRef.current || !boardRef.current) return;
        chessRef.current.reset();
        for (let i = 0; i <= index; i++) {
            chessRef.current.move(replayMoves[i]);
        }
        boardRef.current.position(chessRef.current.fen());
        setCurrentMoveIndex(index);
    };

    const firstMove = () => {
        if (!chessRef.current || !boardRef.current) return;
        chessRef.current.reset();
        boardRef.current.position(chessRef.current.fen());
        setCurrentMoveIndex(-1);
    };

    const lastMove = () => {
        if (replayMoves.length > 0) {
            jumpToMove(replayMoves.length - 1);
        }
    };

    const nextMove = () => {
        if (currentMoveIndex < replayMoves.length - 1) {
            jumpToMove(currentMoveIndex + 1);
        }
    };

    const prevMove = () => {
        if (currentMoveIndex >= 0) {
            jumpToMove(currentMoveIndex - 1);
        }
    };

    const getGameOutcome = () => {
        if (!gameData) return { text: '', color: '', bg: '' };
        const isWhite = gameData.myColor === 'WHITE';
        if (gameData.result === '1/2-1/2') return { text: 'Hòa 🤝', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' };
        
        const whiteWon = gameData.result === '1-0';
        const won = (isWhite && whiteWon) || (!isWhite && !whiteWon);
        
        return won 
            ? { text: 'Thắng 🏆', color: '#81b64c', bg: 'rgba(129,182,76,0.1)' }
            : { text: 'Thua ❌', color: '#f87171', bg: 'rgba(248,113,113,0.1)' };
    };

    if (!gameData) return null;

    // Group moves by turn
    const turns = [];
    for (let i = 0; i < replayMoves.length; i += 2) {
        turns.push({
            num: Math.floor(i / 2) + 1,
            white: replayMoves[i],
            black: replayMoves[i + 1] || null
        });
    }

    const outcome = getGameOutcome();

    return (
        <div className="main-menu-wrapper" style={{ display: 'flex', background: '#1c1a17', minHeight: '100vh', width: '100vw', color: '#fff', overflow: 'hidden' }}>
            <Sidebar username={user?.username || 'Người chơi'} />

            {/* Center Area (Chess Board) */}
            <div className="board-area" style={{ flex: 2 }}>
                <div className="board-container" style={{ position: 'relative' }}>
                    
                    {/* Opponent Info Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="avatar-small" style={{ width: '32px', height: '32px', fontSize: '0.9rem', background: '#302e2c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '1.1rem' }}>
                                    {gameData.opponentName && gameData.opponentName.includes('Máy') ? '🤖' : '👤'}
                                </span>
                            </div>
                            <span style={{ fontWeight: '700', fontSize: '1rem', color: '#e3e3e3', fontFamily: '"Outfit", sans-serif' }}>
                                {gameData.opponentName || 'Đối thủ'}
                            </span>
                        </div>
                        <div style={{ background: '#262421', border: '1px solid rgba(255,255,255,0.06)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem', color: '#babfc3', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{gameData.myColor === 'WHITE' ? '⚫' : '⚪'}</span>
                            <span>{gameData.myColor === 'WHITE' ? 'ĐEN' : 'TRẮNG'}</span>
                        </div>
                    </div>

                    {/* Chess Board Wrapper */}
                    <div id="replay-board" className="chess-board-wrapper" style={{ width: '100%', aspectRatio: '1/1', boxShadow: '0 12px 40px rgba(0,0,0,0.65)', borderRadius: '6px', overflow: 'hidden', border: '1px solid #403d39' }}></div>

                    {/* Player Info Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', padding: '0 4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="avatar-small" style={{ width: '32px', height: '32px', fontSize: '0.9rem', background: '#302e2c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '1.1rem' }}>👤</span>
                            </div>
                            <span style={{ fontWeight: '700', fontSize: '1rem', color: '#e3e3e3', fontFamily: '"Outfit", sans-serif' }}>
                                {user?.username || 'Bạn'}
                            </span>
                        </div>
                        <div style={{ background: '#262421', border: '1px solid rgba(255,255,255,0.06)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem', color: '#babfc3', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{gameData.myColor === 'WHITE' ? '⚪' : '⚫'}</span>
                            <span>{gameData.myColor === 'WHITE' ? 'TRẮNG' : 'ĐEN'}</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Right Area: Chess.com Style Analysis Drawer inside right-panel */}
            <div className="right-panel" style={{ display: 'flex', flexDirection: 'column', padding: '24px 12px', boxSizing: 'border-box', overflow: 'hidden', flex: '0 0 340px', width: '340px' }}>
                <div style={{ background: '#262421', border: '1px solid #312e2b', borderRadius: '8px', display: 'flex', flexDirection: 'column', height: '100%', padding: '20px', overflow: 'hidden', boxSizing: 'border-box', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                    
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'white', fontWeight: '800', fontFamily: '"Outfit", sans-serif' }}>Phân tích ván đấu</h3>
                            <span style={{ color: '#babfc3', fontSize: '0.8rem', display: 'block', marginTop: '2px' }}>
                                vs {gameData.opponentName || 'Máy AI 🤖'}
                            </span>
                        </div>
                        <button 
                            onClick={() => navigate('/profile')} 
                            style={{ 
                                padding: '6px 12px', 
                                fontSize: '0.8rem', 
                                color: '#babfc3', 
                                background: '#312e2b', 
                                border: '1px solid #403d39', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#babfc3'; e.currentTarget.style.borderColor = '#403d39'; }}
                        >
                            ← Trở lại
                        </button>
                    </div>

                    {/* Outcome Banner */}
                    <div style={{ 
                        background: outcome.bg, 
                        color: outcome.color, 
                        padding: '10px 15px', 
                        borderRadius: '6px', 
                        fontSize: '0.85rem', 
                        fontWeight: '800',
                        textAlign: 'center',
                        marginBottom: '15px',
                        border: `1px solid ${outcome.color}22`
                    }}>
                        Kết quả: {outcome.text} ({gameData.result})
                    </div>

                    {/* Auto Play Speed Control */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#babfc3', marginBottom: '15px', padding: '0 4px' }}>
                        <span>Tốc độ phát:</span>
                        <select 
                            value={playSpeed} 
                            onChange={e => setPlaySpeed(Number(e.target.value))} 
                            style={{ padding: '6px 10px', fontSize: '0.8rem', background: '#312e2b', border: '1px solid #403d39', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            <option value={2000}>Chậm (2.0s)</option>
                            <option value={1500}>Thường (1.5s)</option>
                            <option value={1000}>Nhanh (1.0s)</option>
                            <option value={500}>Cực nhanh (0.5s)</option>
                        </select>
                    </div>

                    {/* Scrollable Move Sheet (Chess.com Move Table Grid) */}
                    <div style={{ flex: 1, overflowY: 'auto', background: '#1c1a17', borderRadius: '6px', border: '1px solid #312e2b', padding: '8px' }} className="custom-scrollbar">
                        {turns.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {turns.map((turn) => (
                                    <div key={turn.num} style={{ display: 'grid', gridTemplateColumns: '45px 1fr 1fr', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.01)', background: turn.num % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                                        <span style={{ color: '#62605e', fontSize: '0.85rem', fontWeight: 'bold' }}>{turn.num}.</span>
                                        
                                        {/* White Move */}
                                        <button 
                                            onClick={() => { setIsPlaying(false); jumpToMove((turn.num - 1) * 2); }}
                                            style={{
                                                border: 'none',
                                                padding: '5px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.9rem',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                fontWeight: '700',
                                                fontFamily: 'monospace',
                                                background: currentMoveIndex === (turn.num - 1) * 2 ? '#3d5e3a' : 'transparent',
                                                color: currentMoveIndex === (turn.num - 1) * 2 ? '#95d03a' : '#babfc3',
                                                transition: 'all 0.1s ease',
                                                width: 'fit-content'
                                            }}
                                        >
                                            {turn.white.san}
                                        </button>

                                        {/* Black Move */}
                                        {turn.black ? (
                                            <button 
                                                onClick={() => { setIsPlaying(false); jumpToMove((turn.num - 1) * 2 + 1); }}
                                                style={{
                                                    border: 'none',
                                                    padding: '5px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.9rem',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    fontWeight: '700',
                                                    fontFamily: 'monospace',
                                                    background: currentMoveIndex === (turn.num - 1) * 2 + 1 ? '#3d5e3a' : 'transparent',
                                                    color: currentMoveIndex === (turn.num - 1) * 2 + 1 ? '#95d03a' : '#babfc3',
                                                    transition: 'all 0.1s ease',
                                                    width: 'fit-content'
                                                }}
                                            >
                                                {turn.black.san}
                                            </button>
                                        ) : (
                                            <span></span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '30px', color: '#62605e', fontStyle: 'italic', fontSize: '0.85rem' }}>Không có nước đi nào.</div>
                        )}
                    </div>

                    {/* Chess.com Premium Control Bar */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', padding: '15px 0 0 0', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '15px' }}>
                        <button onClick={firstMove} style={{ background: 'none', border: 'none', color: '#babfc3', fontSize: '1.4rem', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#babfc3'} title="Về đầu trận">⏮</button>
                        <button onClick={prevMove} style={{ background: 'none', border: 'none', color: '#babfc3', fontSize: '1.4rem', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#babfc3'} title="Lùi 1 nước (ArrowLeft)">◀</button>
                        
                        <button 
                            onClick={() => setIsPlaying(!isPlaying)} 
                            style={{ 
                                background: '#81b64c', 
                                border: 'none', 
                                width: '44px', 
                                height: '44px', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                color: 'white', 
                                fontSize: '1.2rem', 
                                cursor: 'pointer', 
                                boxShadow: '0 4px 12px rgba(129,182,76,0.3)', 
                                transition: 'all 0.2s ease',
                                flexShrink: 0
                            }} 
                            onMouseEnter={e => { e.currentTarget.style.background = '#95ca5c'; e.currentTarget.style.transform = 'scale(1.05)'; }} 
                            onMouseLeave={e => { e.currentTarget.style.background = '#81b64c'; e.currentTarget.style.transform = 'scale(1)'; }}
                            title={isPlaying ? "Tạm dừng" : "Tự động phát"}
                        >
                            {isPlaying ? "⏸" : "▶"}
                        </button>

                        <button onClick={nextMove} style={{ background: 'none', border: 'none', color: '#babfc3', fontSize: '1.4rem', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#babfc3'} title="Tiến 1 nước (ArrowRight)">▶</button>
                        <button onClick={lastMove} style={{ background: 'none', border: 'none', color: '#babfc3', fontSize: '1.4rem', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#babfc3'} title="Đến cuối trận">⏭</button>
                    </div>
                    
                    <div style={{ textAlign: 'center', marginTop: '10px', color: '#62605e', fontSize: '0.8rem' }}>
                        Nước đi: <strong>{currentMoveIndex + 1}</strong> / {replayMoves.length}
                    </div>
                </div>
            </div>
        </div>
    );
}
