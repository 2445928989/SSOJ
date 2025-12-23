import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

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

    if (loading) return <div>Loading submissions...</div>
    if (error) return <div className="error">{error}</div>

    return (
        <div>
            <h2>最近提交</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ccc' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>用户</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>问题</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>状态</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>时间</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>内存</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>提交时间</th>
                    </tr>
                </thead>
                <tbody>
                    {subs.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}><Link to={`/submissions/${s.id}`}>{s.id}</Link></td>
                            <td style={{ padding: '10px' }}><Link to={`/user/${s.userId}`} style={{ color: '#667eea', textDecoration: 'none' }}>{s.username || '未知用户'}</Link></td>
                            <td style={{ padding: '10px' }}><Link to={`/problems/${s.problemId}`} style={{ color: '#667eea', textDecoration: 'none' }}>{s.problemTitle || `问题 ${s.problemId}`}</Link></td>
                            <td style={{ padding: '10px' }}>
                                <Link to={`/submissions/${s.id}`} style={{ textDecoration: 'none' }}>
                                    <span className={`status-${s.status.toLowerCase()}`}
                                        style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontWeight: 'bold',
                                            backgroundColor: s.status === 'AC' ? '#4caf50' : s.status === 'WA' ? '#f44336' : s.status === 'TLE' ? '#ff9800' : s.status === 'RE' ? '#e91e63' : '#9c27b0',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}>
                                        {s.status}
                                    </span>
                                </Link>
                            </td>
                            <td style={{ padding: '10px' }}>{s.maxTimeUsed || 0}ms</td>
                            <td style={{ padding: '10px' }}>{s.maxMemoryUsed || 0}KB</td>
                            <td style={{ padding: '10px' }}>{new Date(s.submittedAt).toLocaleString('zh-CN')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
