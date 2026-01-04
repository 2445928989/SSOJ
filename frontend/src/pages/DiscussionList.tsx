import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api'
import { ThumbsUp, ThumbsDown, MessageSquare, User as UserIcon, Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

function MarkdownContent({ content }: { content: string }) {
    // 处理 @username 格式，将其转换为链接
    // 链接到 /user/profile?username=xxx，由 UserProfile 页面处理
    const processedContent = content.replace(/@(\w+)/g, '[@$1](/user/profile?username=$1)');

    return (
        <div className="markdown-body">
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    a: ({ node, ...props }) => {
                        const href = props.href || '#';
                        if (href.startsWith('/')) {
                            return <Link to={href} style={{ color: '#667eea', fontWeight: '500', textDecoration: 'none' }}>{props.children}</Link>;
                        }
                        return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', fontWeight: '500' }}>{props.children}</a>;
                    }
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
}

function DiscussionListItem({ d, onVote, onReplySuccess }: { d: any, onVote: () => void, onReplySuccess: () => void }) {
    const [voteStatus, setVoteStatus] = useState(0);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState<any[]>([]);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [replyTo, setReplyTo] = useState<{ id: number, username: string } | null>(null);

    useEffect(() => {
        api.get(`/api/votes/status?type=DISCUSSION&targetId=${d.id}`)
            .then(res => setVoteStatus(res.data.data))
            .catch(() => { });
    }, [d.id]);

    const handleVote = async (voteType: number) => {
        try {
            const res = await api.post('/api/votes', {
                type: 'DISCUSSION',
                targetId: d.id,
                voteType: voteType
            });
            if (res.data.success) {
                onVote();
                api.get(`/api/votes/status?type=DISCUSSION&targetId=${d.id}`)
                    .then(res => setVoteStatus(res.data.data));
            }
        } catch (e) {
            alert('操作失败，请先登录');
        }
    };

    const fetchReplies = async () => {
        if (showReplies) {
            setShowReplies(false);
            return;
        }
        setLoadingReplies(true);
        try {
            const res = await api.get(`/api/discussion/${d.id}`);
            if (res.data.success) {
                setReplies(res.data.data.replies || []);
                setShowReplies(true);
            }
        } catch (e) {
            console.error('Failed to fetch replies', e);
        } finally {
            setLoadingReplies(false);
        }
    };

    const handleReply = async () => {
        if (!replyContent.trim()) return;
        setSubmitting(true);
        try {
            const res = await api.post('/api/discussion/add', {
                problemId: d.problemId,
                parentId: replyTo ? replyTo.id : d.id,
                content: replyContent
            });
            if (res.data.success) {
                setReplyContent('');
                setShowReplyInput(false);
                setReplyTo(null);
                onReplySuccess();
                // 如果回复列表已展开，刷新回复列表
                if (showReplies) {
                    const res2 = await api.get(`/api/discussion/${d.id}`);
                    if (res2.data.success) setReplies(res2.data.data.replies || []);
                } else {
                    fetchReplies(); // 自动展开并显示新回复
                }
            } else {
                alert(res.data.message || '回复失败');
            }
        } catch (e: any) {
            alert(e.response?.data?.message || '回复失败，请先登录');
        } finally {
            setSubmitting(false);
        }
    };

    const startReply = (targetId: number, targetUsername: string) => {
        setReplyTo({ id: targetId, username: targetUsername });
        setShowReplyInput(true);
        setReplyContent('');
    };

    return (
        <div className="discussion-list-item-container" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div className="discussion-list-item" style={{
                padding: '20px',
                display: 'flex',
                gap: '15px'
            }}>
                <Link to={`/user/${d.userId}`} className="avatar">
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
                </Link>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link to={`/user/${d.userId}`} style={{ fontWeight: '600', color: '#2d3748', textDecoration: 'none' }}>
                                {d.nickname || d.username}
                            </Link>
                            <span style={{ color: '#a0aec0', fontSize: '12px' }}>{new Date(d.createdAt).toLocaleString()}</span>
                        </div>
                        {d.problemId && (
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
                        )}
                    </div>
                    <div style={{ color: '#4a5568', fontSize: '15px', lineHeight: '1.6', marginBottom: '12px' }}>
                        <MarkdownContent content={d.content} />
                    </div>
                    <div style={{ display: 'flex', gap: '20px', color: '#94a3b8', fontSize: '13px' }}>
                        <button
                            onClick={() => handleVote(1)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: voteStatus === 1 ? '#667eea' : '#94a3b8',
                                padding: 0,
                                transition: 'color 0.2s'
                            }}
                        >
                            <ThumbsUp size={14} fill={voteStatus === 1 ? 'currentColor' : 'none'} />
                            <span>{d.likes || 0}</span>
                        </button>
                        <button
                            onClick={() => handleVote(-1)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: voteStatus === -1 ? '#e53e3e' : '#94a3b8',
                                padding: 0,
                                transition: 'color 0.2s'
                            }}
                        >
                            <ThumbsDown size={14} fill={voteStatus === -1 ? 'currentColor' : 'none'} />
                            <span>{d.dislikes || 0}</span>
                        </button>
                        <button
                            onClick={fetchReplies}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: showReplies ? '#667eea' : '#94a3b8',
                                padding: 0
                            }}
                        >
                            <MessageSquare size={14} />
                            <span>{d.repliesCount || 0} 回复</span>
                        </button>
                        <button
                            onClick={() => {
                                if (showReplyInput && !replyTo) {
                                    setShowReplyInput(false);
                                } else {
                                    setReplyTo(null);
                                    setShowReplyInput(true);
                                }
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#667eea',
                                padding: 0,
                                fontSize: '13px',
                                fontWeight: '500'
                            }}
                        >
                            {(showReplyInput && !replyTo) ? '取消回复' : '回复'}
                        </button>
                    </div>

                    {showReplyInput && (
                        <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder={replyTo ? `回复 @${replyTo.username}...` : "写下你的回复..."}
                                style={{
                                    width: '100%',
                                    minHeight: '80px',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '14px',
                                    outline: 'none',
                                    resize: 'vertical'
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>支持 Markdown 语法</span>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {replyTo && (
                                        <button
                                            onClick={() => { setShowReplyInput(false); setReplyTo(null); }}
                                            style={{
                                                padding: '6px 15px',
                                                background: '#f1f5f9',
                                                color: '#475569',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '13px'
                                            }}
                                        >
                                            取消
                                        </button>
                                    )}
                                    <button
                                        onClick={handleReply}
                                        disabled={submitting || !replyContent.trim()}
                                        style={{
                                            padding: '6px 20px',
                                            background: '#667eea',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            opacity: (submitting || !replyContent.trim()) ? 0.7 : 1
                                        }}
                                    >
                                        {submitting ? '提交中...' : '提交回复'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showReplies && (
                        <div style={{
                            marginTop: '15px',
                            padding: '15px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px'
                        }}>
                            {replies.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>暂无回复</div>
                            ) : (
                                replies.map(reply => (
                                    <div key={reply.id} style={{ display: 'flex', gap: '12px' }}>
                                        <Link to={`/user/${reply.userId}`}>
                                            {reply.avatar ? (
                                                <img src={reply.avatar} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{
                                                    width: '30px',
                                                    height: '30px',
                                                    borderRadius: '50%',
                                                    background: '#edf2f7',
                                                    color: '#718096',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {(reply.nickname || reply.username || '?').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </Link>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Link to={`/user/${reply.userId}`} style={{ fontWeight: '600', color: '#2d3748', textDecoration: 'none', fontSize: '13px' }}>
                                                        {reply.nickname || reply.username}
                                                    </Link>
                                                    <span style={{ color: '#a0aec0', fontSize: '11px' }}>{new Date(reply.createdAt).toLocaleString()}</span>
                                                </div>
                                                <button
                                                    onClick={() => startReply(reply.id, reply.nickname || reply.username)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#667eea',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        padding: '2px 5px'
                                                    }}
                                                >
                                                    回复
                                                </button>
                                            </div>
                                            <div style={{ color: '#4a5568', fontSize: '14px', lineHeight: '1.5' }}>
                                                {reply.replyToUsername && reply.parentId !== d.id && (
                                                    <span style={{ color: '#667eea', marginRight: '8px', fontWeight: '500' }}>
                                                        回复 <Link to={`/user/${reply.replyToUserId}`} style={{ color: '#667eea', textDecoration: 'none' }}>@{reply.replyToUsername}</Link> :
                                                    </span>
                                                )}
                                                <MarkdownContent content={reply.content} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function DiscussionList() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [discussions, setDiscussions] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showNewPost, setShowNewPost] = useState(false)
    const [newPostContent, setNewPostContent] = useState('')
    const [submitting, setSubmitting] = useState(false)

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

    const handleNewPost = async () => {
        if (!newPostContent.trim()) return;
        setSubmitting(true);
        try {
            const res = await api.post('/api/discussion/add', {
                content: newPostContent
            });
            if (res.data.success) {
                setNewPostContent('');
                setShowNewPost(false);
                refreshDiscussions();
            } else {
                alert(res.data.message || '发布失败');
            }
        } catch (e: any) {
            alert(e.response?.data?.message || '发布失败，请先登录');
        } finally {
            setSubmitting(false);
        }
    };

    const totalPages = Math.ceil(total / size)

    const refreshDiscussions = () => {
        api.get(`/api/discussion/list?page=${page}&size=${size}&keyword=${keyword}`)
            .then(res => {
                setDiscussions(res.data.data)
                setTotal(res.data.total)
            })
            .catch(() => { });
    };

    if (loading && discussions.length === 0) return <div className="container loading">正在加载讨论...</div>

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>讨论区</h1>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                        onClick={() => setShowNewPost(!showNewPost)}
                        style={{
                            padding: '8px 20px',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        {showNewPost ? '取消发布' : '+ 发起讨论'}
                    </button>
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
            </div>

            {showNewPost && (
                <div className="card" style={{ marginBottom: '30px', padding: '20px' }}>
                    <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="分享你的想法..."
                        style={{
                            width: '100%',
                            minHeight: '120px',
                            padding: '15px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '15px',
                            outline: 'none',
                            resize: 'vertical',
                            marginBottom: '15px'
                        }}
                    />
                    <div style={{ textAlign: 'right' }}>
                        <button
                            onClick={handleNewPost}
                            disabled={submitting || !newPostContent.trim()}
                            style={{
                                padding: '10px 30px',
                                background: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                opacity: (submitting || !newPostContent.trim()) ? 0.7 : 1
                            }}
                        >
                            {submitting ? '发布中...' : '发布讨论'}
                        </button>
                    </div>
                </div>
            )}

            {error && <div className="error" style={{ marginBottom: '20px' }}>{error}</div>}

            <div className="discussion-list-card">
                {discussions.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#999', background: 'white', borderRadius: '8px' }}>
                        暂无讨论内容
                    </div>
                ) : (
                    <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        {discussions.map((d) => (
                            <DiscussionListItem key={d.id} d={d} onVote={refreshDiscussions} onReplySuccess={refreshDiscussions} />
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

            <style>{`
                .submit-btn {
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .submit-btn:hover {
                    background: #5a67d8;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }

                .submit-btn:active {
                    transform: translateY(0);
                }

                .discussion-list-item:hover {
                    background-color: #f8fafc !important;
                }

                .error-msg {
                    background: #fff5f5;
                    color: #c53030;
                    padding: 12px 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border: 1px solid #feb2b2;
                }
            `}</style>
        </div>
    )
}
