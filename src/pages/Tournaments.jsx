import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { TournamentService } from '../services/TournamentService';
import { ReplayService } from '../services/ReplayService';
import { AuthService } from '../services/AuthService';
import '../index.css';

export default function Tournaments() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('User');
    const [userId, setUserId] = useState(null);
    const [tournaments, setTournaments] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [tournament, setTournament] = useState(null);
    const [standings, setStandings] = useState([]);
    const [rounds, setRounds] = useState([]);
    const [selectedRoundId, setSelectedRoundId] = useState(null);
    const [pairings, setPairings] = useState([]);
    const [activeTab, setActiveTab] = useState('standings'); // standings, rounds
    const [listTab, setListTab] = useState('all'); // all, registering, ongoing, finished

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
        fetchTournaments();
    }, [navigate]);

    const fetchTournaments = async () => {
        try {
            const list = await TournamentService.getAllTournaments();
            setTournaments(list || []);
        } catch (err) {
            console.error("Failed to fetch tournaments", err);
        }
    };

    const handleSelectTournament = async (tId) => {
        setSelectedId(tId);
        try {
            const details = await TournamentService.getTournamentById(tId);
            setTournament(details);
            
            // Fetch standings
            const std = await TournamentService.getStandings(tId);
            setStandings(std || []);

            // Fetch rounds if ongoing or finished (otherwise catch 403 gracefully)
            try {
                const rds = await ReplayService.getRounds(tId);
                setRounds(rds || []);
                if (rds && rds.length > 0) {
                    setSelectedRoundId(rds[rds.length - 1].roundId);
                    handleFetchPairings(tId, rds[rds.length - 1].roundId);
                } else {
                    setPairings([]);
                }
            } catch (err) {
                // If 403, it means the tournament isn't finished yet or rounds aren't available
                setRounds([]);
                setPairings([]);
            }
        } catch (err) {
            console.error("Error fetching tournament details", err);
        }
    };

    const handleFetchPairings = async (tId, rId) => {
        setSelectedRoundId(rId);
        try {
            const prs = await ReplayService.getPairings(tId, rId);
            setPairings(prs || []);
        } catch (err) {
            setPairings([]);
        }
    };

    const handleJoin = async () => {
        try {
            await TournamentService.joinTournament(selectedId);
            alert("Đăng ký tham gia thành công!");
            handleSelectTournament(selectedId);
        } catch (err) {
            alert(err.response?.data?.message || "Đăng ký thất bại!");
        }
    };

    const handleLeave = async () => {
        try {
            await TournamentService.leaveTournament(selectedId);
            alert("Hủy đăng ký thành công!");
            handleSelectTournament(selectedId);
        } catch (err) {
            alert(err.response?.data?.message || "Hủy đăng ký thất bại!");
        }
    };

    const isUserRegistered = standings.some(s => s.userId === userId);

    const filteredTournaments = tournaments.filter(t => {
        if (listTab === 'all') return true;
        return t.status.toLowerCase() === listTab;
    });

    return (
        <div className="friends-page-wrapper">
            <Sidebar username={username} />
            
            <div className="friends-content" style={{ display: 'flex', gap: '30px', width: '100%' }}>
                {/* Main list column */}
                <div className="friends-main-col" style={{ flex: 3 }}>
                    <div className="friends-header">
                        <h1>🏆 Giải đấu cờ vua</h1>
                    </div>

                    {/* Filter tabs */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        {['all', 'registering', 'ongoing', 'finished'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setListTab(tab)}
                                className={listTab === tab ? 'primary-btn' : 'secondary-btn'}
                                style={{ padding: '8px 15px', textTransform: 'capitalize', fontSize: '0.85rem' }}
                            >
                                {tab === 'all' ? 'Tất cả' : tab === 'registering' ? 'Mở đăng ký' : tab === 'ongoing' ? 'Đang diễn ra' : 'Đã kết thúc'}
                            </button>
                        ))}
                    </div>

                    {/* Tournament list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredTournaments.length === 0 ? (
                            <div className="glass-panel" style={{ width: '100%', textAlign: 'center', padding: '40px' }}>
                                <p style={{ color: 'var(--text-muted)' }}>Không tìm thấy giải đấu nào.</p>
                            </div>
                        ) : (
                            filteredTournaments.map(t => (
                                <div
                                    key={t.tournamentId}
                                    className={`glass-panel friend-item ${selectedId === t.tournamentId ? 'active' : ''}`}
                                    style={{
                                        width: '100%',
                                        cursor: 'pointer',
                                        border: selectedId === t.tournamentId ? '1px solid var(--accent-blue)' : '1px solid var(--glass-border)',
                                        background: selectedId === t.tournamentId ? 'rgba(59, 130, 246, 0.1)' : 'var(--panel-bg)'
                                    }}
                                    onClick={() => handleSelectTournament(t.tournamentId)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                        <div>
                                            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{t.tournamentName}</h3>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                Thể thức: {t.timeControl} | Số vòng: {t.totalRounds}
                                            </span>
                                        </div>
                                        <div>
                                            <span
                                                style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    background: t.status === 'REGISTERING' ? 'rgba(74, 222, 128, 0.2)' : t.status === 'ONGOING' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                                                    color: t.status === 'REGISTERING' ? '#4ade80' : t.status === 'ONGOING' ? '#60a5fa' : '#a78bfa'
                                                }}
                                            >
                                                {t.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar details column */}
                <div className="friends-sidebar-col" style={{ flex: 2, minWidth: '350px' }}>
                    {tournament ? (
                        <div className="glass-panel" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '15px' }}>
                                <h2 style={{ fontSize: '1.3rem', margin: '0 0 5px 0' }}>{tournament.tournamentName}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '15px' }}>{tournament.description || 'Không có mô tả.'}</p>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <div>⏱️ Thể thức: <strong>{tournament.timeControl}</strong></div>
                                    <div>🔄 Số vòng: <strong>{tournament.totalRounds}</strong></div>
                                    <div>📅 Bắt đầu: <strong>{tournament.startTime ? new Date(tournament.startTime).toLocaleString('vi-VN') : 'Chưa thiết lập'}</strong></div>
                                </div>

                                {tournament.status === 'REGISTERING' && (
                                    <div style={{ marginTop: '15px' }}>
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
                            </div>

                            {/* Details Tabs */}
                            <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', marginBottom: '15px' }}>
                                <button
                                    onClick={() => setActiveTab('standings')}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        color: activeTab === 'standings' ? 'var(--accent-blue-hover)' : 'var(--text-muted)',
                                        borderBottom: activeTab === 'standings' ? '2px solid var(--accent-blue)' : 'none',
                                        borderRadius: 0,
                                        padding: '10px'
                                    }}
                                >
                                    Bảng xếp hạng
                                </button>
                                <button
                                    onClick={() => setActiveTab('rounds')}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        color: activeTab === 'rounds' ? 'var(--accent-blue-hover)' : 'var(--text-muted)',
                                        borderBottom: activeTab === 'rounds' ? '2px solid var(--accent-blue)' : 'none',
                                        borderRadius: 0,
                                        padding: '10px'
                                    }}
                                >
                                    Vòng đấu & Trận đấu
                                </button>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {activeTab === 'standings' ? (
                                    <div>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', textAlign: 'left' }}>
                                                    <th style={{ padding: '8px' }}>Hạng</th>
                                                    <th style={{ padding: '8px' }}>Kỳ thủ</th>
                                                    <th style={{ padding: '8px' }}>Elo</th>
                                                    <th style={{ padding: '8px', textAlign: 'center' }}>Điểm</th>
                                                    <th style={{ padding: '8px', textAlign: 'center' }}>BH</th>
                                                    <th style={{ padding: '8px', textAlign: 'center' }}>SB</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {standings.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Chưa có kỳ thủ nào đăng ký.</td>
                                                    </tr>
                                                ) : (
                                                    standings.map((p, idx) => (
                                                        <tr key={p.userId} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                            <td style={{ padding: '8px', fontWeight: 'bold' }}>{idx + 1}</td>
                                                            <td style={{ padding: '8px' }}>{p.username} {p.userId === userId && '(Bạn)'}</td>
                                                            <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{p.initialRating}</td>
                                                            <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: 'var(--accent-blue-hover)' }}>{p.currentScore}</td>
                                                            <td style={{ padding: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>{p.buchholz}</td>
                                                            <td style={{ padding: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>{p.sonnebornBerger}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div>
                                        {rounds.length === 0 ? (
                                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                                                {tournament.status === 'REGISTERING' ? 'Rounds will be generated when the tournament starts.' : 'Replay and round details are only available after the tournament ends.'}
                                            </p>
                                        ) : (
                                            <div>
                                                {/* Rounds selector */}
                                                <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '15px' }}>
                                                    {rounds.map(r => (
                                                        <button
                                                            key={r.roundId}
                                                            onClick={() => handleFetchPairings(tournament.tournamentId, r.roundId)}
                                                            className={selectedRoundId === r.roundId ? 'primary-btn' : 'secondary-btn'}
                                                            style={{ padding: '5px 10px', fontSize: '0.75rem', flex: 'none' }}
                                                        >
                                                            Vòng {r.roundNumber}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Pairings list */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {pairings.length === 0 ? (
                                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>Không có cặp đấu nào trong vòng này.</p>
                                                    ) : (
                                                        pairings.map(p => (
                                                            <div key={p.pairingId} style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                                                    <div style={{ flex: 1 }}>
                                                                        <span style={{ fontWeight: '600' }}>{p.whitePlayerName}</span>
                                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '5px' }}>({p.whitePlayerRating})</span>
                                                                    </div>
                                                                    <div style={{ flex: 'none', width: '60px', textAlign: 'center', fontWeight: 'bold', color: 'var(--accent-purple)' }}>
                                                                        {p.isBye ? 'BYE' : p.result || 'vs'}
                                                                    </div>
                                                                    <div style={{ flex: 1, textAlign: 'right' }}>
                                                                        <span style={{ fontWeight: '600' }}>{p.blackPlayerName}</span>
                                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '5px' }}>{p.blackPlayerId ? `(${p.blackPlayerRating})` : ''}</span>
                                                                    </div>
                                                                </div>

                                                                {tournament.status === 'FINISHED' && p.gameId && (
                                                                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                                                                        <button
                                                                            className="primary-btn"
                                                                            style={{ padding: '3px 8px', fontSize: '0.7rem', flex: 'none' }}
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
                    ) : (
                        <div className="glass-panel" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            Chọn một giải đấu để xem thông tin chi tiết
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
