import React, { useEffect, useState } from 'react';
import { Bell, MessageSquare, UserPlus, Check, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Notifications() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/api/notifications');
            if (res.data.success) {
                setNotifications(res.data.data);
            }
        } catch (e) {
            console.error('Failed to fetch notifications', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        document.title = '消息通知 - SSOJ';
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await api.post(`/api/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (e) {
            console.error('Failed to mark as read', e);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/api/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (e) {
            console.error('Failed to mark all as read', e);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'REPLY': return <MessageSquare size={20} style={{ color: '#667eea' }} />;
            case 'FOLLOW': return <UserPlus size={20} style={{ color: '#48bb78' }} />;
            default: return <Bell size={20} />;
        }
    };

    if (loading) return <div className="loading-container"><div className="loading-spinner"></div></div>;

    return (
        <div className="container" style={{ maxWidth: '800px', paddingTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, border: 'none' }}>消息通知</h2>
                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={markAllAsRead}
                        style={{
                            padding: '8px 16px',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px'
                        }}
                    >
                        <Check size={16} /> 全部标记为已读
                    </button>
                )}
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {notifications.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: '#a0aec0' }}>
                        <Bell size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
                        <p>暂无任何消息</p>
                    </div>
                ) : (
                    notifications.map(n => (
                        <div
                            key={n.id}
                            style={{
                                padding: '20px',
                                borderBottom: '1px solid #f1f5f9',
                                background: n.isRead ? 'white' : '#f8faff',
                                display: 'flex',
                                gap: '15px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: n.isRead ? '#f1f5f9' : '#ebf4ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {getIcon(n.type)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <div style={{ fontSize: '15px' }}>
                                        <Link to={`/user/${n.senderId}`} style={{ fontWeight: 'bold', color: '#2d3748', textDecoration: 'none' }}>{n.senderNickname}</Link>
                                        <span style={{ color: '#718096', marginLeft: '8px' }}>{n.content}</span>
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#a0aec0' }}>{new Date(n.createdAt).toLocaleString()}</span>
                                </div>
                                {!n.isRead && (
                                    <button
                                        onClick={() => markAsRead(n.id)}
                                        style={{ fontSize: '12px', color: '#667eea', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    >
                                        标记已读
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
