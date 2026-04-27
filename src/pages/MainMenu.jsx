import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

export default function MainMenu() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <header>
                <h1>Choose <span>Mode</span></h1>
                <p>Welcome to Chess Online</p>
            </header>
            
            <div className="glass-panel" style={{ width: '400px', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                    <button onClick={() => navigate('/play-ai')} className="primary-btn" style={{ padding: '15px', fontSize: '1.1rem' }}>
                        Play vs AI (AlphaOne)
                    </button>
                    
                    <button onClick={() => navigate('/play-online')} className="secondary-btn" style={{ padding: '15px', fontSize: '1.1rem' }}>
                        Play Online (Multiplayer)
                    </button>
                </div>

                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                    <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
