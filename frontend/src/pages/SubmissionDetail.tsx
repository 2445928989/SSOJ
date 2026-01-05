import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import api from '../api'
import { AlertCircle, CheckCircle2, XCircle, Clock, AlertTriangle, FileCode, Loader2, Copy, Check } from 'lucide-react'

// 专门用于展示大文本的组件，避免渲染时阻塞主线程导致页面卡死
const LargeTextViewer = React.memo(({ content, label, backgroundColor, color, borderColor }: { content: string, label: string, backgroundColor: string, color?: string, borderColor?: string }) => {
    const [displayContent, setDisplayContent] = useState<string | null>(null);
    const [isRendering, setIsRendering] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!content) {
            setDisplayContent('-');
            setIsRendering(false);
            return;
        }

        // 如果内容较小，直接显示
        if (content.length < 20000) {
            setDisplayContent(content);
            setIsRendering(false);
            return;
        }

        // 如果内容较大，先显示加载状态，延迟渲染
        setDisplayContent(null); // 先清空旧内容
        setIsRendering(true);

        // 使用 double requestAnimationFrame 确保 Loading 状态被浏览器绘制
        const timer = setTimeout(() => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setDisplayContent(content);
                    setIsRendering(false);
                });
            });
        }, 50);

        return () => clearTimeout(timer);
    }, [content]);

    const handleCopy = () => {
        if (!content) return;

        const doCopy = () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(content).then(doCopy).catch(() => fallbackCopy(content, doCopy));
        } else {
            fallbackCopy(content, doCopy);
        }
    };

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
            document.execCommand('copy');
            callback();
        } catch (err) {
            console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
            <h4 style={{ margin: '0 0 10px 0', color: color || '#333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    {content && content.length > 1024 && (
                        <span style={{ fontSize: '11px', color: '#999', fontWeight: 'normal' }}>
                            {(content.length / 1024).toFixed(1)} KB
                        </span>
                    )}
                    {content && (
                        <button
                            onClick={handleCopy}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: copied ? '#48bb78' : '#667eea',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                padding: '2px 4px',
                                borderRadius: '4px',
                                transition: 'all 0.2s'
                            }}
                            title="复制内容"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? '已复制' : '复制'}
                        </button>
                    )}
                </div>
            </h4>
            <div style={{ position: 'relative', flex: 1, minHeight: '100px' }}>
                {isRendering && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <Loader2 className="spin" size={24} color="#667eea" />
                        <span style={{ fontSize: '12px', color: '#667eea', marginTop: '8px', fontWeight: '500' }}>正在渲染大数据...</span>
                    </div>
                )}
                <pre style={{
                    backgroundColor: backgroundColor,
                    color: color || 'inherit',
                    padding: '12px',
                    borderRadius: '4px',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    maxHeight: '300px',
                    overflow: 'auto',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    margin: 0,
                    height: '100%',
                    border: borderColor ? `1px solid ${borderColor}` : '1px solid #edf2f7',
                    lineHeight: '1.5',
                    display: isRendering ? 'none' : 'block'
                }}>
                    {displayContent || (isRendering ? '' : '-')}
                </pre>
            </div>
        </div>
    );
});

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

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">正在加载提交详情...</div>
        </div>
    )

    if (error) return (
        <div className="error-container">
            <AlertCircle size={48} className="error-icon" style={{ color: 'var(--danger-color)', marginBottom: '16px' }} />
            <div className="error-msg">{error}</div>
        </div>
    )

    if (!submission) return (
        <div className="error-container">
            <AlertCircle size={48} className="error-icon" style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
            <div className="error-msg" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)', backgroundColor: '#f8f9fa' }}>提交记录不存在</div>
        </div>
    )

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
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {submission.status === 'AC' ? <><CheckCircle2 size={24} /> 通过</> :
                                submission.status === 'WA' ? <><XCircle size={24} /> 错误答案</> :
                                    submission.status === 'TLE' ? <><Clock size={24} /> 时间超限</> :
                                        submission.status === 'RE' ? <><AlertTriangle size={24} /> 运行错误</> :
                                            submission.status === 'RUNNING' ? <><Loader2 size={24} className="spin" /> 评测中</> :
                                                submission.status === 'CE' ? <><FileCode size={24} /> 编译错误</> :
                                                    submission.status}
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

                {/* 错误信息展示 (CE/RE) */}
                {submission.errorMessage && (
                    <div style={{
                        margin: '0 25px 25px 25px',
                        padding: '15px',
                        backgroundColor: '#fff3f3',
                        border: '1px solid #ffcdd2',
                        borderRadius: '4px',
                        color: '#c62828',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        fontSize: '14px'
                    }}>
                        <strong>错误详情:</strong>
                        <div style={{ marginTop: '10px' }}>{submission.errorMessage}</div>
                    </div>
                )}
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
                                        <td style={{ padding: '10px' }}>
                                            #{idx + 1} ({r.input ? r.input.split('/').pop() : '未知'})
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <span className={`status-${r.status.toLowerCase()}`}
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontWeight: 'bold',
                                                    backgroundColor: r.status === 'AC' ? '#4caf50' : r.status === 'WA' ? '#f44336' : r.status === 'TLE' ? '#ff9800' : r.status === 'RE' ? '#e91e63' : r.status === 'PENDING' ? '#bdbdbd' : '#9c27b0',
                                                    color: 'white',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                {r.status === 'AC' ? <CheckCircle2 size={14} /> :
                                                    r.status === 'WA' ? <XCircle size={14} /> :
                                                        r.status === 'TLE' ? <Clock size={14} /> :
                                                            r.status === 'RE' ? <AlertTriangle size={14} /> :
                                                                r.status === 'PENDING' ? <Loader2 size={14} className="spin" /> :
                                                                    r.status === 'RUNNING' ? <Loader2 size={14} className="spin" /> :
                                                                        null}
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
                                                        <LargeTextViewer
                                                            label="错误信息"
                                                            content={r.errorMessage}
                                                            backgroundColor="#fff0f0"
                                                            color="#c62828"
                                                            borderColor="#ffcdd2"
                                                        />
                                                    </div>
                                                )}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                                    <LargeTextViewer
                                                        label="输入"
                                                        content={r.inputContent}
                                                        backgroundColor="#f0f0f0"
                                                    />
                                                    <LargeTextViewer
                                                        label="期望输出"
                                                        content={r.expectedOutputContent}
                                                        backgroundColor="#e8f5e9"
                                                    />
                                                    <LargeTextViewer
                                                        label="实际输出"
                                                        content={r.actualOutputContent}
                                                        backgroundColor={r.status === 'AC' ? '#e8f5e9' : '#ffebee'}
                                                    />
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
