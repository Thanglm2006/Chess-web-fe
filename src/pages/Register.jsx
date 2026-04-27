import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/AuthService';

export default function Register() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [country, setCountry] = useState('VN - Việt Nam');
    
    const [otpStep, setOtpStep] = useState(false);
    const [otp, setOtp] = useState('');
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const countries = ["VN - Việt Nam", "US - Hoa Kỳ", "UK - Vương quốc Anh", "JP - Nhật Bản", "KR - Hàn Quốc", "CN - Trung Quốc"];

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirm) {
            return setError('Passwords do not match');
        }
        
        setLoading(true);
        setError('');
        try {
            const code = country.substring(0, 2);
            await AuthService.register(username, email, password, confirm, code);
            setOtpStep(true);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await AuthService.verifyOTP(email, otp.trim());
            alert('Registration successful! You can now login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '10px', borderRadius: '6px', 
        border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white'
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <header>
                <h1>Create <span>Account</span></h1>
            </header>
            <div className="glass-panel" style={{ width: '450px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {!otpStep ? (
                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="control-group">
                            <label>Email</label>
                            <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="control-group">
                            <label>Username</label>
                            <input type="text" style={inputStyle} value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                        <div className="control-group">
                            <label>Password</label>
                            <input type="password" style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <div className="control-group">
                            <label>Confirm Password</label>
                            <input type="password" style={inputStyle} value={confirm} onChange={e => setConfirm(e.target.value)} required />
                        </div>
                        <div className="control-group">
                            <label>Country</label>
                            <select style={inputStyle} value={country} onChange={e => setCountry(e.target.value)}>
                                {countries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        
                        {error && <div style={{color: '#ef4444', fontSize: '0.9rem'}}>{error}</div>}

                        <div className="btn-group" style={{marginTop: '10px'}}>
                            <button type="submit" className="primary-btn" disabled={loading}>
                                {loading ? 'Processing...' : 'Register'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="control-group">
                            <label>Enter Verification Code (OTP) sent to {email}</label>
                            <input type="text" style={inputStyle} value={otp} onChange={e => setOtp(e.target.value)} required />
                        </div>
                        
                        {error && <div style={{color: '#ef4444', fontSize: '0.9rem'}}>{error}</div>}

                        <div className="btn-group" style={{marginTop: '10px'}}>
                            <button type="submit" className="primary-btn" disabled={loading}>
                                {loading ? 'Verifying...' : 'Submit OTP'}
                            </button>
                        </div>
                    </form>
                )}

                <div style={{textAlign: 'center', marginTop: '10px'}}>
                    <Link to="/login" style={{color: 'var(--accent-blue-hover)', textDecoration: 'none'}}>
                        Already have an account? Login.
                    </Link>
                </div>
            </div>
        </div>
    );
}
