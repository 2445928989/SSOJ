import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { AlertCircle } from 'lucide-react'

export default function OtherUserProfile() {
    const { userId } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const username = searchParams.get('username')
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [heatmap, setHeatmap] = useState<Record<string, number>>({})
    const [isFollowing, setIsFollowing] = useState(false)
    const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 })
    const [showFollowers, setShowFollowers] = useState(false)
    const [showFollowing, setShowFollowing] = useState(false)
    const [followList, setFollowList] = useState<any[]>([])

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true)
            setError('')
            try {
                // 获取当前登录用户，检查是否是自己
                const profileRes = await api.get('/api/user/profile').catch(() => ({ data: null }));
                const currentUser = profileRes.data;

                let userRes;
                if (userId) {
                    if (currentUser && currentUser.id.toString() === userId) {
                        navigate('/profile');
                        return;
                    }
                    userRes = await api.get(`/api/user/${userId}`);
                } else if (username) {
                    if (currentUser && currentUser.username === username) {
                        navigate('/profile');
                        return;
                    }
                    userRes = await api.get(`/api/user/by-username/${username}`);
                } else {
                    return;
                }

                const userData = userRes.data;
                if (currentUser && userData.id === currentUser.id) {
                    navigate('/profile');
                    return;
                }
                setUser(userData);
                document.title = `${userData.nickname || userData.username} - SSOJ`;

                // 获取热力图
                const heatmapRes = await api.get(`/api/user/${userData.id}/submission-heatmap`);
                setHeatmap(heatmapRes.data.data || {});

                // 获取关注状态和计数
                const statusRes = await api.get(`/api/follow/${userData.id}/status`);
                setIsFollowing(statusRes.data.following);

                const countsRes = await api.get(`/api/follow/${userData.id}/counts`);
                setFollowCounts(countsRes.data.data);
            } catch (e: any) {
                setError(e.response?.data?.error || e.response?.data?.message || '加载失败');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId, username])

    const handleFollow = async () => {
        try {
            if (isFollowing) {
                await api.delete(`/api/follow/${user.id}`);
                setIsFollowing(false);
                setFollowCounts(prev => ({ ...prev, followers: prev.followers - 1 }));
            } else {
                await api.post(`/api/follow/${user.id}`);
                setIsFollowing(true);
                setFollowCounts(prev => ({ ...prev, followers: prev.followers + 1 }));
            }
        } catch (e: any) {
            alert(e.response?.data?.error || '操作失败');
        }
    };

    const fetchFollowList = async (type: 'followers' | 'following') => {
        try {
            const res = await api.get(`/api/follow/${user.id}/${type}`);
            setFollowList(res.data.data);
            if (type === 'followers') {
                setShowFollowers(true);
                setShowFollowing(false);
            } else {
                setShowFollowing(true);
                setShowFollowers(false);
            }
        } catch (e) {
            console.error('Failed to fetch follow list', e);
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">正在加载用户信息...</div>
        </div>
    )

    if (error) return (
        <div className="error-container">
            <AlertCircle size={48} className="error-icon" style={{ color: 'var(--danger-color)', marginBottom: '16px' }} />
            <div className="error-msg">{error}</div>
        </div>
    )

    if (!user) return (
        <div className="error-container">
            <AlertCircle size={48} className="error-icon" style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
            <div className="error-msg" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)', backgroundColor: '#f8f9fa' }}>用户不存在</div>
        </div>
    )

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div
                    className="profile-header"
                    style={{
                        backgroundImage: user.backgroundImage ? `url(${user.backgroundImage})` : 'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '240px',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-start',
                        padding: '30px',
                        overflow: 'hidden'
                    }}
                >
                    {/* 背景模糊层：仅模糊背景图，不影响前景文字 */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '120px',
                        background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        maskImage: 'linear-gradient(to bottom, transparent, black)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)',
                        zIndex: 1,
                        pointerEvents: 'none'
                    }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 10 }}>
                        {user.avatar ? (
                            <img src={user.avatar} alt="avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }} />
                        ) : (
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#667eea', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', border: '4px solid white', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                            <h1 style={{ margin: 0, color: 'white', fontSize: '2.5em' }}>{user.nickname || user.username}</h1>
                            <p className="username" style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '1.2em' }}>@{user.username}</p>
                            <div style={{ display: 'flex', gap: '20px', marginTop: '10px', color: 'white' }}>
                                <div className="follow-stat-item" onClick={() => fetchFollowList('following')}>
                                    <span style={{ fontWeight: 'bold' }}>{followCounts.following}</span> 关注
                                </div>
                                <div className="follow-stat-item" onClick={() => fetchFollowList('followers')}>
                                    <span style={{ fontWeight: 'bold' }}>{followCounts.followers}</span> 粉丝
                                </div>
                            </div>
                        </div>
                        <div style={{ marginLeft: 'auto' }}>
                            {user && (
                                <button
                                    onClick={handleFollow}
                                    style={{
                                        padding: '8px 24px',
                                        borderRadius: '20px',
                                        border: isFollowing ? '1.5px solid rgba(255,255,255,0.8)' : 'none',
                                        background: isFollowing ? 'rgba(255,255,255,0.25)' : '#667eea',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        backdropFilter: 'blur(8px)',
                                        transition: 'all 0.3s',
                                        boxShadow: isFollowing ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)'
                                    }}
                                >
                                    {isFollowing ? '已关注' : '+ 关注'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {(showFollowers || showFollowing) && (
                    <div style={{ padding: '20px', borderBottom: '1px solid #eee', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0 }}>{showFollowers ? '粉丝列表' : '关注列表'}</h3>
                            <button onClick={() => { setShowFollowers(false); setShowFollowing(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>关闭</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                            {followList.length === 0 ? (
                                <div style={{ color: '#999', fontSize: '14px' }}>暂无数据</div>
                            ) : (
                                followList.map(u => (
                                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        {u.avatar ? (
                                            <img src={u.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                        ) : (
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#667eea', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{u.username.charAt(0).toUpperCase()}</div>
                                        )}
                                        <a href={`/user/${u.id}`} style={{ textDecoration: 'none', color: '#2d3748', fontWeight: '500' }}>{u.nickname || u.username}</a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                <div className="profile-content">
                    <div className="profile-section">
                        <h2>用户信息</h2>
                        <div className="info-item">
                            <span className="label">用户名：</span>
                            <span className="value">{user.username}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">昵称：</span>
                            <span className="value">{user.nickname || '未设置'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">个人简介：</span>
                            <div className="value markdown-body" style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}>
                                {user.profile ? (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                    >
                                        {user.profile}
                                    </ReactMarkdown>
                                ) : '这个人很懒，什么都没有写~'}
                            </div>
                        </div>
                    </div>

                    <div className="stats-section">
                        <h2>做题统计</h2>
                        <div className="stats-list">
                            <div className="stat-row">
                                <span className="stat-label">已通过</span>
                                <span className="stat-number">{user.solved || 0}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">提交数</span>
                                <span className="stat-number">{user.submissions || 0}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">通过率</span>
                                <span className="stat-number">
                                    {user.submissions > 0
                                        ? ((user.solved / user.submissions) * 100).toFixed(1)
                                        : 0}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="heatmap-section">
                        <h2>提交热力图</h2>
                        <div className="heatmap-grid">
                            {Object.entries(heatmap)
                                .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                                .map(([date, count]: [string, any]) => {
                                    const intensity = Math.min(count / 5, 1)
                                    const colors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
                                    const colorIdx = Math.floor(intensity * (colors.length - 1))
                                    return (
                                        <div
                                            key={date}
                                            className="heatmap-cell"
                                            style={{
                                                backgroundColor: colors[colorIdx],
                                            }}
                                            title={`${date}: ${count} 次提交`}
                                        />
                                    )
                                })}
                        </div>
                        <div className="heatmap-legend">
                            <span>少</span>
                            <div className="legend-colors">
                                <div style={{ backgroundColor: '#ebedf0' }}></div>
                                <div style={{ backgroundColor: '#c6e48b' }}></div>
                                <div style={{ backgroundColor: '#7bc96f' }}></div>
                                <div style={{ backgroundColor: '#239a3b' }}></div>
                                <div style={{ backgroundColor: '#196127' }}></div>
                            </div>
                            <span>多</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .profile-container {
                    padding: 20px;
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .profile-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    overflow: hidden;
                }

                .profile-content {
                    padding: 30px;
                }

                .profile-section {
                    margin-bottom: 40px;
                }

                .profile-section h2,
                .stats-section h2,
                .heatmap-section h2 {
                    margin-top: 0;
                    margin-bottom: 20px;
                    color: #333;
                    border-bottom: 2px solid #667eea;
                    padding-bottom: 10px;
                }

                .info-item {
                    display: flex;
                    margin-bottom: 15px;
                    align-items: flex-start;
                }

                .info-item .label {
                    font-weight: bold;
                    min-width: 100px;
                    color: #666;
                }

                .info-item .value {
                    color: #333;
                    word-break: break-all;
                }

                .stats-section {
                    margin-bottom: 40px;
                }

                .stats-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .stat-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid #f0f0f0;
                }

                .stat-row:last-child {
                    border-bottom: none;
                }

                .stat-label {
                    color: #666;
                    font-weight: 500;
                }

                .stat-number {
                    font-size: 1.4rem;
                    font-weight: bold;
                    color: #667eea;
                }

                .heatmap-section {
                    margin-top: 40px;
                }

                .heatmap-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(12px, 1fr));
                    gap: 3px;
                    margin-bottom: 20px;
                    max-width: 100%;
                    overflow: hidden;
                    overflow-x: auto;
                }

                .heatmap-cell {
                    width: 12px;
                    height: 12px;
                    border-radius: 2px;
                    cursor: pointer;
                    transition: transform 0.2s;
                    border: 1px solid #ddd;
                }

                .heatmap-cell:hover {
                    transform: scale(1.1);
                    box-shadow: 0 0 5px rgba(0,0,0,0.3);
                }

                .heatmap-legend {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    font-size: 0.9em;
                    color: #666;
                }

                .legend-colors {
                    display: flex;
                    gap: 3px;
                }

                .legend-colors div {
                    width: 12px;
                    height: 12px;
                    border-radius: 2px;
                }

                .loading,
                .error-msg,
                .empty-state {
                    padding: 40px 20px;
                    text-align: center;
                    font-size: 1.1em;
                }

                .error-msg {
                    color: #f44336;
                    background: #ffebee;
                    border: 1px solid #f44336;
                    border-radius: 4px;
                    margin: 20px;
                }
            `}</style>
        </div>
    )
}
