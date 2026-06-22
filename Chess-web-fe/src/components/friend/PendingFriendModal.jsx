import React, { useState } from 'react';
import { FriendService } from '../../services/FriendService';
import '../../index.css';

export default function PendingFriendModal({ isOpen, onClose, pending, currentUserId, onAcceptSuccess }) {
    const [loadingId, setLoadingId] = useState(null);

    if (!isOpen) return null;

    const handleAccept = async (senderId) => {
        try {
            setLoadingId(senderId);
            await FriendService.acceptRequest(currentUserId, senderId);
            if (onAcceptSuccess) {
                onAcceptSuccess(senderId);
            }
        } catch (error) {
            console.error("Failed to accept request", error);
            alert("Could not accept friend request");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Lời mời kết bạn ({pending.length})</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                
                <div className="pending-list">
                    {pending.length === 0 ? (
                        <div className="empty-state" style={{ color: '#8b92a5', textAlign: 'center', padding: '20px' }}>
                            Không có lời mời kết bạn nào.
                        </div>
                    ) : (
                        pending.map(req => (
                            <div key={req.userId || req.senderId} className="friend-item" style={{ borderBottom: 'none', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '10px' }}>
                                <div className="friend-info">
                                    <div className="friend-avatar">
                                        {(req.username || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="friend-details">
                                        <span style={{ fontWeight: 600 }}>{req.username}</span>
                                    </div>
                                </div>
                                <div className="pending-actions">
                                    <button 
                                        className="primary-btn" 
                                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                        onClick={() => handleAccept(req.userId || req.senderId)}
                                        disabled={loadingId === (req.userId || req.senderId)}
                                    >
                                        {loadingId === (req.userId || req.senderId) ? 'Đang xử lý...' : 'Chấp nhận'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
