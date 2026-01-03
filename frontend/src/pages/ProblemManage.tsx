import React, { useEffect, useState } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'

export default function ProblemManage() {
    const [problems, setProblems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [testCaseFile, setTestCaseFile] = useState<File | null>(null)
    const [testCases, setTestCases] = useState<any[]>([])
    const [editingTestCase, setEditingTestCase] = useState<number | null>(null)
    const [tcEditForm, setTcEditForm] = useState({ inputContent: '', outputContent: '' })

    const initialForm = {
        title: '',
        description: '',
        inputFormat: '',
        outputFormat: '',
        sampleInput: '',
        sampleOutput: '',
        sampleExplanation: '',
        difficulty: 'EASY',
        timeLimit: 1.0,
        memoryLimit: 262144,
        categories: [] as string[]
    }
    const [form, setForm] = useState(initialForm)
    const [tagInput, setTagInput] = useState('')

    useEffect(() => {
        loadProblems()
    }, [])

    const loadTestCases = async (problemId: number) => {
        try {
            const res = await api.get(`/api/problem/${problemId}/testcases`)
            setTestCases(res.data.data || [])
        } catch (e) {
            console.error('Failed to load test cases', e)
        }
    }

    const loadProblems = async () => {
        try {
            const res = await api.get('/api/problem/list')
            setProblems(res.data.data || [])
        } catch (e: any) {
            setError(e.response?.data?.error || 'Failed to load')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // 处理标签输入
            const categories = tagInput.split(/[,，\s]+/).map(s => s.trim()).filter(s => s !== '')
            const finalForm = { ...form, categories }

            let problemId = editingId
            if (editingId) {
                await api.put(`/api/problem/${editingId}`, finalForm)
            } else {
                const res = await api.post('/api/problem', finalForm)
                problemId = res.data.data.id
            }

            // 如果选择了测试用例文件，则上传
            if (testCaseFile && problemId) {
                const formData = new FormData()
                formData.append('file', testCaseFile)
                await api.post(`/api/problem/${problemId}/testcases`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            }

            setForm(initialForm)
            setTestCaseFile(null)
            setEditingId(null)
            setShowForm(false)
            loadProblems()
            alert(editingId ? '更新成功' : '创建成功')
        } catch (e: any) {
            setError(e.response?.data?.error || '操作失败')
        }
    }

    const handleEdit = (p: any) => {
        setForm({
            title: p.title,
            description: p.description,
            inputFormat: p.inputFormat,
            outputFormat: p.outputFormat,
            sampleInput: p.sampleInput,
            sampleOutput: p.sampleOutput,
            sampleExplanation: p.sampleExplanation || '',
            difficulty: p.difficulty,
            timeLimit: p.timeLimit,
            memoryLimit: p.memoryLimit,
            categories: p.categories || []
        })
        setTagInput((p.categories || []).join(', '))
        setEditingId(p.id)
        setShowForm(true)
        loadTestCases(p.id)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('确定删除该题目吗？')) return
        try {
            await api.delete(`/api/problem/${id}`)
            loadProblems()
        } catch (e: any) {
            setError(e.response?.data?.error || '删除失败')
        }
    }

    const handleUpdateTestCase = async (tcId: number) => {
        try {
            await api.put(`/api/problem/${editingId}/testcases/${tcId}`, tcEditForm)
            setEditingTestCase(null)
            if (editingId) loadTestCases(editingId)
            alert('测试点更新成功')
        } catch (e: any) {
            alert(e.response?.data?.error || '更新失败')
        }
    }

    const handleDeleteTestCase = async (tcId: number) => {
        if (!confirm('确定删除该测试点吗？')) return
        try {
            await api.delete(`/api/problem/${editingId}/testcases/${tcId}`)
            if (editingId) loadTestCases(editingId)
        } catch (e: any) {
            alert(e.response?.data?.error || '删除失败')
        }
    }

    if (loading) return <div className="container loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">正在加载题目管理...</div>
    </div>

    return (
        <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>题目管理</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to="/" className="back-btn">返回仪表盘</Link>
                    <button className="submit-btn" style={{ width: 'auto', padding: '8px 20px', margin: 0 }} onClick={() => {
                        setEditingId(null)
                        setForm(initialForm)
                        setTagInput('')
                        setTestCases([])
                        setShowForm(!showForm)
                    }}>
                        {showForm ? '取消' : '+ 创建新题目'}
                    </button>
                </div>
            </div>

            {error && <div className="error-message" style={{ marginBottom: '20px' }}>{error}</div>}

            {showForm && (
                <div className="card" style={{ marginBottom: '40px', padding: '30px' }}>
                    <h3 style={{ marginBottom: '25px', fontSize: '1.5rem' }}>{editingId ? '编辑题目' : '创建新题目'}</h3>
                    <form onSubmit={handleSubmit} className="problem-form">
                        <div className="form-group">
                            <label>题目标题</label>
                            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="输入题目名称" />
                        </div>
                        <div className="form-group">
                            <label>题目描述 (Markdown)</label>
                            <textarea rows={8} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required placeholder="支持 Markdown 格式" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                            <div className="form-group">
                                <label>输入格式</label>
                                <textarea rows={3} value={form.inputFormat} onChange={e => setForm({ ...form, inputFormat: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>输出格式</label>
                                <textarea rows={3} value={form.outputFormat} onChange={e => setForm({ ...form, outputFormat: e.target.value })} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                            <div className="form-group">
                                <label>样例输入 (多个样例请用 --- 分隔)</label>
                                <textarea rows={4} value={form.sampleInput} onChange={e => setForm({ ...form, sampleInput: e.target.value })} style={{ fontFamily: 'monospace' }} />
                            </div>
                            <div className="form-group">
                                <label>样例输出 (多个样例请用 --- 分隔)</label>
                                <textarea rows={4} value={form.sampleOutput} onChange={e => setForm({ ...form, sampleOutput: e.target.value })} style={{ fontFamily: 'monospace' }} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>样例说明 (Markdown)</label>
                            <textarea rows={3} value={form.sampleExplanation} onChange={e => setForm({ ...form, sampleExplanation: e.target.value })} placeholder="对样例的解释说明" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div className="form-group">
                                <label>难度</label>
                                <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                                    <option value="EASY">简单 (EASY)</option>
                                    <option value="MEDIUM">中等 (MEDIUM)</option>
                                    <option value="HARD">困难 (HARD)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>时间限制 (s)</label>
                                <input type="number" step="0.1" value={form.timeLimit} onChange={e => setForm({ ...form, timeLimit: Number(e.target.value) })} />
                            </div>
                            <div className="form-group">
                                <label>内存限制 (KB)</label>
                                <input type="number" value={form.memoryLimit} onChange={e => setForm({ ...form, memoryLimit: Number(e.target.value) })} />
                            </div>
                            <div className="form-group">
                                <label>分类标签</label>
                                <input
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    placeholder="逗号分隔"
                                />
                            </div>
                        </div>

                        {editingId && (
                            <div className="form-group" style={{ marginTop: '20px' }}>
                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                                    当前测试用例预览 ({testCases.length})
                                </label>
                                <div className="testcases-list" style={{
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    background: '#fff'
                                }}>
                                    {testCases.length > 0 ? (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                            <thead style={{ position: 'sticky', top: 0, background: '#f8f9fa' }}>
                                                <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                                                    <th style={{ padding: '8px' }}>输入文件</th>
                                                    <th style={{ padding: '8px' }}>输出文件</th>
                                                    <th style={{ padding: '8px' }}>内容预览与编辑</th>
                                                    <th style={{ padding: '8px' }}>操作</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {testCases.map((tc, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                                        <td style={{ padding: '8px', color: '#4a5568', fontSize: '11px' }}>
                                                            {tc.inputPath.split('/').pop()}
                                                        </td>
                                                        <td style={{ padding: '8px', color: '#4a5568', fontSize: '11px' }}>
                                                            {tc.outputPath.split('/').pop()}
                                                        </td>
                                                        <td style={{ padding: '8px' }}>
                                                            {editingTestCase === tc.id ? (
                                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                                    <div style={{ flex: 1 }}>
                                                                        <textarea
                                                                            style={{ width: '100%', height: '100px', fontSize: '11px', fontFamily: 'monospace' }}
                                                                            value={tcEditForm.inputContent}
                                                                            onChange={e => setTcEditForm({ ...tcEditForm, inputContent: e.target.value })}
                                                                        />
                                                                    </div>
                                                                    <div style={{ flex: 1 }}>
                                                                        <textarea
                                                                            style={{ width: '100%', height: '100px', fontSize: '11px', fontFamily: 'monospace' }}
                                                                            value={tcEditForm.outputContent}
                                                                            onChange={e => setTcEditForm({ ...tcEditForm, outputContent: e.target.value })}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ fontSize: '10px', color: '#999' }}>Input:</div>
                                                                        <pre style={{
                                                                            margin: 0,
                                                                            background: '#f8f9fa',
                                                                            padding: '5px',
                                                                            borderRadius: '4px',
                                                                            maxHeight: '80px',
                                                                            overflow: 'auto',
                                                                            whiteSpace: 'pre-wrap',
                                                                            fontSize: '11px'
                                                                        }}>{tc.inputContent}</pre>
                                                                    </div>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ fontSize: '10px', color: '#999' }}>Output:</div>
                                                                        <pre style={{
                                                                            margin: 0,
                                                                            background: '#f8f9fa',
                                                                            padding: '5px',
                                                                            borderRadius: '4px',
                                                                            maxHeight: '80px',
                                                                            overflow: 'auto',
                                                                            whiteSpace: 'pre-wrap',
                                                                            fontSize: '11px'
                                                                        }}>{tc.outputContent}</pre>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '8px' }}>
                                                            {editingTestCase === tc.id ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                                    <button type="button" onClick={() => handleUpdateTestCase(tc.id)} style={{ fontSize: '10px', padding: '2px 5px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>保存</button>
                                                                    <button type="button" onClick={() => setEditingTestCase(null)} style={{ fontSize: '10px', padding: '2px 5px', background: '#9e9e9e', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>取消</button>
                                                                </div>
                                                            ) : (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                                    <button type="button" onClick={() => {
                                                                        setEditingTestCase(tc.id);
                                                                        setTcEditForm({ inputContent: tc.inputContent, outputContent: tc.outputContent });
                                                                    }} style={{ fontSize: '10px', padding: '2px 5px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>编辑</button>
                                                                    <button type="button" onClick={() => handleDeleteTestCase(tc.id)} style={{ fontSize: '10px', padding: '2px 5px', background: '#f44336', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>删除</button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p style={{ color: '#999', fontStyle: 'italic', margin: 0 }}>暂无测试用例，请上传 ZIP 包</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="form-group" style={{ marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #cbd5e0' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                                测试用例上传 (ZIP)
                            </label>
                            <input
                                type="file"
                                accept=".zip"
                                onChange={e => setTestCaseFile(e.target.files?.[0] || null)}
                            />
                            <p style={{ fontSize: '12px', color: '#718096', marginTop: '8px' }}>
                                请上传包含 .in 和 .out 文件的 ZIP 压缩包。文件名需对应（如 1.in, 1.out）。
                                {editingId && " 如果不上传，将保留原有测试用例。"}
                            </p>
                        </div>

                        <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                            <button type="submit" className="submit-btn" style={{ flex: 1 }}>
                                {editingId ? '保存修改' : '立即创建'}
                            </button>
                            <button type="button" className="submit-btn" style={{ flex: 1, background: '#edf2f7', color: '#4a5568' }} onClick={() => {
                                setShowForm(false)
                                setEditingId(null)
                                setForm(initialForm)
                                setTagInput('')
                            }}>
                                取消
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <table className="problem-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>标题</th>
                            <th>难度</th>
                            <th>时限/内存</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {problems.map(p => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>
                                    <span
                                        onClick={() => handleEdit(p)}
                                        style={{ fontWeight: 'bold', color: 'var(--primary-color)', cursor: 'pointer' }}
                                    >
                                        {p.title}
                                    </span>
                                </td>
                                <td>
                                    <span className={`difficulty-badge ${p.difficulty.toLowerCase()}`}>
                                        {p.difficulty === 'EASY' ? '简单' : p.difficulty === 'MEDIUM' ? '中等' : '困难'}
                                    </span>
                                </td>
                                <td style={{ fontSize: '13px', color: '#666' }}>
                                    {p.timeLimit}s / {Math.round(p.memoryLimit / 1024)}MB
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="edit-btn" onClick={() => handleEdit(p)}>编辑</button>
                                        <button className="delete-btn" onClick={() => handleDelete(p.id)}>删除</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                .problem-form .form-group {
                    margin-bottom: 15px;
                }
                .problem-form label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 500;
                    color: var(--text-secondary);
                }
                .problem-form input, 
                .problem-form textarea, 
                .problem-form select {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    font-size: 14px;
                }
                .problem-form textarea {
                    font-family: monospace;
                }
                .problem-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .problem-table th, .problem-table td {
                    padding: 15px;
                    text-align: left;
                    border-bottom: 1px solid var(--border-color);
                }
                .edit-btn, .delete-btn {
                    padding: 5px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    border: 1px solid transparent;
                }
                .edit-btn {
                    background: #e3f2fd;
                    color: #1976d2;
                }
                .delete-btn {
                    background: #ffebee;
                    color: #d32f2f;
                }
                .submit-btn {
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .submit-btn:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .difficulty-badge {
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .difficulty-badge.easy { background: #e6fffa; color: #319795; }
                .difficulty-badge.medium { background: #fffaf0; color: #dd6b20; }
                .difficulty-badge.hard { background: #fff5f5; color: #e53e3e; }
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
