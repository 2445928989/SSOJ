import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import api from '../api'
import { ThumbsUp, ThumbsDown, MessageSquare, Send, User as UserIcon, AlertCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

function MarkdownContent({ content }: { content: string }) {
    // 处理 @username 格式，将其转换为链接
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

export default function ProblemDetail() {
    const { id } = useParams()
    const [problem, setProblem] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showTags, setShowTags] = useState(false)
    const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({})
    const [discussions, setDiscussions] = useState<any[]>([])
    const [newDiscussion, setNewDiscussion] = useState('')
    const [submittingDiscussion, setSubmittingDiscussion] = useState(false)
    const [voteStatus, setVoteStatus] = useState<number>(0) // 0: none, 1: like, -1: dislike
    const [replyTo, setReplyTo] = useState<any>(null)
    const [currentUser, setCurrentUser] = useState<any>(null)

    // 格式化内存大小显示（超过1MB用MB单位）
    const formatMemory = (kb: number) => {
        if (kb >= 1024) {
            return `${(kb / 1024).toFixed(1)}MB`
        }
        return `${kb}KB`
    }

    const handleCopy = (text: string, key: string) => {
        if (!text) return;

        const doCopy = () => {
            setCopyStatus(prev => ({ ...prev, [key]: true }));
            setTimeout(() => {
                setCopyStatus(prev => ({ ...prev, [key]: false }));
            }, 2000);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(doCopy).catch(() => {
                // Fallback to traditional method if clipboard API fails
                fallbackCopy(text, doCopy);
            });
        } else {
            fallbackCopy(text, doCopy);
        }
    }

    const fallbackCopy = (text: string, callback: () => void) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            const successful = document.execCommand('copy');
            if (successful) callback();
        } catch (err) {
            console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
    }

    useEffect(() => {
        if (!id) return
        api.get(`/api/problem/${id}`)
            .then(res => {
                setProblem(res.data)
                document.title = `${res.data.title} - SSOJ`
            })
            .catch(e => setError(e.response?.data?.error || '加载失败'))
            .finally(() => setLoading(false))

        fetchDiscussions()
        fetchVoteStatus()

        // 获取当前用户信息
        api.get('/api/user/profile')
            .then(res => setCurrentUser(res.data))
            .catch(() => setCurrentUser(null))
    }, [id])

    const fetchDiscussions = () => {
        if (!id) return
        api.get(`/api/discussion/problem/${id}`)
            .then(res => setDiscussions(res.data))
            .catch(() => { })
    }

    const fetchVoteStatus = () => {
        if (!id) return
        api.get(`/api/votes/status?type=PROBLEM&targetId=${id}`)
            .then(res => setVoteStatus(res.data.data))
            .catch(() => { })
    }

    const handleVote = async (voteType: number) => {
        try {
            const res = await api.post('/api/votes', {
                type: 'PROBLEM',
                targetId: id,
                voteType: voteType
            })
            if (res.data.success) {
                fetchVoteStatus()
                // 重新获取题目信息以更新点赞数
                api.get(`/api/problem/${id}`).then(res => setProblem(res.data))
            }
        } catch (e: any) {
            alert('操作失败，请先登录')
        }
    }

    const handleAddDiscussion = async () => {
        if (!newDiscussion.trim()) return
        setSubmittingDiscussion(true)
        try {
            const res = await api.post('/api/discussion/add', {
                problemId: id,
                parentId: replyTo?.id || null,
                content: newDiscussion
            })
            if (res.data.success) {
                setNewDiscussion('')
                setReplyTo(null)
                fetchDiscussions()
            } else {
                alert(res.data.message || '发布失败')
            }
        } catch (e: any) {
            alert(e.response?.data?.message || '发布失败，请先登录')
        } finally {
            setSubmittingDiscussion(false)
        }
    }

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">正在加载题目详情...</div>
        </div>
    )

    if (error) return (
        <div className="error-container">
            <AlertCircle size={48} className="error-icon" style={{ color: 'var(--danger-color)', marginBottom: '16px' }} />
            <div className="error-msg">{error}</div>
        </div>
    )

    if (!problem) return (
        <div className="error-container">
            <AlertCircle size={48} className="error-icon" style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
            <div className="error-msg" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)', backgroundColor: '#f8f9fa' }}>题目不存在</div>
        </div>
    )

    const passRate = problem.numberOfSubmissions > 0
        ? ((problem.numberOfAccepted / problem.numberOfSubmissions) * 100).toFixed(1)
        : 0

    return (
        <div className="problem-wrapper">
            {/* 标题部分 */}
            <div className="problem-title-bar">
                <h1>#{problem.id}. {problem.title}</h1>
            </div>

            {/* 基本信息 + 提交按钮 */}
            <div className="problem-meta-bar">
                <div className="meta-left">
                    <span className="meta-badge meta-time">{problem.timeLimit}s</span>
                    <span className="meta-badge meta-memory">{formatMemory(problem.memoryLimit)}</span>
                    <span className={`meta-badge difficulty-${problem.difficulty?.toLowerCase()}`}>
                        {problem.difficulty === 'EASY' ? '简单' :
                            problem.difficulty === 'MEDIUM' ? '中等' :
                                problem.difficulty === 'HARD' ? '困难' : problem.difficulty}
                    </span>

                    <div className="vote-buttons">
                        <button
                            className={`vote-btn like ${voteStatus === 1 ? 'active' : ''}`}
                            onClick={() => handleVote(1)}
                            title="点赞"
                        >
                            <ThumbsUp size={16} />
                            <span>{problem.likes || 0}</span>
                        </button>
                        <button
                            className={`vote-btn dislike ${voteStatus === -1 ? 'active' : ''}`}
                            onClick={() => handleVote(-1)}
                            title="点踩"
                        >
                            <ThumbsDown size={16} />
                            <span>{problem.dislikes || 0}</span>
                        </button>
                    </div>

                    {problem.categories && problem.categories.length > 0 && (
                        <button
                            className="toggle-tags-btn"
                            onClick={() => setShowTags(!showTags)}
                        >
                            {showTags ? '隐藏分类标签' : '显示分类标签'}
                        </button>
                    )}

                    {showTags && problem.categories && problem.categories.length > 0 && (
                        <>
                            <span className="meta-label">标签</span>
                            {problem.categories.map(cat => (
                                <span key={cat} className="meta-tag">{cat}</span>
                            ))}
                        </>
                    )}
                </div>
                <Link to={`/submit/${problem.id}`} className="submit-btn">
                    提交解答
                </Link>
            </div>

            {/* 统计信息 */}
            <div className="stats-bar">
                <span className="stat-badge">{problem.numberOfAccepted || 0} 通过</span>
                <span className="stat-badge">{problem.numberOfSubmissions || 0} 提交</span>
            </div>

            {/* 主要内容区域 */}
            <div className="problem-main">
                {/* 题目描述 */}
                <section className="content-section">
                    <h2>题目描述</h2>
                    {problem.description ? (
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {problem.description}
                        </ReactMarkdown>
                    ) : (
                        <p className="placeholder">暂无描述</p>
                    )}
                </section>

                {/* 输入格式 */}
                <section className="content-section">
                    <h2>输入格式</h2>
                    {problem.inputFormat ? (
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {problem.inputFormat}
                        </ReactMarkdown>
                    ) : (
                        <p className="placeholder">暂无说明</p>
                    )}
                </section>

                {/* 输出格式 */}
                <section className="content-section">
                    <h2>输出格式</h2>
                    {problem.outputFormat ? (
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {problem.outputFormat}
                        </ReactMarkdown>
                    ) : (
                        <p className="placeholder">暂无说明</p>
                    )}
                </section>

                {/* 样例 */}
                <section className="content-section">
                    <h2>样例</h2>
                    {(() => {
                        const inputs = (problem.sampleInput || '').split('---').map(s => s.trim()).filter(s => s !== '');
                        const outputs = (problem.sampleOutput || '').split('---').map(s => s.trim()).filter(s => s !== '');
                        const count = Math.max(inputs.length, outputs.length);

                        if (count === 0) return <p className="placeholder">暂无样例</p>;

                        return Array.from({ length: count }).map((_, i) => (
                            <div key={i} className="samples-wrapper">
                                <div className="sample-title">样例 {i + 1}</div>
                                <div className="sample-grid">
                                    <div className="sample-group">
                                        <div className="sample-header">
                                            <h3>输入</h3>
                                            <button
                                                className="copy-btn"
                                                onClick={() => handleCopy(inputs[i] || '', `in-${i}`)}
                                            >
                                                {copyStatus[`in-${i}`] ? '已复制!' : '复制'}
                                            </button>
                                        </div>
                                        <pre className="sample-box">{inputs[i] || ''}</pre>
                                    </div>
                                    <div className="sample-group">
                                        <div className="sample-header">
                                            <h3>输出</h3>
                                            <button
                                                className="copy-btn"
                                                onClick={() => handleCopy(outputs[i] || '', `out-${i}`)}
                                            >
                                                {copyStatus[`out-${i}`] ? '已复制!' : '复制'}
                                            </button>
                                        </div>
                                        <pre className="sample-box">{outputs[i] || ''}</pre>
                                    </div>
                                </div>
                            </div>
                        ));
                    })()}
                </section>

                {/* 样例说明 */}
                {problem.sampleExplanation && (
                    <section className="content-section">
                        <h2>样例说明</h2>
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {problem.sampleExplanation}
                        </ReactMarkdown>
                    </section>
                )}

                {/* 讨论区 */}
                <section className="content-section discussion-section">
                    <h2>讨论区</h2>
                    <div className="discussion-input">
                        {replyTo && (
                            <div className="reply-indicator">
                                <span>回复 @{replyTo.nickname || replyTo.username}</span>
                                <button onClick={() => setReplyTo(null)}>取消</button>
                            </div>
                        )}
                        <textarea
                            placeholder={replyTo ? "写下你的回复..." : "发表你的看法..."}
                            value={newDiscussion}
                            onChange={(e) => setNewDiscussion(e.target.value)}
                        />
                        <button
                            onClick={handleAddDiscussion}
                            disabled={submittingDiscussion}
                        >
                            {submittingDiscussion ? '发布中...' : (replyTo ? '回复' : '发布评论')}
                        </button>
                    </div>

                    <div className="discussion-list">
                        {discussions.length === 0 ? (
                            <p className="placeholder">暂无讨论，快来抢沙发吧！</p>
                        ) : (
                            discussions.map((d) => (
                                <DiscussionItem
                                    key={d.id}
                                    d={d}
                                    onReply={setReplyTo}
                                    onVote={() => fetchDiscussions()}
                                    rootId={d.id}
                                    currentUser={currentUser}
                                />
                            ))
                        )}
                    </div>
                </section>
            </div>

            <style>{`
                .vote-buttons {
                    display: flex;
                    gap: 8px;
                    margin-left: 10px;
                }

                .vote-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    color: #64748b;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .vote-btn:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }

                .vote-btn.active.like {
                    background: #f0fdf4;
                    border-color: #22c55e;
                    color: #16a34a;
                }

                .vote-btn.active.dislike {
                    background: #fef2f2;
                    border-color: #ef4444;
                    color: #dc2626;
                }

                .reply-indicator {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8fafc;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    color: #64748b;
                    border-left: 4px solid #667eea;
                }

                .reply-indicator button {
                    background: none !important;
                    color: #ef4444 !important;
                    padding: 0 !important;
                    font-size: 12px !important;
                }

                .discussion-replies {
                    margin-left: 55px;
                    border-left: 2px solid #f1f5f9;
                    padding-left: 15px;
                }

                .discussion-actions {
                    display: flex;
                    gap: 15px;
                    margin-top: 10px;
                }

                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: none;
                    border: none;
                    color: #94a3b8;
                    font-size: 12px;
                    cursor: pointer;
                    padding: 0;
                    transition: color 0.2s;
                }

                .action-btn:hover {
                    color: #667eea;
                }

                .action-btn.delete:hover {
                    color: #ef4444;
                }

                .expand-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: none;
                    border: none;
                    color: #667eea;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    padding: 4px 0;
                    margin-top: 4px;
                }

                .expand-btn:hover {
                    text-decoration: underline;
                }

                .action-btn.active.like { color: #22c55e; }
                .action-btn.active.dislike { color: #ef4444; }
                .problem-wrapper {
                    background: white;
                    min-height: calc(100vh - 76px);
                    margin: 0;
                    padding: 0;
                }

                .problem-title-bar {
                    padding: 20px 20px 15px;
                }

                .problem-title-bar h1 {
                    margin: 0;
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    line-height: 1.4;
                }

                .problem-meta-bar {
                    padding: 12px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #e0e0e0;
                }

                .meta-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                    font-size: 14px;
                }

                .meta-badge {
                    background: #f0f0f0;
                    color: #666;
                    padding: 2px 8px;
                    border-radius: 3px;
                    font-weight: 500;
                }

                .meta-time {
                    background: #f7e161ff;
                    color: #333;
                }

                .meta-memory {
                    background: #cf40caff;
                    color: white;
                }

                .meta-info {
                    color: #666;
                    font-weight: 500;
                }

                .meta-label {
                    color: #999;
                    margin-left: 4px;
                }

                .meta-tag {
                    background: #f0f0f0;
                    color: #666;
                    padding: 2px 8px;
                    border-radius: 3px;
                    font-size: 13px;
                }

                .submit-btn {
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 14px;
                    padding: 8px 16px;
                    border-radius: 4px;
                    transition: all 0.2s;
                    display: inline-block;
                }

                .submit-btn:hover {
                    background: #764ba2;
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
                }

                .stats-bar {
                    padding: 12px 20px;
                    display: flex;
                    gap: 20px;
                    border-bottom: 1px solid #e0e0e0;
                    font-size: 14px;
                }

                .stat-badge {
                    color: #666;
                    font-weight: 500;
                }

                .difficulty-easy {
                    background: #e6fffa;
                    color: #38b2ac;
                }

                .difficulty-medium {
                    background: #fffaf0;
                    color: #ed8936;
                }

                .difficulty-hard {
                    background: #fff5f5;
                    color: #f56565;
                }

                .toggle-tags-btn {
                    background: #f0f0f0;
                    border: none;
                    color: #666;
                    padding: 2px 8px;
                    border-radius: 3px;
                    font-size: 13px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background 0.2s;
                }

                .toggle-tags-btn:hover {
                    background: #e0e0e0;
                }

                .problem-main {
                    padding: 20px;
                }

                .content-section {
                    margin-bottom: 30px;
                }

                .content-section:last-of-type {
                    margin-bottom: 0;
                }

                .content-section h2 {
                    margin: 0 0 15px 0;
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #1a1a1a;
                }

                .placeholder {
                    color: #999;
                    margin: 0;
                    font-style: italic;
                }

                .samples-wrapper {
                    margin-bottom: 20px;
                }

                .sample-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .sample-title {
                    font-size: 1.1rem;
                    font-weight: bold;
                    margin-bottom: 12px;
                    color: #2d3748;
                }

                .sample-group {
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                .sample-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .sample-group h3 {
                    margin: 0;
                    font-size: 13px;
                    font-weight: 600;
                    color: #718096;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .copy-btn {
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    font-size: 11px;
                    cursor: pointer;
                    padding: 2px 8px;
                    border-radius: 4px;
                    transition: all 0.2s;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .copy-btn:active {
                    transform: translateY(1px);
                    background: #cbd5e1;
                }

                .sample-box {
                    margin: 0;
                    padding: 12px;
                    background: #f5f5f5;
                    border: 1px solid #e0e0e0;
                    border-radius: 3px;
                    font-size: 13px;
                    line-height: 1.6;
                    color: #333;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    overflow-x: auto;
                }

                /* 移除底部按钮相关样式 */

                /* Markdown 内容样式 */
                .content-section p {
                    margin: 15px 0;
                    line-height: 1.8;
                    color: #444;
                    font-size: 15px;
                }

                .content-section h1,
                .content-section h2,
                .content-section h3,
                .content-section h4,
                .content-section h5,
                .content-section h6 {
                    margin: 1.5em 0 0.8em 0;
                    font-weight: 700;
                    color: #1a1a1a;
                }

                .content-section h1 { font-size: 1.6em; }
                .content-section h2 { font-size: 1.4em; }
                .content-section h3 { font-size: 1.2em; }

                .content-section ul,
                .content-section ol {
                    margin: 15px 0;
                    padding-left: 2em;
                    line-height: 1.8;
                    color: #444;
                }

                .content-section li {
                    margin-bottom: 0.5em;
                }

                .content-section code {
                    background: #f5f5f5;
                    padding: 2px 5px;
                    border-radius: 3px;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    color: #d63384;
                    font-size: 0.9em;
                }

                .content-section pre {
                    background: #f5f5f5;
                    border: 1px solid #e0e0e0;
                    border-radius: 3px;
                    padding: 15px;
                    overflow-x: auto;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    font-size: 13px;
                    line-height: 1.6;
                    margin: 15px 0;
                }

                .content-section pre code {
                    background: none;
                    padding: 0;
                    color: #333;
                }

                .content-section table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                }

                .content-section table th,
                .content-section table td {
                    border: 1px solid #e0e0e0;
                    padding: 10px;
                    text-align: left;
                }

                .content-section table th {
                    background: #f5f5f5;
                    font-weight: 600;
                }

                .content-section blockquote {
                    border-left: 3px solid #667eea;
                    padding-left: 15px;
                    margin: 15px 0;
                    color: #666;
                    font-style: italic;
                }

                .content-section a {
                    color: #667eea;
                    text-decoration: none;
                }

                .content-section a:hover {
                    text-decoration: underline;
                }

                /* 讨论区样式 */
                .discussion-section {
                    border-top: 1px solid #eee;
                    padding-top: 30px;
                }

                .discussion-input {
                    margin-bottom: 30px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .discussion-input textarea {
                    width: 100%;
                    min-height: 100px;
                    padding: 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-family: inherit;
                    resize: vertical;
                    transition: border-color 0.2s;
                }

                .discussion-input textarea:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .discussion-input button {
                    align-self: flex-end;
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .discussion-input button:hover {
                    background: #764ba2;
                }

                .discussion-input button:disabled {
                    background: #cbd5e1;
                    cursor: not-allowed;
                }

                .discussion-item {
                    display: flex;
                    gap: 15px;
                    padding: 20px 0;
                    border-bottom: 1px solid #f1f5f9;
                }

                .discussion-item:last-child {
                    border-bottom: none;
                }

                .discussion-avatar img, .discussion-avatar .default-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .discussion-avatar .default-avatar {
                    background: #edf2f7;
                    color: #718096;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 16px;
                }

                .discussion-body {
                    flex: 1;
                }

                .discussion-meta {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                }

                .discussion-author {
                    font-weight: 600;
                    color: #2d3748;
                    font-size: 14px;
                }

                .discussion-time {
                    color: #a0aec0;
                    font-size: 12px;
                }

                .discussion-content {
                    color: #4a5568;
                    font-size: 15px;
                    line-height: 1.6;
                    white-space: pre-wrap;
                }

                @media (max-width: 768px) {
                    .problem-title-bar,
                    .problem-meta-bar,
                    .stats-bar,
                    .problem-main {
                        padding-left: 15px;
                        padding-right: 15px;
                    }

                    .problem-title-bar h1 {
                        font-size: 1.6rem;
                    }

                    .problem-meta-bar {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }

                    .submit-btn {
                        align-self: flex-end;
                    }

                    .sample-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    )
}

function DiscussionItem({ d, onReply, onVote, isReply = false, rootId, currentUser }: { d: any, onReply: any, onVote: any, isReply?: boolean, rootId?: number, currentUser: any }) {
    const [voteStatus, setVoteStatus] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const CONTENT_LIMIT = 300;
    const isLongContent = d.content.length > CONTENT_LIMIT;

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

    const handleDelete = async () => {
        if (!window.confirm('确定要删除这条讨论吗？')) return;
        try {
            const res = await api.delete(`/api/discussion/${d.id}`);
            if (res.data.success) {
                onVote(); // 刷新列表
            } else {
                alert(res.data.message || '删除失败');
            }
        } catch (e) {
            alert('删除失败');
        }
    };

    return (
        <div className={`discussion-item-container ${isReply ? 'is-reply' : ''}`}>
            <div className="discussion-item">
                <Link to={`/user/${d.userId}`} className="discussion-avatar">
                    {d.avatar ? (
                        <img src={d.avatar} alt="" />
                    ) : (
                        <div className="default-avatar">
                            {(d.nickname || d.username || '?').charAt(0).toUpperCase()}
                        </div>
                    )}
                </Link>
                <div className="discussion-body">
                    <div className="discussion-meta">
                        <Link to={`/user/${d.userId}`} className="discussion-author">
                            {d.nickname || d.username}
                        </Link>
                        <span className="discussion-time">
                            {new Date(d.createdAt).toLocaleString()}
                        </span>
                    </div>
                    <div className="discussion-content">
                        {d.replyToUsername && d.parentId !== rootId && (
                            <span style={{ color: '#667eea', marginRight: '8px', fontWeight: '500' }}>
                                回复 <Link to={`/user/${d.replyToUserId}`} style={{ color: '#667eea', textDecoration: 'none' }}>@{d.replyToUsername}</Link> :
                            </span>
                        )}
                        <div className={`content-wrapper ${isLongContent && !isExpanded ? 'collapsed' : ''}`}>
                            <MarkdownContent content={isLongContent && !isExpanded ? d.content.slice(0, CONTENT_LIMIT) + '...' : d.content} />
                        </div>
                        {isLongContent && (
                            <button
                                className="expand-btn"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? (
                                    <><ChevronUp size={14} /> 收起</>
                                ) : (
                                    <><ChevronDown size={14} /> 展开全文</>
                                )}
                            </button>
                        )}
                    </div>
                    <div className="discussion-actions">
                        <button
                            className={`action-btn like ${voteStatus === 1 ? 'active' : ''}`}
                            onClick={() => handleVote(1)}
                        >
                            <ThumbsUp size={14} />
                            <span>{d.likes || 0}</span>
                        </button>
                        <button
                            className={`action-btn dislike ${voteStatus === -1 ? 'active' : ''}`}
                            onClick={() => handleVote(-1)}
                        >
                            <ThumbsDown size={14} />
                            <span>{d.dislikes || 0}</span>
                        </button>
                        <button className="action-btn" onClick={() => onReply(d)}>
                            <MessageSquare size={14} />
                            <span>回复</span>
                        </button>
                        {(currentUser && (currentUser.id === d.userId || currentUser.role === 'ADMIN')) && (
                            <button className="action-btn delete" onClick={handleDelete}>
                                <Trash2 size={14} />
                                <span>删除</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {d.replies && d.replies.length > 0 && (
                <div className="discussion-replies">
                    {d.replies.map((reply: any) => (
                        <DiscussionItem
                            key={reply.id}
                            d={reply}
                            onReply={onReply}
                            onVote={onVote}
                            isReply={true}
                            rootId={d.id}
                            currentUser={currentUser}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
