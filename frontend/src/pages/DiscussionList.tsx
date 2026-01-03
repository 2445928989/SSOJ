import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api'

export default function DiscussionList() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [discussions, setDiscussions] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const page = parseInt(searchParams.get('page') || '1')
    const size = 20
    const keyword = searchParams.get('keyword') || ''

    useEffect(() => {
        setLoading(true)
        api.get(`/api/discussion/list?page=${page}&size=${size}&keyword=${keyword}`)
            .then(res => {
                setDiscussions(res.data.data)
                setTotal(res.data.total)
            })
            .catch(e => setError(e.response?.data?.error || '加载讨论失败'))
            .finally(() => setLoading(false))
    }, [page, keyword])

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const newKeyword = formData.get('keyword') as string
        setSearchParams({ keyword: newKeyword, page: '1' })
    }

    const totalPages = Math.ceil(total / size)

    if (loading && discussions.length === 0) return <div className="container loading">正在加载讨论...</div>

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>讨论区</h1>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        name="keyword"
                        defaultValue={keyword}
                        placeholder="搜索内容、用户、题目..."
                        style={{
                            padding: '8px 15px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            width: '300px',
                            outline: 'none'
                        }}
                    />
                    <button type="submit" className="submit-btn" style={{ padding: '8px 20px' }}>搜索</button>
                </form>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <div className="discussion-list-card">
                {discussions.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#999', background: 'white', borderRadius: '8px' }}>
                        暂无讨论内容
                    </div>
                ) : (
                    <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        {discussions.map((d) => (
                            <div key={d.id} className="discussion-list-item" style={{
                                padding: '20px',
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                gap: '15px'
                            }}>
                                <div className="avatar">
                                    {d.avatar ? (
                                        <img src={d.avatar} alt="" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{
                                            width: '45px',
                                            height: '45px',
                                            borderRadius: '50%',
                                            background: '#edf2f7',
                                            color: '#718096',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold'
                                        }}>
                                            {(d.nickname || d.username || '?').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontWeight: '600', color: '#2d3748' }}>{d.nickname || d.username}</span>
                                            <span style={{ color: '#a0aec0', fontSize: '12px' }}>{new Date(d.createdAt).toLocaleString()}</span>
                                        </div>
                                        <Link to={`/problems/${d.problemId}`} style={{
                                            fontSize: '13px',
                                            color: '#667eea',
                                            textDecoration: 'none',
                                            background: '#f0f4ff',
                                            padding: '2px 10px',
                                            borderRadius: '12px'
                                        }}>
                                            #{d.problemId} {d.problemTitle}
                                        </Link>
                                    </div>
                                    <div style={{ color: '#4a5568', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                        {d.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination" style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setSearchParams({ keyword, page: (i + 1).toString() })}
                            style={{
                                padding: '8px 15px',
                                borderRadius: '4px',
                                border: '1px solid #e2e8f0',
                                background: page === i + 1 ? '#667eea' : 'white',
                                color: page === i + 1 ? 'white' : '#4a5568',
                                cursor: 'pointer'
                            }}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
