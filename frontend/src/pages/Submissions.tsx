import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { AlertCircle } from 'lucide-react'

export default function Submissions() {
    const [subs, setSubs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        api.get('/api/submission/recent')
            .then(res => setSubs(res.data.data || []))
            .catch(e => setError(e.response?.data?.error || 'Failed to load'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">正在加载提交记录...</div>
        </div>
    )

    if (error) return (
        <div className="error-container">
            <AlertCircle size={48} className="error-icon" style={{ color: 'var(--danger-color)', marginBottom: '16px' }} />
            <div className="error-msg">{error}</div>
        </div>
    )

    return (
        <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
            <h2 style={{ marginBottom: '30px', fontSize: '2rem', fontWeight: '700' }}>最近提交</h2>
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                            <th style={{ padding: '15px', textAlign: 'left' }}>ID</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>用户</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>问题</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>状态</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>时间</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>内存</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>提交时间</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subs.map(s => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px' }}><Link to={`/submissions/${s.id}`} style={{ color: '#667eea', fontWeight: '600' }}>#{s.id}</Link></td>
                                <td style={{ padding: '15px' }}>
                                    <Link to={`/user/${s.userId}`} style={{ color: '#4a5568', textDecoration: 'none', fontWeight: '500' }}>
                                        {s.username || '未知用户'}
                                        {s.nickname && (
                                            <span style={{ color: '#a0aec0', fontWeight: 'normal', fontSize: '0.9em', marginLeft: '8px' }}>
                                                ({s.nickname})
                                            </span>
                                        )}
                                    </Link>
                                </td>
                                <td style={{ padding: '15px' }}><Link to={`/problems/${s.problemId}`} style={{ color: '#4a5568', textDecoration: 'none' }}>{s.problemTitle || `问题 ${s.problemId}`}</Link></td>
                                <td style={{ padding: '15px' }}>
                                    <Link to={`/submissions/${s.id}`} style={{ textDecoration: 'none' }}>
                                        <span className={`status-${s.status.toLowerCase()}`}
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: '4px',
                                                fontSize: '13px',
                                                fontWeight: 'bold',
                                                backgroundColor: s.status === 'AC' ? '#48bb78' : s.status === 'WA' ? '#f56565' : s.status === 'TLE' ? '#ed8936' : s.status === 'RE' ? '#e53e3e' : '#9f7aea',
                                                color: 'white',
                                                cursor: 'pointer',
                                                display: 'inline-block',
                                                minWidth: '40px',
                                                textAlign: 'center'
                                            }}>
                                            {s.status}
                                        </span>
                                    </Link>
                                </td>
                                <td style={{ padding: '15px', color: '#718096' }}>{s.maxTimeUsed || 0}ms</td>
                                <td style={{ padding: '15px', color: '#718096' }}>{s.maxMemoryUsed || 0}KB</td>
                                <td style={{ padding: '15px', color: '#a0aec0', fontSize: '13px' }}>{new Date(s.submittedAt).toLocaleString('zh-CN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
