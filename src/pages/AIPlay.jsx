import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../index.css';

function App() {
  const [mode, setMode] = useState('human-white');
  const [status, setStatus] = useState('Initializing...');
  const [depth, setDepth] = useState('-');
  const [topLines, setTopLines] = useState([]);
  const [evalValue, setEvalValue] = useState(0);
  const [simulations, setSimulations] = useState(800);
  const [temperature, setTemperature] = useState(0.3);
  
  const [models, setModels] = useState([]);
  const [whiteModel, setWhiteModel] = useState('');
  const [blackModel, setBlackModel] = useState('');
  
  const isWait = useRef(false);
  const currentLoopId = useRef(0);
  const gameRef = useRef(null);
  const boardRef = useRef(null);
  const modeRef = useRef('human-white');

  // Keep references fresh for vanilla JS callbacks
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    // Initialize vanilla objects
    if (!window.Chess || !window.Chessboard) {
      setStatus('waiting for scripts to load...');
      return;
    }

    gameRef.current = new window.Chess();
    
    const onDragStart = (source, piece, position, orientation) => {
      if (isWait.current) return false;
      if (gameRef.current.game_over()) return false;

      if ((gameRef.current.turn() === 'w' && piece.search(/^b/) !== -1) ||
          (gameRef.current.turn() === 'b' && piece.search(/^w/) !== -1)) {
          return false;
      }

      if (modeRef.current === 'ai-ai') return false;
      if (modeRef.current === 'human-white' && gameRef.current.turn() === 'b') return false;
      if (modeRef.current === 'human-black' && gameRef.current.turn() === 'w') return false;
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
      setStatus('Sending move...');

      try {
          const res = await axios.post('/api/move', { move: move.san });
          const state = res.data;

          const over = checkGameStatus(state);
          if (!over) {
              if (modeRef.current === 'human-white' || modeRef.current === 'human-black') {
                  setTimeout(() => triggerAIMove(currentLoopId.current), 200);
              } else {
                  isWait.current = false;
              }
          }
      } catch (e) {
          console.error(e);
          gameRef.current.undo();
          return 'snapback';
      }
    };

    const onSnapEnd = () => {
      if(boardRef.current && gameRef.current) {
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

    // Need a tiny delay to ensure the #board div is fully rendered by React
    setTimeout(() => {
      if (document.getElementById('board')) {
        boardRef.current = window.Chessboard('board', config);
      }
    }, 100);

    // Initial API fetches
    loadModels();
    resetGameBackend();
    
  }, []);

  const loadModels = async () => {
    try {
      const res = await axios.get('/api/models');
      setModels(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const resetGameBackend = async () => {
    try {
      const res = await axios.post('/api/reset');
      checkGameStatus(res.data);
      if (modeRef.current === 'human-white') setStatus('Your Turn');
    } catch(e) {
      console.error(e);
    }
  };

  const checkGameStatus = (stateData) => {
    if (!gameRef.current || !boardRef.current) return false;
    
    gameRef.current.load(stateData.fen);
    boardRef.current.position(stateData.fen);
    setEvalValue(stateData.value);

    if (stateData.mcts_stats) {
      setDepth(stateData.depth || '-');
      if (stateData.mcts_stats.length > 0) {
        setTopLines(stateData.mcts_stats);
      } else {
        setTopLines([]);
      }
    }

    if (stateData.game_over || gameRef.current.game_over()) {
      setStatus(`Game Over`);
      isWait.current = true;
      return true;
    }
    return false;
  };

  const getPercentage = () => {
    return Math.max(0, Math.min(100, ((evalValue + 1) / 2) * 100));
  };

  const getEvalText = () => {
    const cp = evalValue * 100;
    return `${cp > 0 ? "+" : ""}${cp.toFixed(1)}`;
  };

  const triggerAIMove = async (loopId) => {
    if (loopId !== currentLoopId.current) return;

    isWait.current = true;
    setStatus('AI Thinking...');

    try {
      const res = await axios.post('/api/ai_move', {
          simulations: simulations,
          temperature: temperature,
          white_model: whiteModel,
          black_model: blackModel
      });
      const state = res.data;
      const over = checkGameStatus(state);

      if (!over) {
          setStatus('Your Turn');
          isWait.current = false;

          if (modeRef.current === 'ai-ai') {
              setTimeout(() => triggerAIMove(currentLoopId.current), 500);
          }
      }
    } catch (e) {
      console.error(e);
      setStatus('Error connecting to backend');
      isWait.current = false;
    }
  };

  const handleStartFreshGame = async () => {
    isWait.current = true;
    currentLoopId.current++; // Invalidates old loops
    setStatus('Resetting Board...');

    try {
      const res = await axios.post('/api/reset');
      const state = res.data;
      
      gameRef.current.reset();
      boardRef.current.position(state.fen);
      setEvalValue(state.value);
      setTopLines([]);
      setDepth(1);

      if (mode === 'human-black') {
          boardRef.current.orientation('black');
          triggerAIMove(currentLoopId.current);
      } else if (mode === 'ai-ai') {
          boardRef.current.orientation('white');
          triggerAIMove(currentLoopId.current);
      } else {
          boardRef.current.orientation('white');
          setStatus('Your Turn');
          isWait.current = false;
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container">
        <header>
            <h1>AlphaOne <span>Engine</span></h1>
            <p>Dual Head ResNet + MCTS via PyTorch</p>
        </header>

        <div className="main-layout">
            <div className="board-column">
                <div className="eval-wrapper">
                    <div className="eval-bar" id="evalBar">
                        <div 
                          className="eval-fill" 
                          id="evalFill" 
                          style={{ height: `${getPercentage()}%` }}
                        ></div>
                    </div>
                    <div className="eval-text" id="evalText">{getEvalText()}</div>
                </div>
                {/* The board target for vanilla chessboardjs */}
                <div id="board" style={{ width: '500px' }}></div>
            </div>

            <div className="dashboard-column">
                <div className="glass-panel">
                    <h2>Game Controls</h2>
                    
                    <div className="control-group">
                        <label>Mode</label>
                        <select value={mode} onChange={e => setMode(e.target.value)}>
                            <option value="human-white">Human (White) vs AI</option>
                            <option value="human-black">AI vs Human (Black)</option>
                            <option value="ai-ai">AI vs AI</option>
                        </select>
                    </div>

                    <div className="control-grid">
                        <div className="control-group">
                            <label>White Model</label>
                            <select value={whiteModel} onChange={e => setWhiteModel(e.target.value)}>
                                <option value="">Default (Latest)</option>
                                {models.map(m => (
                                  <option key={`white-${m.path}`} value={m.path}>{m.stage}: {m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="control-group">
                            <label>Black Model</label>
                            <select value={blackModel} onChange={e => setBlackModel(e.target.value)}>
                                <option value="">Default (Latest)</option>
                                {models.map(m => (
                                  <option key={`black-${m.path}`} value={m.path}>{m.stage}: {m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="control-group">
                        <label>Simulations (GPUs): <span>{simulations}</span></label>
                        <input 
                          type="range" 
                          min="10" 
                          max="2000" 
                          step="10" 
                          value={simulations} 
                          onChange={e => setSimulations(e.target.value)} 
                        />
                    </div>

                    <div className="control-group">
                        <label>Temperature (&tau;): <span>{temperature}</span></label>
                        <input 
                          type="range" 
                          min="0.0" 
                          max="1.5" 
                          step="0.1" 
                          value={temperature} 
                          onChange={e => setTemperature(e.target.value)} 
                        />
                    </div>

                    <div className="btn-group">
                        <button onClick={handleStartFreshGame} className="primary-btn">Start Game</button>
                        <button onClick={() => triggerAIMove(currentLoopId.current)} className="secondary-btn">Force AI Move</button>
                    </div>
                </div>

                <div className="glass-panel mcts-panel">
                    <h2>MCTS Dashboard</h2>
                    <div className="stats-grid">
                        <div className="stat-box">
                            <span>Status</span>
                            <strong>{status}</strong>
                        </div>
                        <div className="stat-box">
                            <span>Depth</span>
                            <strong>{depth}</strong>
                        </div>
                    </div>
                    
                    <h3>Top Lines</h3>
                    <ul className="top-lines">
                        {topLines.length > 0 ? (
                            topLines.map((stat, idx) => (
                                <li key={idx}>
                                    <span>{stat.move}</span> 
                                    <span className="stats">N: {stat.N} | P: {stat.P}%</span>
                                </li>
                            ))
                        ) : (
                            <li><span>-</span> <span className="stats">N: 0 | P: 0%</span></li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );
}

export default App;
