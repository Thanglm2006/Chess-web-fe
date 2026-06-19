import React, { useState } from 'react';
import { FriendService } from '../../services/FriendService';
import '../../index.css';

export default function SearchFriendModal({ isOpen, onClose, currentUserId, onActionSuccess }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    if (!isOpen) return null;

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        try {
            setLoading(true);
            const data = await FriendService.searchNewFriends(currentUserId, query);
            setResults(data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (targetId) => {
        try {
            setActionLoadingId(targetId);
            await FriendService.sendRequest(currentUserId, targetId);
            setResults(prev => prev.map(u => 
                u.userId === targetId ? { ...u, friendshipStatus: 'PENDING_SENT' } : u
            ));
            if (onActionSuccess) onActionSuccess();
        } catch (error) {
            console.error("Failed to send request", error);
            alert("Không thể gửi lời mời kết bạn");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleAcceptRequest = async (targetId) => {
        try {
            setActionLoadingId(targetId);
            await FriendService.acceptRequest(currentUserId, targetId);
            setResults(prev => prev.map(u => 
                u.userId === targetId ? { ...u, friendshipStatus: 'ACCEPTED' } : u
            ));
            if (onActionSuccess) onActionSuccess();
        } catch (error) {
            console.error("Failed to accept request", error);
            alert("Không thể đồng ý kết bạn");
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Tìm kiếm bạn mới</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                
                <form onSubmit={handleSearch} className="friends-search-container" style={{ margin: '15px 0' }}>
                    <span className="friends-search-icon">🔍</span>
                    <input
                        type="text"
                        className="friends-search-input"
                        placeholder="Nhập tên người dùng cần tìm..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit" className="primary-btn" style={{ marginLeft: '10px', padding: '10px 20px', borderRadius: '8px' }}>
                        Tìm
                    </button>
                </form>

                <div className="pending-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#8b92a5' }}>
                            Đang tìm kiếm...
                        </div>
                    ) : results.length === 0 ? (
                        <div className="empty-state" style={{ color: '#8b92a5', textAlign: 'center', padding: '30px' }}>
                            {query ? 'Không tìm thấy người dùng nào.' : 'Nhập tên người dùng ở trên để tìm.'}
                        </div>
                    ) : (
                        results.map(u => (
                            <div key={u.userId} className="friend-item" style={{ borderBottom: 'none', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '10px', padding: '12px' }}>
                                <div className="friend-info">
                                    <div className="friend-avatar">
                                        {u.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="friend-details">
                                        <span style={{ fontWeight: 600 }}>{u.username}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#8b92a5' }}>Rating: {u.rating}</span>
                                    </div>
                                </div>
                                <div className="pending-actions">
                                    {u.friendshipStatus === 'NONE' && (
                                        <button 
                                            className="primary-btn" 
                                            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                            onClick={() => handleSendRequest(u.userId)}
                                            disabled={actionLoadingId === u.userId}
                                        >
                                            {actionLoadingId === u.userId ? 'Đang gửi...' : 'Kết bạn'}
                                        </button>
                                    )}
                                    {u.friendshipStatus === 'PENDING_SENT' && (
                                        <button 
                                            className="secondary-btn" 
                                            style={{ padding: '8px 16px', fontSize: '0.85rem', cursor: 'default', opacity: 0.7 }}
                                            disabled
                                        >
                                            Đang chờ
                                        </button>
                                    )}
                                    {u.friendshipStatus === 'PENDING_RECEIVED' && (
                                        <button 
                                            className="primary-btn" 
                                            style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#22c55e' }}
                                            onClick={() => handleAcceptRequest(u.userId)}
                                            disabled={actionLoadingId === u.userId}
                                        >
                                            {actionLoadingId === u.userId ? '...' : 'Chấp nhận'}
                                        </button>
                                    )}
                                    {u.friendshipStatus === 'ACCEPTED' && (
                                        <span style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 600, paddingRight: '10px' }}>
                                            ✓ Bạn bè
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
