import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { socketClient } from '../services/SocketService';
import { AuthService } from '../services/AuthService';
import { FriendService } from '../services/FriendService';
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
    const location = useLocation();
    const initialMatchType = location.state?.matchType || 'rapid';

    const [matchState, setMatchState] = useState(MATCH_STATES.INITIALIZING);
    const [matchType, setMatchType] = useState(initialMatchType);
    const [status, setStatus] = useState('Initializing connection...');
    const [gameId, setGameId] = useState(null);
    const [side, setSide] = useState('WHITE');
    const [opponent, setOpponent] = useState(null);
    const [countdown, setCountdown] = useState(5);
    const [hasAccepted, setHasAccepted] = useState(false);
    const [confirmCountdown, setConfirmCountdown] = useState(10);
    const [currentTurn, setCurrentTurn] = useState('w');

    // Private Room State
    const [roomCode, setRoomCode] = useState('');
    const [joinRoomCode, setJoinRoomCode] = useState('');

    // Chat State
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');

    // Timer State
    const [whiteTime, setWhiteTime] = useState(600);
    const [blackTime, setBlackTime] = useState(600);

    // Rematch State
    const [rematchOffered, setRematchOffered] = useState(false);
    const [rematchSent, setRematchSent] = useState(false);

    // Draw State
    const [drawOfferReceived, setDrawOfferReceived] = useState(false);
    const [drawOfferSent, setDrawOfferSent] = useState(false);

    // Friend Invite State
    const [inviteReceived, setInviteReceived] = useState(null);
    const [friendRequestSent, setFriendRequestSent] = useState(false);

    const gameRef = useRef(null);
    const boardRef = useRef(null);
    const matchStateRef = useRef(MATCH_STATES.INITIALIZING);
    const sideRef = useRef('WHITE');
    const navigate = useNavigate();
    const hasStarted = useRef(false);
    const confirmTimer = useRef(null);
    const initTimer = useRef(null);
    const clockTimer = useRef(null);

    useEffect(() => { matchStateRef.current = matchState; }, [matchState]);
    useEffect(() => { sideRef.current = side; }, [side]);

    useEffect(() => {
        const init = async () => {
            if (hasStarted.current) return;
            hasStarted.current = true;

            const token = await AuthService.getValidToken();
            if (!token) {
                navigate('/login');
                return;
            }

            socketClient.addListener(handleSocketMessage);
            setStatus('Connected. Select a mode.');

            // If redirected here with a friend invite
            if (location.state?.inviteFriendId) {
                setTimeout(() => {
                    setStatus('Inviting friend...');
                    socketClient.send({
                        type: 'INVITE_FRIEND',
                        friendId: location.state.inviteFriendId,
                        matchType: location.state.matchType || 'rapid'
                    });
                }, 1000);
            } else {
                // Check for active games or auto-join if necessary
                const userData = AuthService.parseToken(token);
                if (userData) {
                    setStatus('Checking for active games...');
                    initTimer.current = setTimeout(() => {
                        if (matchStateRef.current === MATCH_STATES.INITIALIZING) {
                             // Only auto-join if we weren't just redirected with an invite
                             // Actually, let's just stay in INITIALIZING and wait for user to click "Find Match"
                             // unless the user specifically wants auto-matchmaking.
                             // For now, let's keep it manual to avoid confusion.
                             setStatus('Connected. Select a mode.');
                        }
                    }, 1500);
                }
            }
        };

        init();

        return () => {
            socketClient.removeListener(handleSocketMessage);
            if (confirmTimer.current) clearInterval(confirmTimer.current);
            if (initTimer.current) clearTimeout(initTimer.current);
            if (clockTimer.current) clearInterval(clockTimer.current);
            hasStarted.current = false;
        };
    }, [location, navigate]);

    // Clock Timer Effect
    useEffect(() => {
        if (matchState === MATCH_STATES.PLAYING) {
            if (clockTimer.current) clearInterval(clockTimer.current);
            clockTimer.current = setInterval(() => {
                if (currentTurn === 'w') {
                    setWhiteTime(prev => Math.max(0, prev - 1));
                } else {
                    setBlackTime(prev => Math.max(0, prev - 1));
                }
            }, 1000);
        } else {
            if (clockTimer.current) clearInterval(clockTimer.current);
        }
        return () => {
            if (clockTimer.current) clearInterval(clockTimer.current);
        };
    }, [matchState, currentTurn]);

    const joinMatchmaking = async () => {
        setMatchState(MATCH_STATES.SEARCHING);
        setHasAccepted(false);
        setStatus('Searching for opponent...');
        try {
            const token = await AuthService.getValidToken();
            const userData = AuthService.parseToken(token);
            await axios.post(`/api/matchmaking/join?userId=${userData.userId}&type=${matchType}`);
        } catch (err) {
            setStatus('Matchmaking Error: ' + err.message);
        }
    };

    const handleCreateRoom = () => {
        setStatus('Creating private room...');
        socketClient.send({ type: 'CREATE_ROOM', matchType: matchType });
    };

    const handleJoinRoom = () => {
        if (!joinRoomCode) return;
        setStatus(`Joining room ${joinRoomCode}...`);
        socketClient.send({ type: 'JOIN_ROOM', code: joinRoomCode });
    };

    const handleSocketMessage = (data) => {
        const msg = JSON.parse(data);
        console.log("WS Message Received:", msg);

        switch (msg.type) {
            case 'ROOM_CREATED':
                setRoomCode(msg.code);
                setStatus('Waiting for opponent to join room: ' + msg.code);
                setMatchState(MATCH_STATES.SEARCHING);
                break;

            case 'MATCH_INVITE':
                setInviteReceived({ hostId: msg.hostId, hostName: msg.hostName });
                break;

            case 'RECONNECT_GAME':
                if (initTimer.current) clearTimeout(initTimer.current);
                setSide(msg.side);
                setGameId(msg.gameId);
                setOpponent({
                    id: msg.opponentId,
                    name: msg.opponentName,
                    rating: msg.opponentRating
                });
                setWhiteTime(msg.timeWhite || 600);
                setBlackTime(msg.timeBlack || 600);

                if (msg.chatHistory) {
                    const token = localStorage.getItem('accessToken');
                    const myUser = AuthService.parseToken(token);
                    const parsedChat = msg.chatHistory.map(chatStr => {
                        try {
                            const c = JSON.parse(chatStr);
                            return {
                                sender: c.senderId === myUser.userId ? 'You' : (c.senderName || 'Opponent'),
                                text: c.text
                            };
                        } catch (e) { return null; }
                    }).filter(c => c !== null);
                    setChatMessages(parsedChat);
                }

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
                    setMatchState(MATCH_STATES.INITIALIZING);
                    setStatus('Connected. Select a mode.');
                    // Don't auto-join here, let user decide
                }, 2000);
                break;

            case 'GAME_START':
                if (confirmTimer.current) clearInterval(confirmTimer.current);
                setSide(msg.side);
                setOpponent(prev => ({
                    ...prev,
                    id: msg.opponent || prev?.id,
                    name: msg.opponentName || prev?.name || 'Opponent',
                    rating: msg.opponentRating || prev?.rating || 1200
                }));
                setGameId(msg.gameId);
                setMatchState(MATCH_STATES.COUNTDOWN);
                setWhiteTime(msg.timeLimit || 600);
                setBlackTime(msg.timeLimit || 600);
                setChatMessages([]);
                setRematchOffered(false);
                setRematchSent(false);
                initBoard(msg.side, msg.fen, msg.gameId);
                startStartCountdown();
                break;

            case 'OPPONENT_MOVE':
                if (gameRef.current && boardRef.current) {
                    let moveResult = gameRef.current.move(msg.move.toLowerCase(), { sloppy: true });

                    if (!moveResult && msg.fen) {
                        gameRef.current.load(msg.fen);
                    }

                    boardRef.current.position(gameRef.current.fen());
                    setCurrentTurn(gameRef.current.turn());

                    // Sync opponent's time
                    const oppColorChar = sideRef.current.toLowerCase().startsWith('w') ? 'b' : 'w';
                    if (oppColorChar === 'w') {
                        if (msg.timeRemaining !== undefined) setWhiteTime(msg.timeRemaining);
                    } else {
                        if (msg.timeRemaining !== undefined) setBlackTime(msg.timeRemaining);
                    }
                }
                break;

            case 'ERROR':
                if (boardRef.current && gameRef.current) {
                    boardRef.current.position(gameRef.current.fen());
                    setCurrentTurn(gameRef.current.turn());
                    setStatus(msg.message || "Invalid move! Try again.");
                }
                break;

            case 'GAME_OVER':
                setMatchState(MATCH_STATES.OVER);
                setStatus(`Finished: ${msg.reason} (${msg.result})`);
                break;

            case 'DRAW_OFFERED':
                setDrawOfferReceived(true);
                break;

            case 'DRAW_REJECTED':
                setStatus("Draw offer rejected.");
                setDrawOfferSent(false);
                setTimeout(() => setStatus(isMyTurn() ? "YOUR MOVE" : "WAITING..."), 2000);
                break;

            case 'CHAT_MESSAGE':
                setChatMessages(prev => [...prev, { sender: msg.senderName || 'Opponent', text: msg.text }]);
                break;

            case 'REMATCH_OFFERED':
                setRematchOffered(true);
                break;
            default:
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
        setMatchState(MATCH_STATES.INITIALIZING);
        setStatus('Connected. Select a mode.');
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

                    const promo = move.promotion ? move.promotion : '';
                    const moveCoords = (move.from + move.to + promo).toUpperCase();

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
        const playerSideChar = side.toLowerCase().startsWith('w') ? 'w' : 'b';
        return currentTurn === playerSideChar;
    };

    const handleSendChat = () => {
        if (!chatInput.trim()) return;
        socketClient.send({ type: 'CHAT_MESSAGE', gameId: gameId, text: chatInput });
        setChatMessages(prev => [...prev, { sender: 'You', text: chatInput }]);
        setChatInput('');
    };

    const handleAcceptInvite = () => {
        socketClient.send({ type: 'ACCEPT_INVITE', hostId: inviteReceived.hostId });
        setInviteReceived(null);
    };

    const handleOfferRematch = () => {
        socketClient.send({ type: 'REMATCH_OFFER', gameId: gameId });
        setRematchSent(true);
    };

    const handleAcceptRematch = () => {
        socketClient.send({ type: 'REMATCH_RESPONSE', gameId: gameId, accepted: true });
        setRematchOffered(false);
    };

    const handleResign = () => {
        if (window.confirm("Are you sure you want to resign?")) {
            socketClient.send({ type: 'RESIGN', gameId: gameId });
        }
    };

    const handleOfferDraw = () => {
        socketClient.send({ type: 'DRAW_OFFER', gameId: gameId });
        setDrawOfferSent(true);
        setStatus("Draw offer sent...");
    };

    const handleDrawResponse = (accepted) => {
        socketClient.send({ type: 'DRAW_RESPONSE', gameId: gameId, accepted: accepted });
        setDrawOfferReceived(false);
    };

    const handleAddFriend = async () => {
        if (!opponent?.id) return;
        try {
            const token = await AuthService.getValidToken();
            const userData = AuthService.parseToken(token);
            await FriendService.sendRequest(userData.userId, opponent.id);
            setFriendRequestSent(true);
            setStatus("Friend request sent!");
        } catch (err) {
            setStatus(err.response?.data?.message || err.message || "Failed to send friend request.");
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const myTime = side.toLowerCase().startsWith('w') ? whiteTime : blackTime;
    const oppTime = side.toLowerCase().startsWith('w') ? blackTime : whiteTime;

    return (
        <div className="container">
            <header>
                <h1>Online <span>Match</span>
                    {(matchState === MATCH_STATES.PLAYING || matchState === MATCH_STATES.COUNTDOWN) && (
                        <span style={{ fontSize: '1rem', marginLeft: '20px', color: isMyTurn() ? '#4ade80' : '#f87171' }}>
                            {isMyTurn() ? "● YOUR MOVE" : "○ OPPONENT TURN"}
                        </span>
                    )}
                    {matchState === MATCH_STATES.OVER && (
                        <span style={{ fontSize: '1rem', marginLeft: '20px', color: 'white' }}>
                            ■ MATCH FINISHED
                        </span>
                    )}
                </h1>
            </header>

            {/* Friend Invite Overlay */}
            {inviteReceived && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '30px' }}>
                        <h2>Match Invitation!</h2>
                        <p>{inviteReceived.hostName} has invited you to play.</p>
                        <div className="btn-group" style={{ marginTop: '20px' }}>
                            <button onClick={handleAcceptInvite} className="primary-btn">Accept</button>
                            <button onClick={() => setInviteReceived(null)} className="secondary-btn">Reject</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Draw Offer Overlay */}
            {drawOfferReceived && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '30px' }}>
                        <h2>Draw Offer</h2>
                        <p>{opponent?.name} is offering a draw.</p>
                        <div className="btn-group" style={{ marginTop: '20px' }}>
                            <button onClick={() => handleDrawResponse(true)} className="primary-btn">Accept Draw</button>
                            <button onClick={() => handleDrawResponse(false)} className="secondary-btn">Decline</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="main-layout" style={{ justifyContent: 'center' }}>

                {matchState === MATCH_STATES.PLAYING || matchState === MATCH_STATES.COUNTDOWN || matchState === MATCH_STATES.OVER ? (
                    <>
                        <div className="board-column" style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '0 10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ fontWeight: 'bold' }}>{opponent?.name || 'Opponent'}</div>
                                    {matchState === MATCH_STATES.PLAYING && (
                                        <button
                                            onClick={handleAddFriend}
                                            disabled={friendRequestSent}
                                            style={{ background: 'none', border: '1px solid var(--glass-border)', color: 'var(--accent-blue)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.7rem', cursor: friendRequestSent ? 'default' : 'pointer', opacity: friendRequestSent ? 0.5 : 1 }}
                                        >
                                            {friendRequestSent ? "✓ Requested" : "+ Add Friend"}
                                        </button>
                                    )}
                                    <div style={{ background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '5px', fontFamily: 'monospace', fontSize: '1.2rem', color: !isMyTurn() ? '#f87171' : 'white' }}>
                                        {formatTime(oppTime)}
                                    </div>
                                </div>
                            </div>

                            <div id="board" style={{ width: '500px' }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', padding: '0 10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ fontWeight: 'bold' }}>You</div>
                                    <div style={{ background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '5px', fontFamily: 'monospace', fontSize: '1.2rem', color: isMyTurn() ? '#4ade80' : 'white' }}>
                                        {formatTime(myTime)}
                                    </div>
                                </div>
                            </div>

                            {matchState === MATCH_STATES.COUNTDOWN && (
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)', padding: '20px 40px', borderRadius: '15px', backdropFilter: 'blur(10px)', border: '2px solid var(--accent-purple)', zIndex: 10 }}>
                                    <h1 style={{ fontSize: '4rem', margin: 0, color: 'white' }}>{countdown}</h1>
                                </div>
                            )}

                            {matchState === MATCH_STATES.OVER && (
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.85)', padding: '30px 40px', borderRadius: '15px', backdropFilter: 'blur(10px)', border: '2px solid var(--accent-blue)', zIndex: 10, textAlign: 'center', minWidth: '350px' }}>
                                    <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', color: 'white' }}>GAME OVER</h1>
                                    <p style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-muted)' }}>{status}</p>

                                    <div style={{ marginTop: '20px' }}>
                                        {rematchOffered ? (
                                            <div>
                                                <p style={{ color: '#4ade80', marginBottom: '10px' }}>Opponent offered a rematch!</p>
                                                <button onClick={handleAcceptRematch} className="primary-btn">Accept Rematch</button>
                                            </div>
                                        ) : (
                                            rematchSent ? (
                                                <p style={{ color: 'var(--text-muted)' }}>Rematch offer sent...</p>
                                            ) : (
                                                <button onClick={handleOfferRematch} className="primary-btn">Offer Rematch</button>
                                            )
                                        )}
                                    </div>
                                    <button onClick={() => navigate('/menu')} className="secondary-btn" style={{ marginTop: '10px' }}>Leave Match</button>
                                </div>
                            )}
                        </div>

                        {/* Right Dashboard */}
                        <div className="dashboard-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="glass-panel" style={{ minWidth: '320px' }}>
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
                                    <strong style={{ color: matchState === MATCH_STATES.OVER ? 'white' : (isMyTurn() ? '#4ade80' : '#f87171') }}>
                                        {matchState === MATCH_STATES.PLAYING
                                            ? (isMyTurn() ? "YOUR MOVE" : "WAITING...")
                                            : (matchState === MATCH_STATES.OVER ? "FINISHED" : "GET READY")
                                        }
                                    </strong>
                                </div>
                            </div>

                            {/* Chat Panel */}
                            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3>In-Game Chat</h3>
                                <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '10px', overflowY: 'auto', maxHeight: '200px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    {chatMessages.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Say hi...</span>}
                                    {chatMessages.map((msg, idx) => (
                                        <div key={idx} style={{ textAlign: msg.sender === 'You' ? 'right' : 'left' }}>
                                            <span style={{ fontSize: '0.8rem', color: msg.sender === 'You' ? '#4ade80' : 'var(--accent-blue)', fontWeight: 'bold' }}>{msg.sender}: </span>
                                            <span style={{ fontSize: '0.9rem' }}>{msg.text}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <input
                                        type="text"
                                        className="custom-input"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                                        placeholder="Message..."
                                        style={{ flex: 1, padding: '8px' }}
                                    />
                                    <button onClick={handleSendChat} className="primary-btn" style={{ padding: '8px 15px' }}>Send</button>
                                </div>
                            </div>

                            {/* Game Actions Panel */}
                            {matchState === MATCH_STATES.PLAYING && (
                                <div className="glass-panel" style={{ marginTop: 'auto' }}>
                                    <h3>Game Actions</h3>
                                    <div className="btn-group" style={{ marginTop: '10px' }}>
                                        <button
                                            onClick={handleOfferDraw}
                                            className="secondary-btn"
                                            disabled={drawOfferSent}
                                            style={{ opacity: drawOfferSent ? 0.5 : 1 }}
                                        >
                                            {drawOfferSent ? "Draw Offered" : "Offer Draw"}
                                        </button>
                                        <button onClick={handleResign} className="secondary-btn" style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.2)' }}>Resign</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="glass-panel" style={{ width: '450px', textAlign: 'center', padding: '40px' }}>

                        {matchState === MATCH_STATES.INITIALIZING && (
                            <div>
                                <h2 style={{ marginBottom: '30px' }}>Play Online</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                                        <select
                                            value={matchType}
                                            onChange={(e) => setMatchType(e.target.value)}
                                            className="custom-input"
                                            style={{ padding: '10px', fontSize: '1rem', width: '200px', textAlign: 'center' }}
                                        >
                                            <option value="bullet">Bullet (1 min)</option>
                                            <option value="blitz">Blitz (3 min)</option>
                                            <option value="rapid">Rapid (10 min)</option>
                                            <option value="classical">Classical (30 min)</option>
                                        </select>
                                    </div>
                                    <button onClick={joinMatchmaking} className="primary-btn" style={{ padding: '15px' }}>Find Random Opponent</button>

                                    <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                                        <hr style={{ flex: 1, borderColor: 'var(--glass-border)' }} />
                                        <span style={{ margin: '0 10px', color: 'var(--text-muted)' }}>OR</span>
                                        <hr style={{ flex: 1, borderColor: 'var(--glass-border)' }} />
                                    </div>

                                    <button onClick={handleCreateRoom} className="secondary-btn">Create Private Room</button>

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <input
                                            type="text"
                                            className="custom-input"
                                            placeholder="Room Code"
                                            value={joinRoomCode}
                                            onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                                        />
                                        <button onClick={handleJoinRoom} className="secondary-btn" style={{ flex: 1 }}>Join Room</button>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/menu')} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', marginTop: '30px', fontWeight: 'bold' }}>Back</button>
                            </div>
                        )}

                        {matchState === MATCH_STATES.SEARCHING && (
                            <div className="searching-ui">
                                <div className="loader" style={{ marginBottom: '20px' }}></div>
                                <h2>{status}</h2>
                                {roomCode && (
                                    <div style={{ margin: '20px 0', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Room Code:</span>
                                        <h1 style={{ letterSpacing: '5px', margin: '10px 0', color: 'var(--accent-purple)' }}>{roomCode}</h1>
                                        <span style={{ fontSize: '0.9rem' }}>Share this code with your friend.</span>
                                    </div>
                                )}
                                <button onClick={() => {
                                    setMatchState(MATCH_STATES.INITIALIZING);
                                    setRoomCode('');
                                    socketClient.send({ type: 'LEAVE_QUEUE' });
                                }} className="secondary-btn" style={{ marginTop: '20px' }}>Cancel Search</button>
                            </div>
                        )}

                        {matchState === MATCH_STATES.FOUND && (
                            <div className="found-ui">
                                <h2 style={{ color: 'var(--accent-blue-hover)' }}>Match Found!</h2>
                                <div style={{ margin: '20px 0', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{opponent?.name}</div>
                                    <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{opponent?.country || 'Earth'} • Rating: {opponent?.rating}</div>
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
                                <h2 style={{ color: '#f87171' }}>Match Invalidated</h2>
                                <p style={{ margin: '10px 0' }}>{status}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
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
