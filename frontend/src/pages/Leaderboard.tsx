import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

interface UserStats {
    id: number
    username: string
    nickname?: string
    avatar?: string
    solved: number
    submissions: number
}

export default function Leaderboard() {
    const [users, setUsers] = useState<UserStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        api.get('/api/user/list')
            .then(res => {
                // Calculate stats for each user
                const userStats: UserStats[] = (res.data.data || []).map((u: any) => ({
                    id: u.id,
                    username: u.username,
                    nickname: u.nickname,
                    avatar: u.avatar,
                    solved: u.solved || 0,
                    submissions: u.submissions || 0
                }))
                // Sort by solved count (descending)
                userStats.sort((a, b) => (b.solved - a.solved))
                setUsers(userStats)
            })
            .catch(e => {
                setError(e.response?.data?.error || '加载排行榜失败')
            })
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="container loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">正在加载排行榜...</div>
    </div>
    if (error) return <div className="container error-message">{error}</div>

    return (
        <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem', fontWeight: '700' }}>排行榜</h2>
            {users.length === 0 ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>暂无用户数据</div>
            ) : (
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <table className="leaderboard-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '15px', textAlign: 'left' }}>排名</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>用户名</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>通过</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>提交</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, idx) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px', fontWeight: 'bold', color: idx < 3 ? '#667eea' : '#718096' }}>
                                        {idx === 0 ? '🥇 ' : idx === 1 ? '🥈 ' : idx === 2 ? '🥉 ' : ''}{idx + 1}
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <Link to={`/user/${user.id}`} style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
                                            #{user.id}
                                        </Link>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <Link to={`/user/${user.id}`} style={{ color: '#4a5568', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {user.avatar ? (
                                                <img src={user.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#edf2f7', color: '#718096', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span>{user.username}</span>
                                            {user.nickname && (
                                                <span style={{ color: '#a0aec0', fontWeight: 'normal', fontSize: '0.9em' }}>
                                                    ({user.nickname})
                                                </span>
                                            )}
                                        </Link>
                                    </td>
                                    <td style={{ padding: '15px', color: '#48bb78', fontWeight: 'bold' }}>{user.solved}</td>
                                    <td style={{ padding: '15px', color: '#718096' }}>{user.submissions}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <style>{`
                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 300px;
                    color: #667eea;
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 15px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .error-message {
                    color: #e53e3e;
                    padding: 20px;
                    text-align: center;
                    background: #fff5f5;
                    border-radius: 8px;
                    margin-top: 20px;
                }
            `}</style>
        </div>
    )
}
