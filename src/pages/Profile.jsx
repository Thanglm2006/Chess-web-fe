import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../services/UserService';
import { GameService } from '../services/GameService';
import { FriendService } from '../services/FriendService';
import Sidebar from '../components/Sidebar';
import '../index.css';

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [friendsCount, setFriendsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // Search Filter States
    const [filterOpponent, setFilterOpponent] = useState('');
    const [filterResult, setFilterResult] = useState('ALL');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const userData = await UserService.getMe();
            setUser(userData);
            
            if (userData?.userId) {
                const statsData = await UserService.getStats(userData.userId);
                setStats(statsData);
                
                const historyData = await GameService.getHistory(userData.userId);
                console.log("History Data received:", historyData);
                setHistory(Array.isArray(historyData) ? historyData : []);

                try {
                    const friendsData = await FriendService.getList(userData.userId);
                    setFriendsCount(Array.isArray(friendsData) ? friendsData.length : 0);
                } catch (friendErr) {
                    console.error("Failed to load friends count", friendErr);
                }
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReplay = (game) => {
        navigate('/replay', { state: { gameData: game } });
    };

    // Helper to calculate win/loss status
    const getGameOutcome = (game) => {
        const isWhite = game.myColor === 'WHITE';
        if (game.result === '1/2-1/2') return { text: 'Hòa 🤝', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' };
        
        const whiteWon = game.result === '1-0';
        const won = (isWhite && whiteWon) || (!isWhite && !whiteWon);
        
        return won 
            ? { text: 'Thắng 🏆', color: '#81b64c', bg: 'rgba(129,182,76,0.1)' }
            : { text: 'Thua ❌', color: '#f87171', bg: 'rgba(248,113,113,0.1)' };
    };

    // Parse moves count from PGN string
    const getMovesCount = (pgn) => {
        if (!pgn) return 0;
        const cleanPgn = pgn.replace(/\[.*?\]/g, '').trim();
        const noNumbers = cleanPgn.replace(/\d+\.+/g, ' ');
        const tokens = noNumbers.split(/\s+/).filter(t => t.trim() !== "");
        const results = ["1-0", "0-1", "1/2-1/2", "*"];
        const moves = tokens.filter(t => !results.includes(t));
        return moves.length;
    };

    if (loading) {
        return (
            <div className="main-menu-wrapper" style={{ display: 'flex', background: '#1c1a17', minHeight: '100vh', width: '100vw' }}>
                <div className="lobby-spinner-container">
                    <div className="lobby-pulse-ring"></div>
                    <div className="lobby-spinner"></div>
                </div>
            </div>
        );
    }

    // Filter history based on search sidebar inputs
    const filteredHistory = history.filter(game => {
        const opponent = game.opponentName || "Máy AI 🤖";
        if (filterOpponent && !opponent.toLowerCase().includes(filterOpponent.toLowerCase())) {
            return false;
        }
        if (filterResult !== 'ALL') {
            const outcome = getGameOutcome(game);
            const isWin = outcome.text.includes('Thắng');
            const isLoss = outcome.text.includes('Thua');
            const isDraw = outcome.text.includes('Hòa');
            
            if (filterResult === 'WIN' && !isWin) return false;
            if (filterResult === 'LOSS' && !isLoss) return false;
            if (filterResult === 'DRAW' && !isDraw) return false;
        }
        return true;
    });

    return (
        <div className="main-menu-wrapper" style={{ display: 'flex', background: '#1c1a17', minHeight: '100vh', width: '100vw', color: '#fff', overflow: 'hidden' }}>
            <Sidebar username={user?.username || 'User'} />

            {/* Main Profile Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', boxSizing: 'border-box', overflowY: 'auto', height: '100vh' }} className="custom-scrollbar">
                
                {/* Chess.com Style Profile Card */}
                <div style={{ background: '#262421', border: '1px solid #312e2b', borderRadius: '6px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        {/* Profile Picture */}
                        <div style={{ position: 'relative' }}>
                            <div style={{ width: '90px', height: '90px', borderRadius: '6px', background: '#312e2b', border: '1px solid #403d39', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.5rem', fontWeight: 'bold', color: '#babfc3', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                                ♟️
                            </div>
                        </div>

                        {/* Player info details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: 'white', fontFamily: '"Outfit", sans-serif' }}>
                                {user?.username}
                            </h1>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', fontSize: '0.85rem', color: '#babfc3', fontWeight: 'bold' }}>
                                <span>Hệ số ELO: <strong style={{ color: '#81b64c' }}>{stats?.rating || 1200}</strong></span>
                                <span>•</span>
                                <span>👥 {friendsCount} Bạn bè</span>
                                <span>•</span>
                                <span style={{ color: '#4ade80' }}>Thắng: {stats?.wins || 0}</span>
                                <span style={{ color: '#f87171' }}>Thua: {stats?.losses || 0}</span>
                                <span style={{ color: '#9ca3af' }}>Hòa: {stats?.draws || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lower Layout Section: Match History & Search Sidebar */}
                <div style={{ display: 'flex', gap: '24px', marginTop: '24px', flex: 1, width: '100%', boxSizing: 'border-box' }}>
                    
                    {/* Left Column: Match History List (70%) */}
                    <div style={{ flex: 1.7, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
                        
                        {/* Match History Table */}
                        <div style={{ background: '#262421', border: '1px solid #312e2b', borderRadius: '6px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: '800', fontFamily: '"Outfit", sans-serif' }}>
                                    Lịch sử ván đấu ({filteredHistory.length})
                                </h3>
                            </div>

                            {filteredHistory.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#62605e', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                    Không tìm thấy ván đấu nào.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#312e2b' }}>
                                    {/* Table Headers */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 0.8fr 1.2fr', background: '#1c1a17', padding: '10px 16px', fontSize: '0.75rem', color: '#62605e', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        <span>Các kỳ thủ</span>
                                        <span style={{ textAlign: 'center' }}>Kết quả</span>
                                        <span style={{ textAlign: 'center' }}>Số nước đi</span>
                                        <span style={{ textAlign: 'right' }}>Ngày</span>
                                    </div>

                                    {/* Table Body Games Rows */}
                                    {filteredHistory.map((game, idx) => {
                                        const outcome = getGameOutcome(game);
                                        const opponent = game.opponentName || "Máy AI 🤖";
                                        const isWin = outcome.text.includes('Thắng');
                                        const isLoss = outcome.text.includes('Thua');

                                        // Set player color assignments
                                        const isMyColorWhite = game.myColor === 'WHITE';
                                        
                                        // Calculate exact scores based on result
                                        let myScore = '0';
                                        let oppScore = '0';
                                        if (game.result === '1-0') {
                                            if (isMyColorWhite) { myScore = '1'; oppScore = '0'; }
                                            else { myScore = '0'; oppScore = '1'; }
                                        } else if (game.result === '0-1') {
                                            if (isMyColorWhite) { myScore = '0'; oppScore = '1'; }
                                            else { myScore = '1'; oppScore = '0'; }
                                        } else if (game.result === '1/2-1/2') {
                                            myScore = '½';
                                            oppScore = '½';
                                        }

                                        // Badge letter & colors matching Chess.com game history
                                        let badgeBg = '#312e2b';
                                        let badgeColor = '#babfc3';
                                        let badgeSign = '=';
                                        if (isWin) {
                                            badgeBg = 'rgba(129,182,76,0.15)';
                                            badgeColor = '#81b64c';
                                            badgeSign = '+';
                                        } else if (isLoss) {
                                            badgeBg = 'rgba(248,113,113,0.15)';
                                            badgeColor = '#f87171';
                                            badgeSign = '-';
                                        }

                                        return (
                                            <div 
                                                key={idx} 
                                                style={{ 
                                                    display: 'grid', 
                                                    gridTemplateColumns: '1.8fr 1.2fr 0.8fr 1.2fr', 
                                                    alignItems: 'center', 
                                                    padding: '12px 16px', 
                                                    background: '#262421', 
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s'
                                                }}
                                                onClick={() => handleReplay(game)}
                                                onMouseEnter={e => e.currentTarget.style.background = '#2d2b28'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#262421'}
                                            >
                                                {/* Column 1: Players Detail Rows */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    {/* Player Row 1 (Opponent) */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                                        <span style={{ 
                                                            width: '8px', 
                                                            height: '8px', 
                                                            background: isMyColorWhite ? '#000' : '#fff', 
                                                            border: '1px solid #62605e',
                                                            borderRadius: '1px',
                                                            display: 'inline-block' 
                                                        }}></span>
                                                        <span style={{ fontWeight: 'bold', color: '#fff' }}>{opponent}</span>
                                                    </div>

                                                    {/* Player Row 2 (You) */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                                        <span style={{ 
                                                            width: '8px', 
                                                            height: '8px', 
                                                            background: isMyColorWhite ? '#fff' : '#000', 
                                                            border: '1px solid #62605e',
                                                            borderRadius: '1px',
                                                            display: 'inline-block' 
                                                        }}></span>
                                                        <span style={{ fontWeight: 'bold', color: '#fff' }}>{user?.username}</span>
                                                    </div>
                                                </div>

                                                {/* Column 2: Game Result Score representation */}
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', fontWeight: 'bold', color: '#babfc3', textAlign: 'right', minWidth: '15px' }}>
                                                        <span>{oppScore}</span>
                                                        <span>{myScore}</span>
                                                    </div>
                                                    <div style={{ 
                                                        width: '24px', 
                                                        height: '24px', 
                                                        borderRadius: '4px', 
                                                        background: badgeBg, 
                                                        color: badgeColor, 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center', 
                                                        fontWeight: '800', 
                                                        fontSize: '0.8rem' 
                                                    }}>
                                                        {badgeSign}
                                                    </div>
                                                </div>

                                                {/* Column 3: Moves count */}
                                                <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#babfc3', fontWeight: 'bold' }}>
                                                    {getMovesCount(game.pgn)}
                                                </div>

                                                {/* Column 4: Date played & Analysis button */}
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#62605e', fontWeight: 'bold' }}>
                                                        {new Date(game.playedAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                    <button 
                                                        style={{ 
                                                            background: '#312e2b', 
                                                            border: '1px solid #403d39', 
                                                            borderRadius: '4px', 
                                                            color: '#babfc3', 
                                                            fontSize: '0.7rem', 
                                                            padding: '4px 10px', 
                                                            fontWeight: 'bold',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s'
                                                        }}
                                                    >
                                                        Xem ván đấu
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Right Column: Search & Filter Panel (30%) */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '260px' }}>
                        
                        {/* Search games Card */}
                        <div style={{ background: '#262421', border: '1px solid #312e2b', borderRadius: '6px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: 'white', fontWeight: '800', fontFamily: '"Outfit", sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Tìm kiếm ván đấu
                            </h3>

                            {/* Dropdown (Result filter) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.75rem', color: '#62605e', fontWeight: 'bold', textTransform: 'uppercase' }}>Kết quả</label>
                                <select 
                                    value={filterResult}
                                    onChange={e => setFilterResult(e.target.value)}
                                    style={{ background: '#312e2b', border: '1px solid #403d39', padding: '10px', borderRadius: '4px', color: 'white', fontSize: '0.85rem', cursor: 'pointer', width: '100%' }}
                                >
                                    <option value="ALL">Bất kỳ kết quả nào</option>
                                    <option value="WIN">Thắng</option>
                                    <option value="LOSS">Thua</option>
                                    <option value="DRAW">Hòa</option>
                                </select>
                            </div>

                            {/* Text Input (Opponent) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.75rem', color: '#62605e', fontWeight: 'bold', textTransform: 'uppercase' }}>Đối thủ</label>
                                <input 
                                    type="text"
                                    placeholder="Tên đối thủ..."
                                    value={filterOpponent}
                                    onChange={e => setFilterOpponent(e.target.value)}
                                    style={{ background: '#312e2b', border: '1px solid #403d39', padding: '10px', borderRadius: '4px', color: 'white', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                <button 
                                    onClick={() => { setFilterOpponent(''); setFilterResult('ALL'); }}
                                    style={{ 
                                        background: '#312e2b', 
                                        border: '1px solid #403d39', 
                                        padding: '10px', 
                                        borderRadius: '4px', 
                                        color: '#babfc3', 
                                        fontWeight: 'bold', 
                                        fontSize: '0.85rem', 
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        width: '100%'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#403d39'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#312e2b'; e.currentTarget.style.color = '#babfc3'; }}
                                >
                                    Thiết lập lại
                                </button>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}
