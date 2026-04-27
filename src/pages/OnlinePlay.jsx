import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { socketClient } from '../services/SocketService';
import { AuthService } from '../services/AuthService';
import '../index.css';

const MATCH_STATES = {
    INITIALIZING: 'INITIALIZING',
    SEARCHING: 'SEARCHING',
    FOUND: 'FOUND',
    COUNTDOWN: 'COUNTDOWN',
    PLAYING: 'PLAYING',
    OVER: 'OVER',
    CANCELLED: 'CANCELLED'
};

export default function OnlinePlay() {
    const [matchState, setMatchState] = useState(MATCH_STATES.INITIALIZING);
    const [status, setStatus] = useState('Initializing connection...');
    const [gameId, setGameId] = useState(null);
    const [side, setSide] = useState('WHITE');
    const [opponent, setOpponent] = useState(null);
    const [countdown, setCountdown] = useState(5);
    const [hasAccepted, setHasAccepted] = useState(false);
    const [confirmCountdown, setConfirmCountdown] = useState(10);
    const [currentTurn, setCurrentTurn] = useState('w');
    
    const gameRef = useRef(null);
    const boardRef = useRef(null);
    const matchStateRef = useRef(MATCH_STATES.INITIALIZING);
    const sideRef = useRef('WHITE');
    const navigate = useNavigate();
    const hasStarted = useRef(false);
    const confirmTimer = useRef(null);
    const initTimer = useRef(null);

    useEffect(() => { matchStateRef.current = matchState; }, [matchState]);
    useEffect(() => { sideRef.current = side; }, [side]);

    useEffect(() => {
        if (hasStarted.current) return;
        hasStarted.current = true;

        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        const userData = AuthService.parseToken(token);
        if (!userData) return navigate('/login');

        socketClient.connect(token, handleSocketMessage);

        setStatus('Checking for active games...');
        initTimer.current = setTimeout(() => {
            if (matchStateRef.current === MATCH_STATES.INITIALIZING) {
                joinMatchmaking(userData.userId);
            }
        }, 1500);

        return () => {
            socketClient.disconnect();
            if (confirmTimer.current) clearInterval(confirmTimer.current);
            if (initTimer.current) clearTimeout(initTimer.current);
            hasStarted.current = false;
        };
    }, []);

    const joinMatchmaking = (userId) => {
        setMatchState(MATCH_STATES.SEARCHING);
        setHasAccepted(false);
        setStatus('Searching for opponent...');
        axios.post(`/api/matchmaking/join?userId=${userId}`)
            .catch(err => setStatus('Matchmaking Error: ' + err.message));
    };

    const handleSocketMessage = (data) => {
        const msg = JSON.parse(data);
        console.log("WS Message Received:", msg);

        switch (msg.type) {
            case 'RECONNECT_GAME':
                if (initTimer.current) clearTimeout(initTimer.current);
                setSide(msg.side);
                setGameId(msg.gameId);
                setOpponent({
                    id: msg.opponentId,
                    name: msg.opponentName,
                    rating: msg.opponentRating
                });
                setMatchState(MATCH_STATES.PLAYING);
                initBoard(msg.side, msg.fen, msg.gameId);
                break;

            case 'PREPARE_GAME':
                if (initTimer.current) clearTimeout(initTimer.current);
                setMatchState(MATCH_STATES.FOUND);
                setGameId(msg.gameId);
                setOpponent({
                    id: msg.opponentId,
                    name: msg.opponentName,
                    country: msg.opponentCountry,
                    rating: msg.opponentRating
                });
                startConfirmCountdown(msg.timeout || 10);
                break;

            case 'MATCH_CANCELLED':
                if (confirmTimer.current) clearInterval(confirmTimer.current);
                setMatchState(MATCH_STATES.CANCELLED);
                setStatus(msg.reason);
                setTimeout(() => {
                    const userData = AuthService.parseToken(localStorage.getItem('token'));
                    joinMatchmaking(userData.userId);
                }, 2000);
                break;

            case 'GAME_START':
                if (confirmTimer.current) clearInterval(confirmTimer.current);
                setSide(msg.side);
                setOpponent(prev => ({
                    ...prev, 
                    name: msg.opponentName || prev?.name || 'Opponent',
                    rating: msg.opponentRating || prev?.rating || 1200
                }));
                setGameId(msg.gameId);
                setMatchState(MATCH_STATES.COUNTDOWN);
                initBoard(msg.side, msg.fen, msg.gameId);
                startStartCountdown();
                break;

            case 'OPPONENT_MOVE':
                if (gameRef.current && boardRef.current) {
                    // chess.js requires lowercase coordinate names (e.g. e2e4, not E2E4)
                    let moveResult = gameRef.current.move(msg.move.toLowerCase(), { sloppy: true });
                    
                    // Fallback to absolute truth if move parsing fails for any reason
                    if (!moveResult && msg.fen) {
                        gameRef.current.load(msg.fen);
                    }
                    
                    // Always synchronize graphics and turn with the engine
                    boardRef.current.position(gameRef.current.fen());
                    setCurrentTurn(gameRef.current.turn());
                }
                break;

            case 'ERROR':
                // ROLLBACK: Reset board and ensure state allows another attempt
                if (boardRef.current && gameRef.current) {
                    boardRef.current.position(gameRef.current.fen());
                    setCurrentTurn(gameRef.current.turn()); // Sync turn back to engine
                    setStatus("Invalid move! Try again.");
                }
                break;

            case 'GAME_OVER':
                setMatchState(MATCH_STATES.OVER);
                setStatus(`Finished: ${msg.reason} (${msg.result})`);
                break;
        }
    };

    const startConfirmCountdown = (t) => {
        setConfirmCountdown(t);
        if (confirmTimer.current) clearInterval(confirmTimer.current);
        confirmTimer.current = setInterval(() => {
            setConfirmCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(confirmTimer.current);
                    handleReject();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleAccept = () => {
        if (confirmTimer.current) clearInterval(confirmTimer.current);
        setHasAccepted(true);
        socketClient.send({ type: 'READY', gameId: gameId });
    };

    const handleReject = () => {
        if (confirmTimer.current) clearInterval(confirmTimer.current);
        socketClient.send({ type: 'REJECT_MATCH', gameId: gameId });
        const userData = AuthService.parseToken(localStorage.getItem('token'));
        joinMatchmaking(userData.userId);
    };

    const startStartCountdown = () => {
        let count = 5;
        setCountdown(5);
        const timer = setInterval(() => {
            count--;
            setCountdown(count);
            if (count <= 0) {
                clearInterval(timer);
                setMatchState(MATCH_STATES.PLAYING);
            }
        }, 1000);
    };

    const initBoard = (playerSide, initialFen, activeGameId) => {
        if (!window.Chess || !window.Chessboard) return;
        
        const checkExist = setInterval(() => {
            const boardEl = document.getElementById('board');
            if (boardEl) {
                clearInterval(checkExist);
                
                gameRef.current = new window.Chess(initialFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
                setCurrentTurn(gameRef.current.turn());
                
                const onDragStart = (source, piece) => {
                    if (matchStateRef.current !== MATCH_STATES.PLAYING) return false;
                    
                    const turn = gameRef.current.turn();
                    const playerChar = playerSide.toLowerCase().startsWith('w') ? 'w' : 'b';
                    if (turn !== playerChar) return false;

                    if ((playerChar === 'w' && piece.search(/^b/) !== -1) || 
                        (playerChar === 'b' && piece.search(/^w/) !== -1)) return false;

                    return true;
                };

                const onDrop = (source, target) => {
                    let move = gameRef.current.move({ from: source, to: target, promotion: 'q' });
                    if (move === null) return 'snapback';
                    
                    setCurrentTurn(gameRef.current.turn());
                    
                    // CRITICAL: Send UPPERCASE coordinate format and include promotion piece (E2E4 or A7A8Q)
                    const promo = move.promotion ? move.promotion : '';
                    const moveCoords = (move.from + move.to + promo).toUpperCase();
                    console.log("Sending UCI Move:", moveCoords);
                    
                    socketClient.send({ 
                        type: 'MOVE', 
                        gameId: activeGameId, 
                        move: moveCoords 
                    });
                };

                const config = {
                    draggable: true,
                    position: initialFen || 'start',
                    orientation: playerSide.toLowerCase(),
                    onDragStart: onDragStart,
                    onDrop: onDrop,
                    onSnapEnd: () => boardRef.current.position(gameRef.current.fen()),
                    pieceTheme: '/chessPieces/{piece}.png'
                };

                boardRef.current = window.Chessboard('board', config);
            }
        }, 50);
    };

    const isMyTurn = () => {
        if (!side) return false;
        // Do NOT depend on gameRef.current here, otherwise React will skip re-rendering when the ref is assigned
        const playerSideChar = side.toLowerCase().startsWith('w') ? 'w' : 'b';
        return currentTurn === playerSideChar;
    };

    return (
        <div className="container">
            <header>
                <h1>Online <span>Match</span> 
                { (matchState === MATCH_STATES.PLAYING || matchState === MATCH_STATES.COUNTDOWN) && (
                    <span style={{fontSize: '1rem', marginLeft: '20px', color: isMyTurn() ? '#4ade80' : '#f87171'}}>
                         {isMyTurn() ? "● YOUR MOVE" : "○ OPPONENT TURN"}
                    </span>
                )}
                { matchState === MATCH_STATES.OVER && (
                    <span style={{fontSize: '1rem', marginLeft: '20px', color: 'white'}}>
                         ■ MATCH FINISHED
                    </span>
                )}
                </h1>
            </header>

            <div className="main-layout" style={{ justifyContent: 'center' }}>
                
                {matchState === MATCH_STATES.PLAYING || matchState === MATCH_STATES.COUNTDOWN || matchState === MATCH_STATES.OVER ? (
                    <>
                        <div className="board-column" style={{position: 'relative'}}>
                            <div id="board" style={{ width: '500px' }}></div>
                            
                            {matchState === MATCH_STATES.COUNTDOWN && (
                                <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)', padding: '20px 40px', borderRadius: '15px', backdropFilter: 'blur(10px)', border: '2px solid var(--accent-purple)', zIndex: 10}}>
                                    <h1 style={{fontSize: '4rem', margin: 0, color: 'white'}}>{countdown}</h1>
                                </div>
                            )}

                            {matchState === MATCH_STATES.OVER && (
                                <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.85)', padding: '30px 40px', borderRadius: '15px', backdropFilter: 'blur(10px)', border: '2px solid var(--accent-blue)', zIndex: 10, textAlign: 'center', minWidth: '350px'}}>
                                    <h1 style={{fontSize: '2.5rem', margin: '0 0 10px 0', color: 'white'}}>GAME OVER</h1>
                                    <p style={{fontSize: '1.2rem', margin: 0, color: 'var(--text-muted)'}}>{status}</p>
                                </div>
                            )}
                        </div>
                        <div className="dashboard-column">
                            <div className="glass-panel" style={{minWidth: '320px'}}>
                                <h2>{opponent?.name || 'Opponent'}</h2>
                                <div className="stat-box">
                                    <span>Opponent Rating</span>
                                    <strong>{opponent?.rating || '1200'}</strong>
                                </div>
                                <div className="stat-box">
                                    <span>Your Side</span>
                                    <strong>{side}</strong>
                                </div>
                                <div className="stat-box">
                                    <span>Status</span>
                                    <strong style={{color: matchState === MATCH_STATES.OVER ? 'white' : (isMyTurn() ? '#4ade80' : '#f87171')}}>
                                        {matchState === MATCH_STATES.PLAYING 
                                            ? (isMyTurn() ? "YOUR MOVE" : "WAITING...") 
                                            : (matchState === MATCH_STATES.OVER ? "FINISHED" : "GET READY")
                                        }
                                    </strong>
                                </div>
                                <div className="btn-group" style={{ marginTop: '20px' }}>
                                     <button onClick={() => navigate('/menu')} className="secondary-btn">Back to Menu</button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="glass-panel" style={{ width: '450px', textAlign: 'center', padding: '40px' }}>
                        {(matchState === MATCH_STATES.SEARCHING || matchState === MATCH_STATES.INITIALIZING) && (
                            <div className="searching-ui">
                                <div className="loader" style={{ marginBottom: '20px' }}></div>
                                <h2>{status}</h2>
                                <button onClick={() => navigate('/menu')} className="secondary-btn" style={{ marginTop: '20px' }}>Cancel Search</button>
                            </div>
                        )}

                        {matchState === MATCH_STATES.FOUND && (
                            <div className="found-ui">
                                <h2 style={{ color: 'var(--accent-blue-hover)' }}>Match Found!</h2>
                                <div style={{ margin: '20px 0', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                    <div style={{fontSize: '1.4rem', fontWeight: 'bold'}}>{opponent?.name}</div>
                                    <div style={{fontSize: '1rem', color: 'var(--text-muted)'}}>{opponent?.country || 'Earth'} • Rating: {opponent?.rating}</div>
                                </div>
                                {!hasAccepted ? (
                                    <div className="btn-group">
                                        <button onClick={handleAccept} className="primary-btn">ACCEPT ({confirmCountdown}s)</button>
                                        <button onClick={handleReject} className="secondary-btn">REJECT</button>
                                    </div>
                                ) : (
                                    <p>Accepted! Waiting for {opponent?.name} to confirm...</p>
                                )}
                            </div>
                        )}

                        {matchState === MATCH_STATES.CANCELLED && (
                            <div className="cancelled-ui">
                                <h2 style={{color: '#f87171'}}>Match Invalidated</h2>
                                <p style={{margin: '10px 0'}}>{status}</p>
                                <p style={{fontSize: '0.9rem', opacity: 0.6}}>Returning to matchmaking queue...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .loader {
                    border: 4px solid rgba(255,255,255,0.1);
                    border-top: 4px solid var(--accent-blue);
                    border-radius: 50%;
                    width: 50px; height: 50px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
}
