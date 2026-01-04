import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check, Trash2, MessageSquare, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/api/notifications');
            if (res.data.success) {
                setNotifications(res.data.data);
            }
            const countRes = await api.get('/api/notifications/unread-count');
            if (countRes.data.success) {
                setUnreadCount(countRes.data.count);
            }
        } catch (e) {
            console.error('Failed to fetch notifications', e);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // 每30秒轮询一次
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await api.post(`/api/notifications/${id}/read`);
            fetchNotifications();
        } catch (e) {
            console.error('Failed to mark as read', e);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/api/notifications/read-all');
            fetchNotifications();
        } catch (e) {
            console.error('Failed to mark all as read', e);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'REPLY': return <MessageSquare size={16} style={{ color: '#667eea' }} />;
            case 'FOLLOW': return <UserPlus size={16} style={{ color: '#48bb78' }} />;
            default: return <Bell size={16} />;
        }
    };

    return (
        <div className="notification-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    color: 'inherit'
                }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: '#e53e3e',
                        color: 'white',
                        borderRadius: '50%',
                        width: '8px',
                        height: '8px',
                        border: '2px solid white'
                    }}></span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: '320px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    zIndex: 1000,
                    marginTop: '10px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #edf2f7',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f8fafc'
                    }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>消息通知</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    fontSize: '12px',
                                    color: '#667eea',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <Check size={14} /> 全部已读
                            </button>
                        )}
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#a0aec0' }}>
                                <Bell size={32} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                                <p style={{ fontSize: '13px' }}>暂无消息</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #f7fafc',
                                        background: n.isRead ? 'white' : '#f0f4ff',
                                        transition: 'background 0.2s',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                    onClick={() => {
                                        if (!n.isRead) markAsRead(n.id);
                                        setIsOpen(false);
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <Link to={`/user/${n.senderId}`} onClick={(e) => e.stopPropagation()}>
                                            {n.senderAvatar ? (
                                                <img src={n.senderAvatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                                            ) : (
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                                                    {n.senderNickname?.charAt(0) || '?'}
                                                </div>
                                            )}
                                        </Link>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: '600' }}>{n.senderNickname}</span>
                                                <span style={{ color: '#718096', marginLeft: '6px' }}>{n.content}</span>
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#a0aec0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {getIcon(n.type)}
                                                {new Date(n.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{ padding: '10px', textAlign: 'center', borderTop: '1px solid #edf2f7', background: '#f8fafc' }}>
                        <Link to="/notifications" onClick={() => setIsOpen(false)} style={{ fontSize: '12px', color: '#718096', textDecoration: 'none' }}>查看全部消息</Link>
                    </div>
                </div>
            )}
        </div>
    );
}
