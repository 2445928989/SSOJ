import React, { useEffect, useState } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'

export function FoldableContent({ content, limit = 300 }: { content: string, limit?: number }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongContent = content.length > limit;
    const displayContent = (isLongContent && !isExpanded) ? content.substring(0, limit) + '...' : content;

    return (
        <div>
            <div className="markdown-body" style={{ whiteSpace: 'pre-wrap' }}>
                <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                >
                    {displayContent}
                </ReactMarkdown>
            </div>
            {isLongContent && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-color)',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        padding: '4px 0',
                        marginTop: '4px'
                    }}
                >
                    {isExpanded ? (
                        <><ChevronUp size={14} /> 收起</>
                    ) : (
                        <><ChevronDown size={14} /> 展开全文</>
                    )}
                </button>
            )}
        </div>
    );
}

export default function Announcements() {
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [user, setUser] = useState<any>(null)
    const [editingAnnId, setEditingAnnId] = useState<number | null>(null)
    const [annForm, setAnnForm] = useState({ title: '', content: '' })

    const loadData = () => {
        setLoading(true)
        Promise.all([
            api.get('/api/announcement/list'),
            api.get('/api/user/profile').catch(() => ({ data: null }))
        ])
            .then(([annRes, userRes]) => {
                setAnnouncements(annRes.data.data || [])
                setUser(userRes.data)
            })
            .catch(e => setError(e.response?.data?.error || '加载失败'))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleEditAnn = (ann: any) => {
        setAnnForm({ title: ann.title, content: ann.content })
        setEditingAnnId(ann.id)
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

    const handleAnnSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.put(`/api/announcement/${editingAnnId}`, annForm)
            setEditingAnnId(null)
            loadData()
        } catch (e: any) {
            alert(e.response?.data?.error || '保存失败')
        }
    }

    if (error) return (
        <div className="error-container">
            <AlertCircle size={48} className="error-icon" style={{ color: 'var(--danger-color)', marginBottom: '16px' }} />
            <div className="error-msg">{error}</div>
        </div>
    )

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>所有公告</h2>
            </div>

            {loading ? (
                <div className="loading-container" style={{ minHeight: '200px' }}>
                    <div className="loading-spinner"></div>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {announcements.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                            暂无公告
                        </div>
                    ) : announcements.map((ann: any, idx) => (
                        <div key={ann.id} className="announcement-list-item" style={{
                            padding: '25px',
                            borderBottom: idx === announcements.length - 1 ? 'none' : '1px solid var(--border-color)',
                            borderLeft: '5px solid var(--primary-color)',
                            position: 'relative',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            {editingAnnId === ann.id ? (
                                <div style={{ padding: '10px' }}>
                                    <h3 style={{ marginTop: 0 }}>编辑公告</h3>
                                    <form onSubmit={handleAnnSubmit}>
                                        <div style={{ marginBottom: '15px' }}>
                                            <input
                                                type="text"
                                                value={annForm.title}
                                                onChange={e => setAnnForm({ ...annForm, title: e.target.value })}
                                                required
                                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1.2rem', fontWeight: 'bold' }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <textarea
                                                value={annForm.content}
                                                onChange={e => setAnnForm({ ...annForm, content: e.target.value })}
                                                required
                                                rows={8}
                                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '1rem' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button type="submit" className="admin-btn" style={{ border: 'none', cursor: 'pointer' }}>保存修改</button>
                                            <button type="button" onClick={() => setEditingAnnId(null)} style={{ padding: '10px 20px', borderRadius: '4px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>取消</button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#333' }}>{ann.title}</h3>
                                            {user?.role === 'ADMIN' && (
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button onClick={() => handleEditAnn(ann)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>编辑</button>
                                                    <button onClick={() => handleDeleteAnn(ann.id)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>删除</button>
                                                </div>
                                            )}
                                        </div>
                                        <span style={{ color: '#999', fontSize: '0.9rem' }}>
                                            {new Date(ann.createdAt).toLocaleString('zh-CN')}
                                        </span>
                                    </div>
                                    <div style={{
                                        lineHeight: '1.6',
                                        color: '#4a5568',
                                        fontSize: '1.05rem',
                                        wordBreak: 'break-all',
                                        overflowWrap: 'break-word',
                                        marginBottom: '20px'
                                    }}>
                                        <FoldableContent content={ann.content} limit={500} />
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingTop: '15px',
                                        borderTop: '1px solid #edf2f7',
                                        marginTop: '15px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '24px', height: '24px', background: 'var(--primary-gradient)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                                                {(ann.authorName || '编').charAt(0)}
                                            </div>
                                            <span style={{ fontSize: '0.9rem', color: '#718096', fontWeight: '500' }}>
                                                {ann.authorName || '管理员'}
                                            </span>
                                        </div>
                                        <span style={{ color: '#a0aec0', fontSize: '0.85rem' }}>
                                            SSOJ 官方发布
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .back-btn {
                    padding: 8px 20px;
                    border-radius: 8px;
                    text-decoration: none;
                    color: var(--text-secondary);
                    background: white;
                    font-weight: 600;
                    border: 1.5px solid var(--border-color);
                    display: flex;
                    align-items: center;
                    transition: all 0.3s ease;
                }
                .back-btn:hover {
                    background: #f8fafc;
                    border-color: var(--primary-color);
                    color: var(--primary-color);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
            `}</style>
        </div>
    )
}
