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
    const [tags, setTags] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showTags, setShowTags] = useState(true)

    // 格式化内存大小显示（超过1MB用MB单位）
    const formatMemory = (kb: number) => {
        if (kb >= 1024) {
            return `${(kb / 1024).toFixed(1)}MB`
        }
        return `${kb}KB`
    }

    useEffect(() => {
        if (!id) return
        Promise.all([
            api.get(`/api/problem/${id}`),
            api.get(`/api/problem/${id}/tags`)
        ])
            .then(([problemRes, tagsRes]) => {
                setProblem(problemRes.data)
                setTags(tagsRes.data.data || [])
            })
            .catch(e => setError(e.response?.data?.error || '加载失败'))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <div className="container loading">加载中...</div>
    if (error) return <div className="container error">{error}</div>
    if (!problem) return <div className="container">题目不存在</div>

    const passRate = problem.numberOfSubmissions > 0
        ? ((problem.numberOfAccepted / problem.numberOfSubmissions) * 100).toFixed(1)
        : 0

    return (
        <div className="problem-detail-container">
            <div className="problem-main">
                <div className="problem-header">
                    <div className="problem-title-section">
                        <h1>{problem.title}</h1>
                        <span className={`difficulty-${problem.difficulty.toLowerCase()}`}>
                            {problem.difficulty === 'EASY' && '简单'}
                            {problem.difficulty === 'MEDIUM' && '中等'}
                            {problem.difficulty === 'HARD' && '困难'}
                        </span>
                    </div>
                    <Link to={`/submit/${problem.id}`} className="submit-solution-btn">
                        🚀 提交解答
                    </Link>
                </div>

                <div className="problem-stats">
                    <div className="stat-item">
                        <span className="stat-label">提交数</span>
                        <span className="stat-value">{problem.numberOfSubmissions || 0}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">通过数</span>
                        <span className="stat-value">{problem.numberOfAccepted || 0}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">通过率</span>
                        <span className="stat-value">{passRate}%</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">时间限制</span>
                        <span className="stat-value">{problem.timeLimit}s</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">内存限制</span>
                        <span className="stat-value">{formatMemory(problem.memoryLimit)}</span>
                    </div>
                </div>

                <div className="section">
                    <h2>题目描述</h2>
                    <div className="content">
                        {problem.description ? (
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {problem.description}
                            </ReactMarkdown>
                        ) : (
                            <p className="placeholder">暂无描述</p>
                        )}
                    </div>
                </div>

                <div className="section">
                    <h2>输入格式</h2>
                    <div className="content">
                        {problem.inputFormat ? (
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {problem.inputFormat}
                            </ReactMarkdown>
                        ) : (
                            <p className="placeholder">暂无说明</p>
                        )}
                    </div>
                </div>

                <div className="section">
                    <h2>输出格式</h2>
                    <div className="content">
                        {problem.outputFormat ? (
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {problem.outputFormat}
                            </ReactMarkdown>
                        ) : (
                            <p className="placeholder">暂无说明</p>
                        )}
                    </div>
                </div>

                <div className="section">
                    <h2>样例</h2>
                    <div className="samples">
                        <div className="sample">
                            <h3>输入样例</h3>
                            <pre>{problem.sampleInput || '暂无'}</pre>
                        </div>
                        <div className="sample">
                            <h3>输出样例</h3>
                            <pre>{problem.sampleOutput || '暂无'}</pre>
                        </div>
                    </div>
                </div>
            </div>

            {tags.length > 0 && (
                <div className="problem-sidebar">
                    <div className="tag-section">
                        <div className="tag-header">
                            <h3>🏷️ 标签</h3>
                            <button
                                className="toggle-btn"
                                onClick={() => setShowTags(!showTags)}
                                title={showTags ? '隐藏' : '显示'}
                            >
                                {showTags ? '▼' : '▶'}
                            </button>
                        </div>
                        {showTags && (
                            <div className="tags">
                                {tags.map(tag => (
                                    <span key={tag.id} className="tag-badge" style={{
                                        backgroundColor: tag.color || '#667eea'
                                    }}>
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .problem-detail-container {
                    display: grid;
                    grid-template-columns: 1fr 200px;
                    gap: 20px;
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                    background: #fafbfc;
                    min-height: calc(100vh - 76px);
                }

                .problem-main {
                    background: white;
                    padding: 20px;
                    border-radius: 6px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }

                .problem-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 20px;
                    padding: 20px 0;
                    background: transparent;
                    color: inherit;
                }

                .problem-title-section {
                    flex: 1;
                }

                .problem-title-section h1 {
                    margin: 0 0 10px 0;
                    font-size: 1.5rem;
                    color: var(--text-primary);
                }

                .difficulty-easy { 
                    background: rgba(76, 175, 80, 0.3);
                    color: #a5d6a7;
                    padding: 6px 15px;
                    border-radius: 20px;
                    font-size: 0.9em;
                    font-weight: 600;
                    display: inline-block;
                }

                .difficulty-medium { 
                    background: rgba(255, 152, 0, 0.3);
                    color: #ffb74d;
                    padding: 6px 15px;
                    border-radius: 20px;
                    font-size: 0.9em;
                    font-weight: 600;
                    display: inline-block;
                }

                .difficulty-hard { 
                    background: rgba(244, 67, 54, 0.3);
                    color: #ef9a9a;
                    padding: 6px 15px;
                    border-radius: 20px;
                    font-size: 0.9em;
                    font-weight: 600;
                    display: inline-block;
                }

                .submit-solution-btn {
                    padding: 10px 20px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.2s;
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
                    white-space: nowrap;
                }

                .submit-solution-btn:hover {
                    background: #764ba2;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }

                .problem-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
                    gap: 15px;
                    padding: 15px 0;
                    background: transparent;
                }

                .stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    text-align: left;
                }

                .stat-label {
                    color: #999;
                    font-size: 12px;
                    margin-bottom: 5px;
                    font-weight: 500;
                }

                .stat-value {
                    font-size: 1.3rem;
                    font-weight: bold;
                    color: #667eea;
                }

                .section {
                    padding: 20px 0;
                }

                .section:last-child {
                    border-bottom: none;
                }

                .section h2 {
                    margin: 0 0 15px 0;
                    color: #333;
                    font-size: 1.2rem;
                    font-weight: 700;
                    padding-bottom: 0;
                }

                .content {
                    color: #555;
                    line-height: 1.7;
                    font-size: 14px;
                }

                .placeholder {
                    color: #999;
                    font-style: italic;
                }

                .samples {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-top: 15px;
                }

                .sample {
                    background: #f9f9f9;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    overflow: hidden;
                }

                .sample h3 {
                    background: #f0f0f0;
                    margin: 0;
                    padding: 10px 12px;
                    color: #333;
                    font-size: 13px;
                    font-weight: 600;
                }

                .sample pre {
                    margin: 0;
                    padding: 12px;
                    overflow-x: auto;
                    background: white;
                    font-size: 12px;
                    line-height: 1.5;
                }
                    color: #333;
                    font-family: 'Courier New', monospace;
                }

                .problem-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .tag-section {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                }

                .tag-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    background: transparent;
                }

                .tag-header h3 {
                    margin: 0;
                    color: #333;
                }

                .toggle-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1.2em;
                    color: #667eea;
                    padding: 4px 8px;
                }

                .tags {
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .tag-badge {
                    display: inline-block;
                    padding: 8px 12px;
                    color: white;
                    border-radius: 6px;
                    font-size: 0.9em;
                    font-weight: 500;
                    text-align: center;
                }

                .loading {
                    text-align: center;
                    padding: 40px;
                    color: #999;
                }

                .content h1, .content h2, .content h3, .content h4, .content h5, .content h6 {
                    color: #333;
                    margin-top: 20px;
                    margin-bottom: 10px;
                }

                .content h1 { font-size: 1.8em; }
                .content h2 { font-size: 1.5em; }
                .content h3 { font-size: 1.3em; }
                .content h4 { font-size: 1.1em; }
                .content h5 { font-size: 1em; }
                .content h6 { font-size: 0.95em; }

                .content ul, .content ol {
                    margin: 15px 0;
                    padding-left: 30px;
                    line-height: 1.8;
                }

                .content li {
                    margin-bottom: 8px;
                    color: #555;
                }

                .content code {
                    background: #f5f5f5;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-family: 'Courier New', monospace;
                    color: #d63384;
                    font-size: 0.9em;
                }

                .content pre {
                    background: #2d2d2d;
                    color: #f8f8f2;
                    padding: 15px;
                    border-radius: 8px;
                    overflow-x: auto;
                    font-family: 'Courier New', monospace;
                    line-height: 1.5;
                    margin: 15px 0;
                }

                .content pre code {
                    background: none;
                    color: #f8f8f2;
                    padding: 0;
                    font-size: 0.95em;
                }

                .content blockquote {
                    border-left: 4px solid #667eea;
                    padding-left: 15px;
                    margin-left: 0;
                    margin-top: 15px;
                    margin-bottom: 15px;
                    color: #666;
                    font-style: italic;
                }

                .content table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 15px 0;
                }

                .content table th,
                .content table td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: left;
                }

                .content table th {
                    background: #f5f5f5;
                    font-weight: 600;
                    color: #333;
                }

                .content a {
                    color: #667eea;
                    text-decoration: none;
                }

                .content a:hover {
                    text-decoration: underline;
                }

                .content p {
                    line-height: 1.8;
                    color: #555;
                    margin: 15px 0;
                }

                @media (max-width: 1024px) {
                    .problem-detail-container {
                        grid-template-columns: 1fr;
                    }

                    .problem-stats {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .problem-header {
                        flex-direction: column;
                    }

                    .problem-title-section h1 {
                        font-size: 1.8em;
                    }

                    .submit-solution-btn {
                        width: 100%;
                        text-align: center;
                    }

                    .problem-stats {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .samples {
                        grid-template-columns: 1fr;
                    }

                    .section {
                        padding: 20px;
                    }
                }
            `}</style>
        </div>
    )
}
