import React, { useEffect, useState } from 'react'
import api from '../api'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

export default function UserProfile() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [formData, setFormData] = useState<any>({})
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
    const [isSaving, setIsSaving] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')
    const [heatmap, setHeatmap] = useState<Record<string, number>>({})

    useEffect(() => {
        Promise.all([
            api.get('/api/user/profile'),
            api.get('/api/user/submission-heatmap')
        ])
            .then(([profileRes, heatmapRes]) => {
                setUser(profileRes.data)
                setFormData(profileRes.data)
                setHeatmap(heatmapRes.data.data || {})
                document.title = `${profileRes.data.nickname || profileRes.data.username} - SSOJ`
            })
            .catch(e => setError(e.response?.data?.error || '加载失败'))
            .finally(() => setLoading(false))
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleSave = async () => {
        setIsSaving(true)
        setError('')
        setSuccessMsg('')
        try {
            await api.put('/api/user/profile', {
                nickname: formData.nickname,
                phone: formData.phone,
                profile: formData.profile
            })
            setUser(formData)
            setIsEditing(false)
            setSuccessMsg('资料更新成功！')
            setTimeout(() => setSuccessMsg(''), 3000)
        } catch (e: any) {
            setError(e.response?.data?.error || '保存失败')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setFormData(user)
        setIsEditing(false)
        setIsChangingPassword(false)
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
        setError('')
    }

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('两次输入的密码不一致')
            return
        }
        if (passwordData.newPassword.length < 6) {
            setError('新密码长度至少为6位')
            return
        }

        setIsSaving(true)
        setError('')
        setSuccessMsg('')
        try {
            await api.put('/api/user/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            })
            setIsChangingPassword(false)
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
            setSuccessMsg('密码修改成功！')
            setTimeout(() => setSuccessMsg(''), 3000)
        } catch (e: any) {
            setError(e.response?.data?.error || '密码修改失败')
        } finally {
            setIsSaving(false)
        }
    }

    if (loading) return <div className="container loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">正在加载个人资料...</div>
    </div>
    if (error && !user) return <div className="error-msg">{error}</div>
    if (!user) return <div className="empty-state">未登录</div>

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <div>
                        <h1>{user.nickname || user.username}</h1>
                        <p className="username">@{user.username}</p>
                    </div>
                    {!isEditing && !isChangingPassword && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="edit-btn"
                                onClick={() => setIsEditing(true)}
                            >
                                编辑资料
                            </button>
                            <button
                                className="edit-btn"
                                style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.5)' }}
                                onClick={() => setIsChangingPassword(true)}
                            >
                                修改密码
                            </button>
                        </div>
                    )}
                </div>

                <div className="profile-content">
                    {error && <div className="error-msg">{error}</div>}
                    {successMsg && <div className="success-msg">{successMsg}</div>}

                    {!isEditing && !isChangingPassword ? (
                        <>
                            <div className="profile-section">
                                <h2>用户信息</h2>
                                <div className="info-row">
                                    <span className="label">用户名：</span>
                                    <span className="value">{user.username}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">昵称：</span>
                                    <span className="value">{user.nickname || '未设置'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">邮箱：</span>
                                    <span className="value">{user.email}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">电话：</span>
                                    <span className="value">{user.phone || '未设置'}</span>
                                </div>
                                <div className="info-row">
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
                                                : 0}
                                            %
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {Object.keys(heatmap).length > 0 && (
                                <div className="heatmap-section">
                                    <h2>最近一年做题统计</h2>
                                    <div className="heatmap-grid">
                                        {Object.entries(heatmap)
                                            .sort()
                                            .map(([date, count]) => {
                                                const intensity = Math.min(count / 5, 1) // 最多显示5个深度
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
                            )}
                        </>
                    ) : isChangingPassword ? (
                        <form className="profile-form" onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
                            <div className="form-group">
                                <label>原密码</label>
                                <input
                                    type="password"
                                    value={passwordData.oldPassword}
                                    onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                    placeholder="输入当前密码"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>新密码</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="输入新密码（至少6位）"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>确认新密码</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="再次输入新密码"
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={isSaving}
                                >
                                    {isSaving ? '提交中...' : '确认修改'}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={handleCancel}
                                >
                                    取消
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form className="profile-form">
                            <div className="form-group">
                                <label>用户名（不可更改）</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    disabled
                                    className="input-disabled"
                                />
                            </div>

                            <div className="form-group">
                                <label>邮箱（不可更改）</label>
                                <input
                                    type="text"
                                    value={formData.email}
                                    disabled
                                    className="input-disabled"
                                />
                            </div>

                            <div className="form-group">
                                <label>昵称</label>
                                <input
                                    type="text"
                                    name="nickname"
                                    value={formData.nickname || ''}
                                    onChange={handleInputChange}
                                    placeholder="输入昵称"
                                />
                            </div>

                            <div className="form-group">
                                <label>电话</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleInputChange}
                                    placeholder="输入电话号码"
                                />
                            </div>

                            <div className="form-group">
                                <label>个人介绍</label>
                                <textarea
                                    name="profile"
                                    value={formData.profile || ''}
                                    onChange={handleInputChange}
                                    placeholder="输入个人介绍..."
                                    rows={5}
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="save-btn"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving ? '保存中...' : '保存'}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={handleCancel}
                                >
                                    取消
                                </button>
                            </div>
                        </form>
                    )}
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
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
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

                .edit-btn {
                    padding: 10px 20px;
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 2px solid white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                }

                .edit-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                }

                .error-msg {
                    background: #ffebee;
                    border-left: 4px solid #f44336;
                    color: #c62828;
                    padding: 12px 15px;
                    border-radius: 4px;
                    margin-bottom: 20px;
                }

                .success-msg {
                    background: #e8f5e9;
                    border-left: 4px solid #4caf50;
                    color: #2e7d32;
                    padding: 12px 15px;
                    border-radius: 4px;
                    margin-bottom: 20px;
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
                    font-size: 1.2em;
                }

                .info-row {
                    display: flex;
                    margin-bottom: 15px;
                    align-items: flex-start;
                }

                .label {
                    font-weight: bold;
                    min-width: 100px;
                    color: #666;
                }

                .value {
                    color: #333;
                    word-break: break-all;
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

                .role-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 20px;
                    font-size: 0.9em;
                    font-weight: 600;
                    width: fit-content;
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

                .profile-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-group label {
                    font-weight: 600;
                    color: #555;
                    margin-bottom: 8px;
                    font-size: 0.95em;
                }

                .form-group input,
                .form-group textarea {
                    padding: 12px 15px;
                    border: 2px solid #e0e0e0;
                    border-radius: 6px;
                    font-size: 1em;
                    font-family: inherit;
                    transition: all 0.3s;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 8px rgba(102, 126, 234, 0.2);
                }

                .input-disabled {
                    background: #f5f5f5;
                    cursor: not-allowed;
                    color: #999;
                }

                .input-disabled:focus {
                    border-color: #e0e0e0 !important;
                    box-shadow: none !important;
                }

                .form-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 20px;
                }

                .save-btn,
                .cancel-btn {
                    flex: 1;
                    padding: 12px 20px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1em;
                    transition: all 0.3s;
                }

                .save-btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .save-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
                }

                .save-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .cancel-btn {
                    background: #f0f0f0;
                    color: #555;
                }

                .cancel-btn:hover {
                    background: #e0e0e0;
                }

                .loading,
                .error-msg,
                .empty-state {
                    padding: 40px 20px;
                    text-align: center;
                    font-size: 1.1em;
                }

                @media (max-width: 768px) {
                    .profile-card {
                        border-radius: 0;
                    }

                    .profile-header {
                        flex-direction: column;
                        gap: 15px;
                        align-items: flex-start;
                    }

                    .profile-content {
                        padding: 20px;
                    }

                    .form-actions {
                        flex-direction: column;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    )
}
