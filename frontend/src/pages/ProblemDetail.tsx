import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import api from '../api'

export default function ProblemDetail() {
    const { id } = useParams()
    const [problem, setProblem] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showTags, setShowTags] = useState(false)
    const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({})

    // 格式化内存大小显示（超过1MB用MB单位）
    const formatMemory = (kb: number) => {
        if (kb >= 1024) {
            return `${(kb / 1024).toFixed(1)}MB`
        }
        return `${kb}KB`
    }

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopyStatus({ ...copyStatus, [key]: true })
            setTimeout(() => {
                setCopyStatus(prev => ({ ...prev, [key]: false }))
            }, 2000)
        })
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
    }, [id])

    if (loading) return <div className="container loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">正在加载题目详情...</div>
    </div>
    if (error) return <div className="container error">{error}</div>
    if (!problem) return <div className="container">题目不存在</div>

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
            </div>

            <style>{`
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

                .copy-btn:hover {
                    background: #e2e8f0;
                    color: #475569;
                    border-color: #cbd5e1;
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
