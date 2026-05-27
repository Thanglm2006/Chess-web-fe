import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiGameService } from '../services/AiGameService';
import '../index.css';

function App() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('human-white'); // 'human-white' or 'human-black'
  const [status, setStatus] = useState('Select your settings and click Start Game');
  const [difficulty, setDifficulty] = useState(3); // 1 = Easy, 2 = Medium, 3 = Hard, 4 = Expert
  const [gameId, setGameId] = useState(null);
  
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('best_model');
  const [gameHistory, setGameHistory] = useState([]);
  
  const isWait = useRef(false);
  const gameRef = useRef(null);
  const boardRef = useRef(null);
  const modeRef = useRef('human-white');
  const gameIdRef = useRef(null);

  // Keep references fresh for vanilla JS callbacks
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    gameIdRef.current = gameId;
  }, [gameId]);

  useEffect(() => {
    // Initialize vanilla chess/chessboard objects
    if (!window.Chess || !window.Chessboard) {
      setStatus('Waiting for chess engine scripts to load...');
      return;
    }

    gameRef.current = new window.Chess();
    
    const onDragStart = (source, piece, position, orientation) => {
      if (isWait.current) return false;
      if (gameRef.current.game_over()) return false;
      if (!gameIdRef.current) return false; // Game must be started on backend

      // Ensure player can only move their own color pieces
      if (modeRef.current === 'human-white' && piece.search(/^b/) !== -1) return false;
      if (modeRef.current === 'human-black' && piece.search(/^w/) !== -1) return false;
      
      // Ensure player only moves when it is their turn
      const turn = gameRef.current.turn(); // 'w' or 'b'
      if (modeRef.current === 'human-white' && turn === 'b') return false;
      if (modeRef.current === 'human-black' && turn === 'w') return false;

      return true;
    };

    const onDrop = async (source, target) => {
      let move = gameRef.current.move({
          from: source,
          to: target,
          promotion: 'q'
      });

      if (move === null) return 'snapback';

      isWait.current = true;
      setStatus('AI is calculating its response...');

      // Update history immediately for instant responsive feedback
      const prevHistory = [...gameHistory];
      if (move.san) {
        setGameHistory(prev => [...prev, move.san]);
      }

      // Redraw board immediately to show user's move
      if (boardRef.current) {
        boardRef.current.position(gameRef.current.fen());
      }

      try {
          const state = await AiGameService.makeMove(gameIdRef.current, move.san);
          
          // Apply server's new state (contains both player's move and AI's counter-move)
          updateGameStatus(state);
      } catch (e) {
          console.error(e);
          setStatus(e.response?.data?.message || 'Move rejected or AI service offline.');
          isWait.current = false;
          
          // Roll back local move on failure
          gameRef.current.undo();
          setGameHistory(prevHistory);
          
          // Trigger board redraw to reset incorrect move
          if (boardRef.current && gameRef.current) {
            boardRef.current.position(gameRef.current.fen());
          }
          return 'snapback';
      }
    };

    const onSnapEnd = () => {
      if (boardRef.current && gameRef.current) {
        boardRef.current.position(gameRef.current.fen());
      }
    };

    const config = {
      draggable: true,
      position: 'start',
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: onSnapEnd,
      pieceTheme: '/chessPieces/{piece}.png'
    };

    // Tiny delay to ensure board container is loaded in DOM
    setTimeout(() => {
      if (document.getElementById('board')) {
        boardRef.current = window.Chessboard('board', config);
        
        // Auto-check and resume active game if any exists
        resumeActiveGame();
      }
    }, 150);

    // Fetch available checkpoints
    loadModels();
    
  }, []);

  const loadModels = async () => {
    try {
      const data = await AiGameService.getModels();
      const modelList = Array.isArray(data) ? data : (data.models || []);
      setModels(modelList);
      
      const defaultKey = data.default || (modelList[0]?.key || 'best_model');
      setSelectedModel(defaultKey);
    } catch (e) {
      console.error('Failed to load AI checkpoints', e);
    }
  };

  const resumeActiveGame = async () => {
    try {
      const active = await AiGameService.getActiveGame();
      if (active) {
        setGameId(active.gameId);
        const playerCol = active.playerColor; // "WHITE" or "BLACK"
        setMode(playerCol === 'WHITE' ? 'human-white' : 'human-black');
        setDifficulty(active.difficulty);
        setSelectedModel(active.aiModel);
        setGameHistory(active.history || []);

        if (gameRef.current && boardRef.current) {
          gameRef.current.load(active.fen);
          boardRef.current.position(active.fen);
          boardRef.current.orientation(playerCol.toLowerCase());
        }
        
        setStatus('Resumed active game! Your turn.');
        isWait.current = false;
      }
    } catch (e) {
      console.error('Error checking active game session:', e);
    }
  };

  const updateGameStatus = (stateData) => {
    if (!gameRef.current || !boardRef.current) return;
    
    // Load FEN state from backend
    gameRef.current.load(stateData.fen);
    boardRef.current.position(stateData.fen);

    if (stateData.isGameOver || stateData.is_game_over) {
      const resultText = stateData.result ? ` [Result: ${stateData.result}]` : '';
      setStatus(`Game Over! ${stateData.termination || 'Match complete.'}${resultText}`);
      setGameId(null);
      isWait.current = true;
    } else {
      setStatus('Your Turn');
      isWait.current = false;
    }

    // Refresh history
    fetchHistoryDetails(stateData.gameId);
  };

  const fetchHistoryDetails = async (gId) => {
    if (!gId) return;
    try {
      const details = await AiGameService.getGameDetails(gId);
      if (details && details.history) {
        setGameHistory(details.history);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartFreshGame = async () => {
    isWait.current = true;
    setStatus('Initializing board and contacting AI backend...');

    const playerColor = mode === 'human-white' ? 'WHITE' : 'BLACK';

    try {
      const state = await AiGameService.startGame(selectedModel, difficulty, playerColor);
      
      setGameId(state.gameId);
      setGameHistory([]);

      if (gameRef.current && boardRef.current) {
        gameRef.current.reset();
        gameRef.current.load(state.fen);
        boardRef.current.position(state.fen);
        boardRef.current.orientation(playerColor.toLowerCase());
      }

      if (state.isGameOver) {
        setStatus(`Game ended quickly. Result: ${state.result}`);
        setGameId(null);
        isWait.current = true;
      } else {
        if (playerColor === 'BLACK' && state.aiFirstMove) {
          setStatus(`AI opened with ${state.aiFirstMove}. Your turn!`);
          setGameHistory([state.aiFirstMove]);
        } else {
          setStatus('Game started! Your turn.');
        }
        isWait.current = false;
      }
    } catch (e) {
      console.error(e);
      setStatus('Failed to start AI game. Ensure your backend is running.');
      isWait.current = false;
    }
  };

  const handleResign = async () => {
    if (!gameId) return;
    if (window.confirm('Are you sure you want to resign this game?')) {
      try {
        const res = await AiGameService.resignGame(gameId);
        setStatus(`You resigned. Result: ${res.result} (AI wins)`);
        setGameId(null);
        isWait.current = true;
      } catch (e) {
        console.error(e);
        setStatus('Failed to resign game.');
      }
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Play <span>with AI</span></h1>
      </header>

      <div className="main-layout" style={{ justifyContent: 'center' }}>
        {/* Board Column */}
        <div className="board-column" style={{ position: 'relative' }}>
          {/* Top Player (AI Player Metadata) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '0 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--accent-blue)' }}>
                AI Checkpoint: {selectedModel} (Diff: {difficulty})
              </div>
            </div>
          </div>

          <div id="board" style={{ width: '600px' }}></div>

          {/* Bottom Player (Human Player Metadata) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', padding: '0 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#4ade80' }}>You</div>
            </div>
          </div>
        </div>

        {/* Dashboard Column */}
        <div className="dashboard-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Match Settings Panel / Game State Info */}
          <div className="glass-panel" style={{ minWidth: '320px' }}>
            <h2>Match Settings</h2>
            
            {!gameId ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="stat-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Side Selection</span>
                  <select 
                    value={mode} 
                    onChange={e => setMode(e.target.value)}
                    className="custom-input"
                    style={{ width: '100%', padding: '8px' }}
                  >
                    <option value="human-white">Play as White (AI plays Black)</option>
                    <option value="human-black">Play as Black (AI plays White)</option>
                  </select>
                </div>

                <div className="stat-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Neural Checkpoint</span>
                  <select 
                    value={selectedModel} 
                    onChange={e => setSelectedModel(e.target.value)}
                    className="custom-input"
                    style={{ width: '100%', padding: '8px' }}
                  >
                    <option value="best_model">Default Best Model</option>
                    {models.map(m => (
                      <option key={`model-${m.key}`} value={m.key}>
                        {m.display || m.key}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="stat-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>AI Difficulty</span>
                  <select 
                    value={difficulty} 
                    onChange={e => setDifficulty(Number(e.target.value))}
                    className="custom-input"
                    style={{ width: '100%', padding: '8px' }}
                  >
                    <option value={1}>Easy (Fast/Intuitive)</option>
                    <option value={2}>Medium (Positional)</option>
                    <option value={3}>Hard (ResNet Tactical)</option>
                    <option value={4}>Expert (Deep MCTS Search)</option>
                  </select>
                </div>

                <button onClick={handleStartFreshGame} className="primary-btn" style={{ padding: '12px', marginTop: '10px' }}>
                  Start Match
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="stat-box">
                  <span>Engine Checkpoint</span>
                  <strong>{selectedModel}</strong>
                </div>
                <div className="stat-box">
                  <span>Difficulty Level</span>
                  <strong>{difficulty === 1 ? 'Easy' : difficulty === 2 ? 'Medium' : difficulty === 3 ? 'Hard' : 'Expert'}</strong>
                </div>
                <div className="stat-box">
                  <span>Match Status</span>
                  <strong style={{ color: isWait.current ? '#f87171' : '#4ade80' }}>
                    {isWait.current ? "AI THINKING..." : "YOUR TURN"}
                  </strong>
                </div>
                <button onClick={handleResign} className="secondary-btn" style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.2)', padding: '12px' }}>
                  Resign Match
                </button>
              </div>
            )}
          </div>

          {/* Status Info Box */}
          <div className="glass-panel" style={{ padding: '15px' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Engine Output / Logs</span>
            <strong style={{ fontSize: '1rem', color: '#4ade80' }}>{status}</strong>
          </div>

          {/* Move History Panel */}
          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '200px' }}>
            <h3>Move History</h3>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '10px', overflowY: 'auto', maxHeight: '180px' }}>
              {gameHistory.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '5px', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                  {Array.from({ length: Math.ceil(gameHistory.length / 2) }).map((_, idx) => (
                    <React.Fragment key={idx}>
                      <div style={{ color: 'var(--text-muted)' }}>
                        {idx + 1}. <span style={{ color: 'white', fontWeight: 'bold' }}>{gameHistory[idx * 2]}</span>
                      </div>
                      <div>
                        {gameHistory[idx * 2 + 1] ? (
                          <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>{gameHistory[idx * 2 + 1]}</span>
                        ) : (
                          '-'
                        )}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No moves played yet.</span>
              )}
            </div>
          </div>

          {/* Back to main menu */}
          {!gameId && (
            <button onClick={() => navigate('/menu')} className="secondary-btn" style={{ color: '#f87171', border: 'none', cursor: 'pointer', padding: '10px', fontWeight: 'bold' }}>
              ← Back to Menu
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;