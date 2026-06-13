import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { TournamentService } from '../services/TournamentService';
import { ReplayService } from '../services/ReplayService';
import { AuthService } from '../services/AuthService';
import '../index.css';

export default function TournamentDetail() {
    const { tournamentId } = useParams();
    const navigate = useNavigate();
    const [username, setUsername] = useState('User');
    const [userId, setUserId] = useState(null);
    const [tournament, setTournament] = useState(null);
    const [standings, setStandings] = useState([]);
    const [rounds, setRounds] = useState([]);
    const [selectedRoundId, setSelectedRoundId] = useState(null);
    const [pairings, setPairings] = useState([]);
    const [activeTab, setActiveTab] = useState('standings'); // standings, rounds
    const [myPairing, setMyPairing] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkToken = async () => {
            const token = await AuthService.getValidToken();
            if (!token) {
                navigate('/login');
                return;
            }
            const payload = AuthService.parseToken(token);
            if (payload) {
                setUsername(payload.username || 'User');
                setUserId(payload.userId);
            }
        };
        checkToken();
        fetchTournamentDetails();
    }, [tournamentId, navigate]);

    const fetchTournamentDetails = async () => {
        setLoading(true);
        try {
            const details = await TournamentService.getTournamentById(tournamentId);
            setTournament(details);
            
            // Fetch standings
            const std = await TournamentService.getStandings(tournamentId);
            setStandings(std || []);

            // Fetch rounds
            try {
                const rds = await ReplayService.getRounds(tournamentId);
                setRounds(rds || []);
                if (rds && rds.length > 0) {
                    setSelectedRoundId(rds[rds.length - 1].roundId);
                    // fetch pairings for latest round
                    const prs = await ReplayService.getPairings(tournamentId, rds[rds.length - 1].roundId);
                    setPairings(prs || []);
                }
            } catch (err) {
                setRounds([]);
                setPairings([]);
            }

            // Fetch my pairing if ongoing
            if (details.status === 'ONGOING') {
                try {
                    const mp = await TournamentService.getMyPairing(tournamentId);
                    setMyPairing(mp);
                } catch (err) {
                    setMyPairing(null);
                }
            } else {
                setMyPairing(null);
            }
        } catch (err) {
            console.error("Error fetching tournament details", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFetchPairings = async (rId) => {
        setSelectedRoundId(rId);
        try {
            const prs = await ReplayService.getPairings(tournamentId, rId);
            setPairings(prs || []);
        } catch (err) {
            setPairings([]);
        }
    };

    const handleJoin = async () => {
        try {
            await TournamentService.joinTournament(tournamentId);
            alert("Đăng ký tham gia thành công!");
            fetchTournamentDetails();
        } catch (err) {
            alert(err.response?.data?.message || "Đăng ký thất bại!");
        }
    };

    const handleLeave = async () => {
        try {
            await TournamentService.leaveTournament(tournamentId);
            alert("Hủy đăng ký thành công!");
            fetchTournamentDetails();
        } catch (err) {
            alert(err.response?.data?.message || "Hủy đăng ký thất bại!");
        }
    };

    const handleEnterLobby = () => {
        if (myPairing) {
            if (myPairing.inBreak) {
                navigate(`/tournaments/break/${tournamentId}?duration=${myPairing.breakTimeLeftSeconds || 600}`);
            } else {
                navigate(`/tournaments/lobby/${tournamentId}`);
            }
        }
    };

    const isUserRegistered = standings.some(s => s.userId === userId);

    if (loading) {
        return (
            <div className="friends-page-wrapper">
                <Sidebar username={username} />
                <div className="friends-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Đang tải thông tin giải đấu...</div>
                </div>
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="friends-page-wrapper">
                <Sidebar username={username} />
                <div className="friends-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Không tìm thấy giải đấu.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="friends-page-wrapper">
            <Sidebar username={username} />
            
            <div className="friends-content" style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '20px', padding: '20px' }}>
                {/* Back button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button 
                        className="secondary-btn" 
                        onClick={() => navigate('/tournaments')}
                        style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        ⬅️ Danh sách giải đấu
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '30px', width: '100%', flexWrap: 'wrap' }}>
                    {/* Left Column: Info card */}
                    <div style={{ flex: 1, minWidth: '350px' }}>
                        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <h1 style={{ fontSize: '1.8rem', margin: '0 0 10px 0', color: 'var(--text-primary)' }}>{tournament.tournamentName}</h1>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>{tournament.description || 'Không có mô tả.'}</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'var(--text-muted)', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>⏱️ Thể thức: <strong style={{ color: 'var(--text-primary)' }}>{tournament.timeControl}</strong></div>
                                    <div>🔄 Số vòng: <strong style={{ color: 'var(--text-primary)' }}>{tournament.totalRounds}</strong></div>
                                </div>
                                <div>📅 Mở đăng ký: <strong style={{ color: 'var(--text-primary)' }}>{tournament.registrationStart ? new Date(tournament.registrationStart).toLocaleString('vi-VN') : 'Chưa thiết lập'}</strong></div>
                                <div>🔒 Đóng đăng ký: <strong style={{ color: 'var(--text-primary)' }}>{tournament.registrationEnd ? new Date(tournament.registrationEnd).toLocaleString('vi-VN') : 'Chưa thiết lập'}</strong></div>
                                <div>🏁 Khai mạc: <strong style={{ color: 'var(--text-primary)' }}>{tournament.startTime ? new Date(tournament.startTime).toLocaleString('vi-VN') : 'Chưa thiết lập'}</strong></div>
                            </div>

                            <div style={{ marginTop: '10px' }}>
                                {tournament.status === 'REGISTERING' && (
                                    <div>
                                        {isUserRegistered ? (
                                            <button className="secondary-btn" style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }} onClick={handleLeave}>
                                                Hủy đăng ký tham gia
                                            </button>
                                        ) : (
                                            <button className="primary-btn" style={{ width: '100%' }} onClick={handleJoin}>
                                                Đăng ký tham gia
                                            </button>
                                        )}
                                    </div>
                                )}

                                {tournament.status === 'ONGOING' && isUserRegistered && (
                                    <div>
                                        {myPairing ? (
                                            <button
                                                className="primary-btn"
                                                style={{ width: '100%', background: 'var(--accent-purple)', borderColor: 'var(--accent-purple)', color: 'white' }}
                                                onClick={handleEnterLobby}
                                            >
                                                {myPairing.inBreak ? '⏳ GIẢI LAO GIỮA HIỆP (VÀO PHÒNG CHỜ)' : '⚔️ VÀO PHÒNG CHỜ THI ĐẤU'}
                                            </button>
                                        ) : (
                                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '10px', fontStyle: 'italic' }}>
                                                Đang đợi hệ thống ghép cặp vòng đấu mới...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Standings & Rounds tab view */}
                    <div style={{ flex: 2, minWidth: '450px' }}>
                        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '450px' }}>
                            {/* Tabs */}
                            <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', marginBottom: '20px' }}>
                                <button
                                    onClick={() => setActiveTab('standings')}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        color: activeTab === 'standings' ? 'var(--accent-blue-hover)' : 'var(--text-muted)',
                                        borderBottom: activeTab === 'standings' ? '2px solid var(--accent-blue)' : 'none',
                                        borderRadius: 0,
                                        padding: '12px',
                                        fontWeight: activeTab === 'standings' ? 'bold' : 'normal'
                                    }}
                                >
                                    🏆 Bảng xếp hạng
                                </button>
                                <button
                                    onClick={() => setActiveTab('rounds')}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        color: activeTab === 'rounds' ? 'var(--accent-blue-hover)' : 'var(--text-muted)',
                                        borderBottom: activeTab === 'rounds' ? '2px solid var(--accent-blue)' : 'none',
                                        borderRadius: 0,
                                        padding: '12px',
                                        fontWeight: activeTab === 'rounds' ? 'bold' : 'normal'
                                    }}
                                >
                                    🔄 Vòng đấu & Trận đấu
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {activeTab === 'standings' ? (
                                    <div>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', textAlign: 'left' }}>
                                                    <th style={{ padding: '10px' }}>Hạng</th>
                                                    <th style={{ padding: '10px' }}>Kỳ thủ</th>
                                                    <th style={{ padding: '10px' }}>Elo</th>
                                                    <th style={{ padding: '10px', textAlign: 'center' }}>Điểm</th>
                                                    <th style={{ padding: '10px', textAlign: 'center' }}>BH</th>
                                                    <th style={{ padding: '10px', textAlign: 'center' }}>SB</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {standings.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Chưa có kỳ thủ nào đăng ký.</td>
                                                    </tr>
                                                ) : (
                                                    standings.map((p, idx) => (
                                                        <tr key={p.userId} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', background: p.userId === userId ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                                                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{idx + 1}</td>
                                                            <td style={{ padding: '10px', fontWeight: p.userId === userId ? 'bold' : 'normal' }}>{p.username} {p.userId === userId && '(Bạn)'}</td>
                                                            <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{p.initialRating}</td>
                                                            <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: 'var(--accent-blue-hover)' }}>{p.currentScore}</td>
                                                            <td style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>{p.buchholz}</td>
                                                            <td style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>{p.sonnebornBerger}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div>
                                        {rounds.length === 0 ? (
                                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>
                                                {tournament.status === 'REGISTERING' ? 'Vòng đấu sẽ được tạo tự động khi giải đấu bắt đầu.' : 'Thông tin vòng đấu chưa có hoặc không khả dụng.'}
                                            </p>
                                        ) : (
                                            <div>
                                                {/* Rounds selector */}
                                                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
                                                    {rounds.map(r => (
                                                        <button
                                                            key={r.roundId}
                                                            onClick={() => handleFetchPairings(r.roundId)}
                                                            className={selectedRoundId === r.roundId ? 'primary-btn' : 'secondary-btn'}
                                                            style={{ padding: '6px 12px', fontSize: '0.8rem', flex: 'none' }}
                                                        >
                                                            Vòng {r.roundNumber}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Pairings list */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {pairings.length === 0 ? (
                                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Không có cặp đấu nào trong vòng này.</p>
                                                    ) : (
                                                        pairings.map(p => (
                                                            <div key={p.pairingId} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 15px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                                                                    <div style={{ flex: 1 }}>
                                                                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{p.whitePlayerName}</span>
                                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '5px' }}>({p.whitePlayerRating})</span>
                                                                    </div>
                                                                    <div style={{ flex: 'none', width: '70px', textAlign: 'center', fontWeight: 'bold', color: 'var(--accent-purple)', fontSize: '0.95rem' }}>
                                                                        {p.isBye ? 'BYE' : p.result || 'vs'}
                                                                    </div>
                                                                    <div style={{ flex: 1, textAlign: 'right' }}>
                                                                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{p.blackPlayerName}</span>
                                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '5px' }}>{p.blackPlayerId ? `(${p.blackPlayerRating})` : ''}</span>
                                                                    </div>
                                                                </div>

                                                                {p.gameId && (
                                                                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                                                                        <button
                                                                            className="primary-btn"
                                                                            style={{ padding: '4px 10px', fontSize: '0.75rem', flex: 'none' }}
                                                                            onClick={() => navigate(`/replay/${p.gameId}`)}
                                                                        >
                                                                            Xem Replay
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
