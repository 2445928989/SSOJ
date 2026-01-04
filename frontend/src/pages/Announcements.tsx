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
                        color: '#667eea',
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

    useEffect(() => {
        api.get('/api/announcement/list')
            .then(res => {
                setAnnouncements(res.data.data || [])
            })
            .catch(e => setError(e.response?.data?.error || '加载失败'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">正在加载公告...</div>
        </div>
    )

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
                <Link to="/" className="back-btn">返回仪表盘</Link>
            </div>

            <div className="announcements-full-list">
                {announcements.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        暂无公告
                    </div>
                ) : announcements.map((ann: any) => (
                    <div key={ann.id} className="card announcement-card" style={{ marginBottom: '20px', padding: '25px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#333' }}>{ann.title}</h3>
                            <span style={{ color: '#999', fontSize: '0.9rem' }}>
                                {new Date(ann.createdAt).toLocaleString('zh-CN')}
                            </span>
                        </div>
                        <div style={{
                            lineHeight: '1.6',
                            color: '#4a5568',
                            fontSize: '1.05rem',
                            wordBreak: 'break-all',
                            overflowWrap: 'break-word'
                        }}>
                            <FoldableContent content={ann.content} />
                        </div>
                        <div style={{ marginTop: '15px', fontSize: '0.85rem', color: '#a0aec0', textAlign: 'right' }}>
                            发布者: {ann.authorName || '管理员'}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .announcement-card {
                    transition: transform 0.2s, box-shadow 0.2s;
                    border-left: 5px solid #667eea;
                }
                .announcement-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
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
