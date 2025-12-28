import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import api from '../api'

export default function SubmissionDetail() {
    const { id } = useParams()
    const [submission, setSubmission] = useState<any>(null)
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedTestCase, setExpandedTestCase] = useState<number | null>(null)
    const [isPolling, setIsPolling] = useState(false)
    const [newResultIndices, setNewResultIndices] = useState<Set<number>>(new Set())
    const previousLengthRef = useRef(0)

    // 获取提交详情和结果
    const fetchData = async () => {
        try {
            const [subRes, resRes] = await Promise.all([
                api.get(`/api/submission/${id}`),
                api.get(`/api/result/submission/${id}`)
            ])
            setSubmission(subRes.data)
            const newResults = resRes.data.data || []

            // 标记新出现的结果
            if (newResults.length > previousLengthRef.current) {
                const newIndices = new Set<number>()
                for (let i = previousLengthRef.current; i < newResults.length; i++) {
                    newIndices.add(i)
                }
                setNewResultIndices(newIndices)

                // 2 秒后移除高亮效果
                setTimeout(() => {
                    setNewResultIndices(new Set())
                }, 2000)
            }

            previousLengthRef.current = newResults.length
            setResults(newResults)
            setError('')

            // 如果状态既不是 PENDING 也不是 RUNNING，停止轮询
            if (subRes.data.status !== 'PENDING' && subRes.data.status !== 'RUNNING') {
                setIsPolling(false)
            }
        } catch (e: any) {
            setError(e.response?.data?.error || 'Failed to load')
        }
    }

    useEffect(() => {
        if (!id) return

        // 初始加载
        setLoading(true)
        fetchData().finally(() => setLoading(false))
        setIsPolling(true)
    }, [id])

    // 定时轮询（500ms 更新一次）
    useEffect(() => {
        if (!id || !isPolling) return

        const interval = setInterval(() => {
            fetchData()
        }, 500)

        return () => clearInterval(interval)
    }, [id, isPolling])

    if (loading) return <div className="container loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">正在加载提交详情...</div>
    </div>
    if (error) return <div className="error">{error}</div>
    if (!submission) return <div>Not found</div>

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            <h2>提交 #{submission.id}</h2>

            {/* 提交信息卡片 */}
            <div style={{
                marginBottom: '30px',
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                {/* 状态横幅 */}
                <div style={{
                    background: submission.status === 'AC' ? '#4caf50' : submission.status === 'WA' ? '#f44336' : submission.status === 'TLE' ? '#ff9800' : submission.status === 'RE' ? '#e91e63' : submission.status === 'RUNNING' ? '#2196f3' : '#9c27b0',
                    color: 'white',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ margin: 0 }}>
                            {submission.status === 'AC' ? '✓ 通过' : submission.status === 'WA' ? '✗ 错误答案' : submission.status === 'TLE' ? '⏱ 时间超限' : submission.status === 'RE' ? '⚠ 运行错误' : submission.status === 'RUNNING' ? '⚙ 评测中' : submission.status === 'CE' ? '✎ 编译错误' : submission.status}
                        </h3>
                    </div>
                    <div style={{ fontSize: '2em', fontWeight: 'bold' }}>{submission.status}</div>
                </div>

                {/* 信息网格 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '30px',
                    padding: '25px'
                }}>
                    <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#999', marginBottom: '5px' }}>用户</p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{submission.username || '未知用户'}</p>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#999', marginBottom: '5px' }}>问题</p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{submission.problemTitle || `问题 ${submission.problemId}`}</p>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#999', marginBottom: '5px' }}>语言</p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{submission.language}</p>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#999', marginBottom: '5px' }}>执行时间</p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{submission.maxTimeUsed || 0}ms</p>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#999', marginBottom: '5px' }}>内存占用</p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{submission.maxMemoryUsed || 0}KB</p>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#999', marginBottom: '5px' }}>提交时间</p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{new Date(submission.submittedAt).toLocaleString('zh-CN')}</p>
                    </div>
                </div>
            </div>

            {results.length > 0 && (
                <>
                    <h3>测试用例结果</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ccc' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>测试</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>状态</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>时间</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>内存</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>错误</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r, idx) => (
                                <React.Fragment key={r.id}>
                                    <tr style={{
                                        borderBottom: '1px solid #eee',
                                        cursor: 'pointer',
                                        backgroundColor: expandedTestCase === idx ? '#f9f9f9' : newResultIndices.has(idx) ? '#ffeb3b' : 'white',
                                        transition: 'background-color 0.3s ease',
                                        animation: newResultIndices.has(idx) ? 'pulse 0.6s ease-in-out' : 'none'
                                    }}
                                        onClick={() => setExpandedTestCase(expandedTestCase === idx ? null : idx)}>
                                        <td style={{ padding: '10px' }}>#{idx + 1}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span className={`status-${r.status.toLowerCase()}`}
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontWeight: 'bold',
                                                    backgroundColor: r.status === 'AC' ? '#4caf50' : r.status === 'WA' ? '#f44336' : r.status === 'TLE' ? '#ff9800' : r.status === 'RE' ? '#e91e63' : r.status === 'PENDING' ? '#bdbdbd' : '#9c27b0',
                                                    color: 'white'
                                                }}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px' }}>{r.timeUsed || 0}ms</td>
                                        <td style={{ padding: '10px' }}>{r.memoryUsed || 0}KB</td>
                                        <td style={{ padding: '10px' }}>{r.errorMessage || '-'}</td>
                                    </tr>
                                    {expandedTestCase === idx && (
                                        <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #ddd' }}>
                                            <td colSpan={5} style={{ padding: '15px' }}>
                                                {r.errorMessage && (
                                                    <div style={{ marginBottom: '15px' }}>
                                                        <h4 style={{ margin: '0 0 10px 0', color: '#e91e63' }}>错误信息</h4>
                                                        <pre style={{
                                                            backgroundColor: '#fff0f0',
                                                            padding: '10px',
                                                            borderRadius: '4px',
                                                            whiteSpace: 'pre-wrap',
                                                            wordWrap: 'break-word',
                                                            maxHeight: '300px',
                                                            overflow: 'auto',
                                                            fontSize: '12px',
                                                            fontFamily: 'monospace',
                                                            border: '1px solid #ffcdd2',
                                                            color: '#c62828'
                                                        }}>
                                                            {r.errorMessage}
                                                        </pre>
                                                    </div>
                                                )}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                                    <div>
                                                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>输入</h4>
                                                        <pre style={{
                                                            backgroundColor: '#f0f0f0',
                                                            padding: '10px',
                                                            borderRadius: '4px',
                                                            whiteSpace: 'pre-wrap',
                                                            wordWrap: 'break-word',
                                                            maxHeight: '200px',
                                                            overflow: 'auto',
                                                            fontSize: '12px',
                                                            fontFamily: 'monospace'
                                                        }}>
                                                            {r.inputContent || '-'}
                                                        </pre>
                                                    </div>
                                                    <div>
                                                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>期望输出</h4>
                                                        <pre style={{
                                                            backgroundColor: '#e8f5e9',
                                                            padding: '10px',
                                                            borderRadius: '4px',
                                                            whiteSpace: 'pre-wrap',
                                                            wordWrap: 'break-word',
                                                            maxHeight: '200px',
                                                            overflow: 'auto',
                                                            fontSize: '12px',
                                                            fontFamily: 'monospace'
                                                        }}>
                                                            {r.expectedOutputContent || '-'}
                                                        </pre>
                                                    </div>
                                                    <div>
                                                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>实际输出</h4>
                                                        <pre style={{
                                                            backgroundColor: r.status === 'AC' ? '#e8f5e9' : '#ffebee',
                                                            padding: '10px',
                                                            borderRadius: '4px',
                                                            whiteSpace: 'pre-wrap',
                                                            wordWrap: 'break-word',
                                                            maxHeight: '200px',
                                                            overflow: 'auto',
                                                            fontSize: '12px',
                                                            fontFamily: 'monospace'
                                                        }}>
                                                            {r.output || '-'}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            <h3>源代码</h3>
            <pre style={{
                backgroundColor: '#2d2d2d',
                padding: '15px',
                borderRadius: '8px',
                overflow: 'auto',
                maxHeight: '600px',
                color: '#f8f8f2',
                fontFamily: "'Courier New', monospace"
            }}>
                <code
                    dangerouslySetInnerHTML={{
                        __html: hljs.highlightAuto(submission.code).value
                    }}
                />
            </pre>

            <style>{`
                @keyframes pulse {
                    0% {
                        background-color: #ffeb3b;
                        transform: scale(1);
                    }
                    50% {
                        background-color: #fdd835;
                        transform: scale(1.01);
                    }
                    100% {
                        background-color: white;
                        transform: scale(1);
                    }
                }
                
                @keyframes slideIn {
                    0% {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    )
}
