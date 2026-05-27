import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../services/UserService';
import { FriendService } from '../services/FriendService';
import { socketClient } from '../services/SocketService';
import { AuthService } from '../services/AuthService';
import '../index.css';
import Sidebar from '../components/Sidebar';
import friendsIcon from '../assets/friends.svg';
import PendingFriendModal from '../components/friend/PendingFriendModal';

export default function Friends() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [friends, setFriends] = useState([]);
    const [pending, setPending] = useState([]);
    const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('Guest');
    const [openRemoveDropdown, setOpenRemoveDropdown] = useState(null);
    const [loadingId, setLoadingId] = useState(null);

    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handleOutsideClick = () => {
            setOpenRemoveDropdown(null);
        };
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    useEffect(() => {
        const init = async () => {
            const token = await AuthService.getValidToken();
            if (!token) {
                navigate('/login');
                return;
            }

            const payload = AuthService.parseToken(token);
            if (payload) {
                setUsername(payload.username || payload.sub || 'User');
            }

            await loadData();
        };

        init();

        const handleSocketMessage = (data) => {
            try {
                const msg = JSON.parse(data);
                if (msg.type === 'USER_ONLINE') {
                    setFriends(prev => prev.map(f => f.userId === msg.userId ? { ...f, status: 'ONLINE' } : f));
                } else if (msg.type === 'USER_OFFLINE') {
                    setFriends(prev => prev.map(f => f.userId === msg.userId ? { ...f, status: 'OFFLINE' } : f));
                }
            } catch (e) {
                console.error("Error parsing presence message", e);
            }
        };

        socketClient.addListener(handleSocketMessage);
        return () => {
            socketClient.removeListener(handleSocketMessage);
        };
    }, [navigate]);

    const loadData = async () => {
        try {
            setLoading(true);
            const userData = await UserService.getMe();
            setUser(userData);

            if (userData?.userId) {
                const friendsData = await FriendService.getList(userData.userId);
                setFriends(Array.isArray(friendsData) ? friendsData : []);

                const pendingData = await FriendService.getPending(userData.userId);
                setPending(Array.isArray(pendingData) ? pendingData : []);
            }
        } catch (error) {
            console.error("Failed to load friends", error);
        } finally {
            setLoading(false);
        }
    };
    const handleRemoveFriend = async (friendId) => {
        try {
            setLoadingId(friendId);
            await FriendService.removeFriend(user.userId, friendId);
            setFriends(prev => prev.filter(f => f.userId !== friendId));
            setLoadingId(null);
        } catch (error) {
            console.error("Failed to remove friend", error);
            alert("Could not remove friend");
            setLoadingId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        socketClient.disconnect();
        navigate('/login');
    };

    const handleAcceptSuccess = (senderId) => {
        const acceptedUser = pending.find(p => p.userId === senderId || p.senderId === senderId);
        setPending(prev => prev.filter(p => p.userId !== senderId && p.senderId !== senderId));
        if (acceptedUser) {
            setFriends(prev => [...prev, { ...acceptedUser, status: 'ONLINE' }]);
        }
    };

    if (loading) {
        return (
            <div className="main-menu-wrapper" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className="main-menu-wrapper">
            <Sidebar username={username} />

            {/* Main Content Area */}
            <div className="friends-content">
                <div className="friends-main-col">
                    <div className="friends-header">
                        <img src={friendsIcon} alt="Friends" style={{ width: '32px', height: '32px' }} />
                        <h1>Bạn bè</h1>
                    </div>

                    {/* Action Grid */}
                    <div className="friends-actions-grid">
                        <div className="friend-action-btn">
                            <div className="friend-action-content">
                                <span className="icon">👤+</span>
                                <span>Kết nối bạn bè</span>
                            </div>
                            <span>&gt;</span>
                        </div>
                        <div className="friend-action-btn" onClick={() => setIsPendingModalOpen(true)}>
                            <div className="friend-action-content">
                                <span className="icon">🔍</span>
                                <span>Tìm bạn</span>
                                {pending.length > 0 && (
                                    <span className="pending-badge">{pending.length}</span>
                                )}
                            </div>
                            <span>&gt;</span>
                        </div>
                        <div className="friend-action-btn">
                            <div className="friend-action-content">
                                <span className="icon">✉️</span>
                                <span>Gửi thư mời</span>
                            </div>
                            <span>&gt;</span>
                        </div>
                        <div className="friend-action-btn">
                            <div className="friend-action-content">
                                <span className="icon">🔗</span>
                                <span>Tạo lời thách đấu</span>
                            </div>
                            <span>&gt;</span>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="friends-search-container">
                        <span className="friends-search-icon">🔍</span>
                        <input
                            type="text"
                            className="friends-search-input"
                            placeholder="Tìm theo tên hoặc tên người dùng"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Friends List */}
                    <div className="friends-list-container">
                        <div className="friends-list-header">
                            <span style={{ fontWeight: 600 }}>Bạn bè <span style={{ color: '#8b92a5', marginLeft: '5px' }}>{friends.length}</span></span>
                            <span style={{ fontSize: '0.8rem', color: '#8b92a5', cursor: 'pointer' }}>Most Recently Online ▾</span>
                        </div>

                        <div className="friends-list">
                            {friends.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#8b92a5' }}>
                                    Không có bạn bè nào để hiển thị
                                </div>
                            ) : (
                                friends
                                    .filter(f => f.username.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map(friend => (
                                        <div key={friend.userId} className="friend-item">
                                            <div className="friend-info">
                                                <div className="friend-avatar">
                                                    {friend.username.charAt(0).toUpperCase()}
                                                    <div style={{
                                                        position: 'absolute', bottom: '2px', right: '2px',
                                                        width: '10px', height: '10px',
                                                        background: friend.status === 'ONLINE' ? '#4ade80' : '#8b92a5',
                                                        borderRadius: '50%', border: '2px solid #262626'
                                                    }}></div>
                                                </div>
                                                <div className="friend-details">
                                                    <div className="friend-name-row">
                                                        <span style={{ fontWeight: 600 }}>{friend.username}</span>
                                                        <span className="flag">🇻🇳</span>
                                                    </div>
                                                    <span className="friend-status-text">
                                                        {friend.status === 'ONLINE' ? 'Đang trực tuyến' : 'Ngoại tuyến'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="friend-actions" style={{ position: 'relative' }}>
                                                <span className="friend-action-icon" title="Thách đấu">⚔️</span>
                                                <span className="friend-action-icon" title="Nhắn tin">✉️</span>
                                                <span className="friend-action-icon"
                                                    title="Thêm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenRemoveDropdown(openRemoveDropdown === friend.userId ? null : friend.userId);
                                                    }}
                                                >...</span>
                                                {openRemoveDropdown === friend.userId && (
                                                    <div className="friend-dropdown-menu">
                                                        <div 
                                                            className="friend-dropdown-item delete"
                                                            onClick={() => {
                                                                handleRemoveFriend(friend.userId);
                                                                setOpenRemoveDropdown(null);
                                                            }}
                                                        >
                                                            ❌ Hủy kết bạn
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="friends-sidebar-col">
                    {/* Leaderboard Panel */}
                    <div className="leaderboard-panel">
                        <div className="leaderboard-header">
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>Bảng xếp hạng Bạn bè</h3>
                        </div>

                        <div className="leaderboard-tabs">
                            {['Chớp', 'Siêu chớp', 'Cờ chớp', 'Câu đố'].map((type, idx) => (
                                <div key={type} className="leaderboard-tab-item">
                                    <div className="leaderboard-tab-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span>{idx === 0 ? '⚡' : idx === 1 ? '🚀' : idx === 2 ? '⏱️' : '🧩'}</span>
                                            <span style={{ fontSize: '0.9rem' }}>{type}</span>
                                        </div>
                                        <span style={{ color: '#8b92a5' }}>&gt;</span>
                                    </div>
                                    {/* Real data would go here */}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Suggested Friends */}
                    <div className="leaderboard-panel" style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', marginBottom: '15px' }}>Đề xuất bạn bè</h3>
                        <div style={{ textAlign: 'center', padding: '20px', color: '#8b92a5', fontSize: '0.85rem' }}>
                            Không có đề xuất nào hiện tại
                        </div>
                    </div>
                </div>
            </div>

            {user && (
                <PendingFriendModal
                    isOpen={isPendingModalOpen}
                    onClose={() => setIsPendingModalOpen(false)}
                    pending={pending}
                    currentUserId={user.userId}
                    onAcceptSuccess={handleAcceptSuccess}
                />
            )}
        </div>
    );
}
