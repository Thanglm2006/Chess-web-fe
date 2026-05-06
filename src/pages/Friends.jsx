import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../services/UserService';
import { FriendService } from '../services/FriendService';
import { socketClient } from '../services/SocketService';
import '../index.css';

export default function Friends() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [friends, setFriends] = useState([]);
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Inputs for Add/Accept
    const [addFriendId, setAddFriendId] = useState('');
    const [message, setMessage] = useState('');
    const [matchType, setMatchType] = useState('rapid');

    useEffect(() => {
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
    }, []);

    useEffect(() => {
        loadData();
    }, []);

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

    const handleSendRequest = async () => {
        if (!addFriendId || !user) return;
        try {
            await FriendService.sendRequest(user.userId, addFriendId);
            setMessage("Friend request sent!");
            setAddFriendId('');
            loadData();
        } catch (err) {
            setMessage(err.response?.data?.message || "Failed to send request.");
        }
    };

    const handleAcceptRequest = async (fid) => {
        if (!user) return;
        try {
            await FriendService.acceptRequest(fid, user.userId);
            setMessage("Friend request accepted!");
            loadData(); // Refresh list
        } catch (err) {
            setMessage(err.response?.data?.message || "Failed to accept request.");
        }
    };

    const handleInvite = (friendId) => {
        navigate('/play-online', { state: { inviteFriendId: friendId, matchType: matchType } });
    };

    if (loading) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            <header style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>My <span>Friends</span></h1>
                <button onClick={() => navigate('/menu')} className="secondary-btn">Back to Menu</button>
            </header>
            
            <div className="main-layout" style={{ maxWidth: '1000px', width: '100%', marginTop: '20px' }}>
                
                {/* Actions Column */}
                <div className="dashboard-column" style={{ flex: '1', minWidth: '300px' }}>
                    <div className="glass-panel">
                        <h2>Manage Friends</h2>
                        {message && <div style={{ color: 'var(--accent-blue)', marginBottom: '15px' }}>{message}</div>}
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Send Request to ID</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input 
                                    type="number" 
                                    className="custom-input" 
                                    value={addFriendId} 
                                    onChange={(e) => setAddFriendId(e.target.value)}
                                    placeholder="User ID" 
                                />
                                <button className="primary-btn" onClick={handleSendRequest}>Send</button>
                            </div>
                        </div>

                        <hr style={{ borderColor: 'var(--glass-border)', margin: '20px 0' }} />

                        <h3>Pending Requests</h3>
                        {pending.length === 0 ? (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No pending requests.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {pending.map(req => (
                                    <div key={req.userId} style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.9rem' }}>
                                            <strong>{req.username}</strong>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rating: {req.rating}</div>
                                        </div>
                                        <button className="primary-btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleAcceptRequest(req.userId)}>Accept</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Friends List Column */}
                <div className="glass-panel" style={{ flex: '2', minWidth: '400px' }}>
                    <h2>Friends List</h2>
                    {friends.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>You don't have any friends yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {friends.map((friend) => (
                                <div key={friend.userId} className="stat-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: friend.status === 'ONLINE' ? '#4ade80' : 'var(--glass-border)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: 'black' }}>
                                            {friend.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{friend.username} (ID: {friend.userId})</div>
                                            <div style={{ fontSize: '0.9rem', color: friend.status === 'ONLINE' ? '#4ade80' : 'var(--text-muted)' }}>
                                                {friend.status} • Rating: {friend.rating}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <select 
                                            value={matchType} 
                                            onChange={(e) => setMatchType(e.target.value)}
                                            className="custom-input"
                                            style={{ padding: '5px', width: '100px', opacity: friend.status !== 'ONLINE' ? 0.5 : 1 }}
                                            disabled={friend.status !== 'ONLINE'}
                                        >
                                            <option value="bullet">Bullet (1m)</option>
                                            <option value="blitz">Blitz (3m)</option>
                                            <option value="rapid">Rapid (10m)</option>
                                            <option value="classical">Classical (30m)</option>
                                        </select>
                                        <button 
                                            className="primary-btn" 
                                            onClick={() => handleInvite(friend.userId)}
                                            disabled={friend.status !== 'ONLINE'}
                                            style={{ opacity: friend.status !== 'ONLINE' ? 0.5 : 1 }}
                                        >
                                            Invite to Match
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
