import React, { useEffect, useState } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'

export default function Dashboard() {
    const [user, setUser] = useState<any>(null)
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [problemStats, setProblemStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        Promise.all([
            api.get('/api/user/profile').catch(() => ({ data: null })),
            api.get('/api/problem/list?page=1&size=5')
        ])
            .then(([userRes, probRes]) => {
                setUser(userRes.data)
                setProblemStats({
                    total: probRes.data.total,
                    problems: probRes.data.data || []
                })
                // Mock announcements
                setAnnouncements([
                    {
                        id: 1,
                        title: '欢迎来到 SSOJ',
                        content: 'SSOJ 是一个现代化的在线编程练习平台，支持多种编程语言和实时评测。',
                        date: new Date().toLocaleDateString('zh-CN')
                    },
                    {
                        id: 2,
                        title: '平台功能介绍',
                        content: '平台包含题目库、实时评测、排行榜等功能，帮助您提升编程技能。',
                        date: new Date(Date.now() - 86400000).toLocaleDateString('zh-CN')
                    }
                ])
            })
            .catch(e => setError(e.response?.data?.error || '加载失败'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="container"><div>加载中...</div></div>
    if (error) return <div className="container error">{error}</div>

    return (
        <div className="dashboard">
            <div className="announcements-section">
                <h2>公告与更新</h2>
                <div className="announcements-list">
                    {announcements.map((announcement: any) => (
                        <div key={announcement.id} className="announcement-item">
                            <div className="announcement-header">
                                <h3>{announcement.title}</h3>
                                <span className="announcement-date">{announcement.date}</span>
                            </div>
                            <p>{announcement.content}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="content-grid">
                <div className="section">
                    <h2>热门题目</h2>
                    {problemStats?.problems && problemStats.problems.length === 0 ? (
                        <p className="empty-state">暂无题目</p>
                    ) : (
                        <div className="problems-list">
                            {problemStats?.problems?.slice(0, 5).map((p: any) => (
                                <div key={p.id} className="problem-item">
                                    <div className="problem-header">
                                        <Link to={`/problems/${p.id}`} className="problem-title">{p.title}</Link>
                                        <span className={`difficulty-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                                    </div>
                                    <div className="problem-stats">
                                        <span>投稿 {p.numberOfSubmissions || 0}</span>
                                        <span>通过 {p.numberOfAccepted || 0}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="section-footer">
                        <Link to="/problems" className="view-all">查看所有 →</Link>
                    </div>
                </div>

                {user && (
                    <div className="section">
                        <h2>个人信息</h2>
                        <div className="user-info-card">
                            <div className="user-info-item">
                                <span className="label">用户名：</span>
                                <span className="value">{user.username}</span>
                            </div>
                            <div className="user-info-item">
                                <span className="label">邮箱：</span>
                                <span className="value">{user.email}</span>
                            </div>
                            {user.role === 'ADMIN' && (
                                <div className="admin-badge">管理员</div>
                            )}
                            <Link to="/profile" className="edit-profile-btn">编辑资料</Link>
                        </div>
                    </div>
                )}
            </div>

            {user && user.role === 'ADMIN' && (
                <div className="admin-section">
                    <h2>管理员面板</h2>
                    <div className="admin-links">
                        <Link to="/admin/problems" className="admin-btn">管理题目</Link>
                    </div>
                </div>
            )}

            <style>{`
                .dashboard {
                    animation: fadeIn 0.3s ease-in;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .announcements-section {
                    margin-bottom: 40px;
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 20px;
                }

                .announcements-section h2 {
                    margin-top: 0;
                    color: #333;
                }

                .announcements-list {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .announcement-item {
                    padding: 15px;
                    border-left: 4px solid #667eea;
                    background: #f9f9f9;
                    border-radius: 4px;
                    transition: all 0.3s;
                }

                .announcement-item:hover {
                    background: #f0f0f0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                .announcement-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .announcement-header h3 {
                    margin: 0;
                    color: #333;
                    font-size: 1.1em;
                }

                .announcement-date {
                    color: #999;
                    font-size: 0.9em;
                }

                .announcement-item p {
                    margin: 0;
                    color: #666;
                    line-height: 1.5;
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 30px;
                    margin-bottom: 40px;
                }

                .section {
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 20px;
                }

                .section h2 {
                    margin-top: 0;
                    color: #333;
                }

                .problems-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .problem-item {
                    padding: 12px;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    transition: all 0.3s;
                }

                .problem-item:hover {
                    background: #f9f9f9;
                    border-color: #667eea;
                }

                .problem-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .problem-title {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 500;
                    flex: 1;
                }

                .problem-title:hover {
                    text-decoration: underline;
                }

                .difficulty-easy { background: #4caf50; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.8em; }
                .difficulty-medium { background: #ff9800; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.8em; }
                .difficulty-hard { background: #f44336; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.8em; }

                .problem-stats {
                    display: flex;
                    gap: 15px;
                    font-size: 0.9em;
                    color: #666;
                }

                .section-footer {
                    margin-top: 15px;
                    text-align: right;
                }

                .view-all {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 500;
                    transition: all 0.3s;
                }

                .view-all:hover {
                    color: #764ba2;
                }

                .empty-state {
                    text-align: center;
                    color: #999;
                    padding: 20px;
                }

                .user-info-card {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .user-info-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid #e0e0e0;
                }

                .user-info-item .label {
                    color: #666;
                    font-weight: 500;
                }

                .user-info-item .value {
                    color: #333;
                }

                .admin-badge {
                    display: inline-block;
                    background: #ff9800;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 4px;
                    font-size: 0.9em;
                    font-weight: 600;
                    margin-top: 10px;
                }

                .edit-profile-btn {
                    display: inline-block;
                    margin-top: 15px;
                    padding: 8px 16px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                    transition: background 0.3s;
                    font-weight: 500;
                }

                .edit-profile-btn:hover {
                    background: #764ba2;
                }

                .admin-section {
                    background: #fff3e0;
                    border: 2px solid #ff9800;
                    border-radius: 8px;
                    padding: 20px;
                    margin-top: 30px;
                }

                .admin-section h2 {
                    margin-top: 0;
                    color: #ff9800;
                }

                .admin-links {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .admin-btn {
                    display: inline-block;
                    padding: 10px 20px;
                    background: #ff9800;
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                    transition: background 0.3s;
                }

                .admin-btn:hover {
                    background: #f57c00;
                }

                @media (max-width: 768px) {
                    .content-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    )
}
