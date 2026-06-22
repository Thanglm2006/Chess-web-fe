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
            return setError('Mật khẩu không khớp');
        }
        
        setLoading(true);
        setError('');
        try {
            const code = country.substring(0, 2);
            await AuthService.register(username, email, password, confirm, code);
            setOtpStep(true);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Đăng ký thất bại');
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
            alert('Đăng ký thành công! Bây giờ bạn có thể đăng nhập.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Xác thực OTP thất bại');
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
                <h1>Tạo <span>Tài khoản</span></h1>
            </header>
            <div className="glass-panel" style={{ width: '450px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {!otpStep ? (
                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="control-group">
                            <label>Email</label>
                            <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="control-group">
                            <label>Tên đăng nhập</label>
                            <input type="text" style={inputStyle} value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                        <div className="control-group">
                            <label>Mật khẩu</label>
                            <input type="password" style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <div className="control-group">
                            <label>Xác nhận mật khẩu</label>
                            <input type="password" style={inputStyle} value={confirm} onChange={e => setConfirm(e.target.value)} required />
                        </div>
                        <div className="control-group">
                            <label>Quốc gia</label>
                            <select style={inputStyle} value={country} onChange={e => setCountry(e.target.value)}>
                                {countries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        
                        {error && <div style={{color: '#ef4444', fontSize: '0.9rem'}}>{error}</div>}

                        <div className="btn-group" style={{marginTop: '10px'}}>
                            <button type="submit" className="primary-btn" disabled={loading}>
                                {loading ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="control-group">
                            <label>Nhập mã xác thực (OTP) đã gửi đến {email}</label>
                            <input type="text" style={inputStyle} value={otp} onChange={e => setOtp(e.target.value)} required />
                        </div>
                        
                        {error && <div style={{color: '#ef4444', fontSize: '0.9rem'}}>{error}</div>}

                        <div className="btn-group" style={{marginTop: '10px'}}>
                            <button type="submit" className="primary-btn" disabled={loading}>
                                {loading ? 'Đang xác thực...' : 'Xác nhận OTP'}
                            </button>
                        </div>
                    </form>
                )}

                <div style={{textAlign: 'center', marginTop: '10px'}}>
                    <Link to="/login" style={{color: 'var(--accent-blue-hover)', textDecoration: 'none'}}>
                        Đã có tài khoản? Đăng nhập.
                    </Link>
                </div>
            </div>
        </div>
    );
}
