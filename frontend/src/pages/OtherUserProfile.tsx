import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

export default function OtherUserProfile() {
    const { userId } = useParams()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [heatmap, setHeatmap] = useState<Record<string, number>>({})

    useEffect(() => {
        if (!userId) return

        Promise.all([
            api.get(`/api/user/${userId}`),
            api.get(`/api/user/${userId}/submission-heatmap`)
        ])
            .then(([userRes, heatmapRes]) => {
                setUser(userRes.data)
                setHeatmap(heatmapRes.data.data || {})
            })
            .catch(e => setError(e.response?.data?.error || '加载失败'))
            .finally(() => setLoading(false))
    }, [userId])

    if (loading) return <div className="container loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">正在加载用户信息...</div>
    </div>
    if (error) return <div className="error-msg">{error}</div>
    if (!user) return <div className="empty-state">用户不存在</div>

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <h1>{user.nickname || user.username}</h1>
                    <p className="username">@{user.username}</p>
                </div>

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
                                    return (
                                        <div
                                            key={date}
                                            className="heatmap-cell"
                                            style={{
                                                backgroundColor: `rgba(102, 126, 234, ${intensity})`,
                                            }}
                                            title={`${date}: ${count} 次提交`}
                                        />
                                    )
                                })}
                        </div>
                        <div className="heatmap-legend">
                            <span>少</span>
                            <div style={{ display: 'flex', gap: '2px' }}>
                                <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(102, 126, 234, 0.1)' }}></div>
                                <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(102, 126, 234, 0.4)' }}></div>
                                <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(102, 126, 234, 0.7)' }}></div>
                                <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(102, 126, 234, 1)' }}></div>
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

                .profile-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 40px 30px;
                }

                .profile-header h1 {
                    margin: 0 0 10px 0;
                    font-size: 2em;
                }

                .profile-header .username {
                    margin: 0;
                    opacity: 0.9;
                    font-size: 1.1em;
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
