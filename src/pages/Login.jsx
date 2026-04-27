import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import '../index.css';

export default function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/menu');
        }

        /* global google */
        if (typeof google !== 'undefined' && !window.googleInitialized) {
            google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse
            });
            window.googleInitialized = true;
        }
        if (typeof google !== 'undefined') {
          google.accounts.id.renderButton(
              document.getElementById("googleBtnContainer"),
              { theme: "outline", size: "large", width: 320 }
          );
        }
    }, []);

    const handleGoogleResponse = async (response) => {
        setLoading(true);
        setError('');
        try {
            const data = await AuthService.googleLogin(response.credential);
            if (data && data.token) {
                localStorage.setItem('token', data.token);
                navigate('/menu');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Google login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await AuthService.login(identifier, password);
            if (data && data.token) {
                localStorage.setItem('token', data.token);
                navigate('/menu');
            } else {
                setError('Login failed. No token received.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <header>
                <h1>Chess <span>Login</span></h1>
            </header>
            <div className="glass-panel" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <div className="control-group">
                        <label>Email or Username</label>
                        <input 
                            type="text" 
                            style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white'}}
                            value={identifier} 
                            onChange={e => setIdentifier(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="control-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white'}}
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                        />
                    </div>

                    {error && <div style={{color: '#ef4444', fontSize: '0.9rem'}}>{error}</div>}

                    <div className="btn-group" style={{marginTop: '10px'}}>
                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </form>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    <div id="googleBtnContainer"></div>
                </div>

                <div style={{textAlign: 'center', marginTop: '10px'}}>
                    <Link to="/register" style={{color: 'var(--accent-blue-hover)', textDecoration: 'none'}}>
                        Don't have an account? Register here.
                    </Link>
                </div>
            </div>
        </div>
    );
}
