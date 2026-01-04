import React, { useEffect, useState } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { AlertCircle } from 'lucide-react'
import { FoldableContent } from './Announcements'

export default function Dashboard() {
    const [user, setUser] = useState<any>(null)
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [problemStats, setProblemStats] = useState<any>(null)
    const [heatmap, setHeatmap] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showAnnForm, setShowAnnForm] = useState(false)
    const [annForm, setAnnForm] = useState({ title: '', content: '' })
    const [editingAnnId, setEditingAnnId] = useState<number | null>(null)

    const loadData = () => {
        setLoading(true)
        Promise.all([
            api.get('/api/user/profile').catch(() => ({ data: null })),
            api.get('/api/problem/list?page=1&size=5'),
            api.get('/api/announcement/list'),
            api.get('/api/user/submission-heatmap').catch(() => ({ data: {} }))
        ])
            .then(([userRes, probRes, annRes, heatmapRes]) => {
                setUser(userRes.data)
                setProblemStats({
                    total: probRes.data.total,
                    problems: probRes.data.data || []
                })
                setAnnouncements(annRes.data.data || [])
                setHeatmap(heatmapRes.data.data || {})
            })
            .catch(e => setError(e.response?.data?.error || '加载失败'))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleAnnSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingAnnId) {
                await api.put(`/api/announcement/${editingAnnId}`, annForm)
            } else {
                await api.post('/api/announcement', annForm)
            }
            setShowAnnForm(false)
            setAnnForm({ title: '', content: '' })
            setEditingAnnId(null)
            loadData()
        } catch (e: any) {
            alert(e.response?.data?.error || '操作失败')
        }
    }

    const handleEditAnn = (ann: any) => {
        setAnnForm({ title: ann.title, content: ann.content })
        setEditingAnnId(ann.id)
        setShowAnnForm(true)
    }

    const handleDeleteAnn = async (id: number) => {
        if (!window.confirm('确定要删除这条公告吗？')) return
        try {
            await api.delete(`/api/announcement/${id}`)
            loadData()
        } catch (e: any) {
            alert(e.response?.data?.error || '删除失败')
        }
    }

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">正在加载仪表盘...</div>
        </div>
    )

    if (error) return (
        <div className="error-container">
            <AlertCircle size={48} className="error-icon" style={{ color: 'var(--danger-color)', marginBottom: '16px' }} />
            <div className="error-msg">{error}</div>
        </div>
    )

    return (
        <div className="dashboard">
            <div className="announcements-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>公告与更新</h2>
                    {user?.role === 'ADMIN' && (
                        <button
                            onClick={() => {
                                setAnnForm({ title: '', content: '' })
                                setEditingAnnId(null)
                                setShowAnnForm(true)
                            }}
                            className="admin-btn"
                            style={{ padding: '6px 12px', fontSize: '14px' }}
                        >
                            发布公告
                        </button>
                    )}
                </div>

                {showAnnForm && (
                    <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
                        <h3>{editingAnnId ? '编辑公告' : '发布新公告'}</h3>
                        <form onSubmit={handleAnnSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>标题</label>
                                <input
                                    type="text"
                                    value={annForm.title}
                                    onChange={e => setAnnForm({ ...annForm, title: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>内容</label>
                                <textarea
                                    value={annForm.content}
                                    onChange={e => setAnnForm({ ...annForm, content: e.target.value })}
                                    required
                                    rows={5}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="admin-btn" style={{ border: 'none', cursor: 'pointer' }}>保存</button>
                                <button type="button" onClick={() => setShowAnnForm(false)} style={{ padding: '10px 20px', borderRadius: '4px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>取消</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="announcements-list">
                    {announcements.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>暂无公告</p>
                    ) : announcements.slice(0, 4).map((announcement: any) => (
                        <div key={announcement.id} className="announcement-item">
                            <div className="announcement-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <h3>{announcement.title}</h3>
                                    {user?.role === 'ADMIN' && (
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button onClick={() => handleEditAnn(announcement)} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: '12px' }}>编辑</button>
                                            <button onClick={() => handleDeleteAnn(announcement.id)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '12px' }}>删除</button>
                                        </div>
                                    )}
                                </div>
                                <span className="announcement-date">{new Date(announcement.createdAt).toLocaleDateString('zh-CN')}</span>
                            </div>
                            <div className="announcement-content">
                                <FoldableContent content={announcement.content} limit={100} />
                            </div>
                        </div>
                    ))}
                </div>
                {announcements.length > 4 && (
                    <div style={{ textAlign: 'right', marginTop: '15px' }}>
                        <Link to="/announcements" className="view-all">查看全部公告 →</Link>
                    </div>
                )}
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
                                        <span className={`difficulty-${p.difficulty.toLowerCase()}`}>
                                            {p.difficulty === 'EASY' ? '简单' : p.difficulty === 'MEDIUM' ? '中等' : '困难'}
                                        </span>
                                    </div>
                                    <div className="problem-stats">
                                        <span>提交 {p.numberOfSubmissions || 0}</span>
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
                        <div className="user-dashboard-card">
                            <div className="user-card-header" style={{
                                backgroundImage: user.backgroundImage ? `url(${user.backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                height: '100px',
                                borderRadius: '8px 8px 0 0',
                                position: 'relative'
                            }}>
                                <div className="user-card-avatar-wrapper">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="avatar" className="user-card-avatar" />
                                    ) : (
                                        <div className="user-card-avatar-placeholder">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="user-card-body">
                                <div className="user-card-info">
                                    <h3 className="user-card-name">{user.nickname || user.username}</h3>
                                    <p className="user-card-username">@{user.username}</p>
                                    {user.role === 'ADMIN' && (
                                        <div className="admin-badge">管理员</div>
                                    )}
                                </div>

                                {Object.keys(heatmap).length > 0 && (
                                    <div className="dashboard-heatmap-container">
                                        <div className="heatmap-grid">
                                            {Object.entries(heatmap)
                                                .sort()
                                                .slice(-90) // 只显示最近90天，避免在侧边栏太长
                                                .map(([date, count]) => {
                                                    const intensity = Math.min(count / 5, 1)
                                                    const colors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
                                                    const colorIdx = Math.floor(intensity * (colors.length - 1))
                                                    return (
                                                        <div
                                                            key={date}
                                                            className="heatmap-cell"
                                                            style={{ backgroundColor: colors[colorIdx] }}
                                                            title={`${date}: ${count} 次提交`}
                                                        />
                                                    )
                                                })}
                                        </div>
                                    </div>
                                )}

                                <div className="user-card-actions">
                                    <Link to="/profile" className="edit-profile-btn">个人主页</Link>
                                </div>
                            </div>
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

                .announcement-content {
                    color: #666;
                    font-size: 14px;
                    line-height: 1.5;
                    word-break: break-all;
                    overflow-wrap: break-word;
                }

                .markdown-body {
                    white-space: pre-wrap;
                }

                .markdown-body p {
                    margin-bottom: 1em;
                }

                .markdown-body p:last-child {
                    margin-bottom: 0;
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

                .user-dashboard-card {
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }

                .user-card-avatar-wrapper {
                    position: absolute;
                    bottom: -30px;
                    left: 20px;
                    padding: 3px;
                    background: white;
                    border-radius: 50%;
                }

                .user-card-avatar {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    object-fit: cover;
                    display: block;
                }

                .user-card-avatar-placeholder {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: #667eea;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: bold;
                }

                .user-card-body {
                    padding: 40px 20px 20px;
                }

                .user-card-name {
                    margin: 0;
                    font-size: 1.2em;
                    color: #333;
                }

                .user-card-username {
                    margin: 0;
                    color: #666;
                    font-size: 0.9em;
                }

                .dashboard-heatmap-container {
                    margin: 15px 0;
                    padding: 10px;
                    background: #f8f9fa;
                    border-radius: 4px;
                }

                .heatmap-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, 12px);
                    gap: 3px;
                    justify-content: center;
                }

                .heatmap-cell {
                    width: 12px;
                    height: 12px;
                    border-radius: 2px;
                }

                .user-card-actions {
                    margin-top: 15px;
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
                    border: none;
                    cursor: pointer;
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
