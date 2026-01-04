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
    const [isUploadingZip, setIsUploadingZip] = useState(false)
    const [showAddTcForm, setShowAddTcForm] = useState(false)
    const [newTcForm, setNewTcForm] = useState({ inputContent: '', outputContent: '' })

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
                try {
                    await api.post(`/api/problem/${problemId}/testcases`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    })
                } catch (e: any) {
                    if (e.response?.status === 413) {
                        alert('测试用例文件太大 (最大 10MB)')
                    } else {
                        alert('测试用例上传失败: ' + (e.response?.data?.message || '未知错误'))
                    }
                }
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

    const startEditingTestCase = async (tc: any) => {
        setEditingTestCase(tc.id);
        // 先用预览内容填充，防止界面闪烁
        setTcEditForm({ inputContent: tc.inputContent, outputContent: tc.outputContent });

        try {
            // 获取完整内容
            const res = await api.get(`/api/problem/${editingId}/testcases/${tc.id}`);
            if (res.data.success) {
                setTcEditForm({
                    inputContent: res.data.data.inputContent,
                    outputContent: res.data.data.outputContent
                });
            }
        } catch (e) {
            console.error('Failed to load test case detail', e);
        }
    };

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

    const handleZipUpload = async (file: File) => {
        if (!editingId) {
            setTestCaseFile(file)
            return
        }

        setIsUploadingZip(true)
        const formData = new FormData()
        formData.append('file', file)
        try {
            await api.post(`/api/problem/${editingId}/testcases`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            loadTestCases(editingId)
            alert('测试用例上传并解析成功')
        } catch (e: any) {
            if (e.response?.status === 413) {
                alert('测试用例文件太大 (最大 10MB)')
            } else {
                alert('测试用例上传失败: ' + (e.response?.data?.message || '未知错误'))
            }
        } finally {
            setIsUploadingZip(false)
        }
    }

    const handleAddTestCase = async () => {
        if (!editingId) {
            alert('请先保存题目基本信息')
            return
        }
        try {
            await api.post(`/api/problem/${editingId}/testcases/add`, newTcForm)
            setShowAddTcForm(false)
            setNewTcForm({ inputContent: '', outputContent: '' })
            loadTestCases(editingId)
            alert('测试点添加成功')
        } catch (e: any) {
            alert(e.response?.data?.error || '添加失败')
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

            {error && <div className="error" style={{ marginBottom: '20px' }}>{error}</div>}

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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <label style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        测试用例管理 ({testCases.length})
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddTcForm(!showAddTcForm)}
                                        style={{
                                            padding: '5px 15px',
                                            background: '#667eea',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '13px'
                                        }}
                                    >
                                        {showAddTcForm ? '取消添加' : '+ 手动添加测试点'}
                                    </button>
                                </div>

                                {showAddTcForm && (
                                    <div style={{
                                        background: '#f8fafc',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        marginBottom: '20px'
                                    }}>
                                        <h4 style={{ margin: '0 0 15px 0' }}>添加新测试点</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div>
                                                <label style={{ fontSize: '12px', color: '#666' }}>输入内容</label>
                                                <textarea
                                                    rows={6}
                                                    style={{ width: '100%', fontFamily: 'monospace', fontSize: '13px' }}
                                                    value={newTcForm.inputContent}
                                                    onChange={e => setNewTcForm({ ...newTcForm, inputContent: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '12px', color: '#666' }}>输出内容</label>
                                                <textarea
                                                    rows={6}
                                                    style={{ width: '100%', fontFamily: 'monospace', fontSize: '13px' }}
                                                    value={newTcForm.outputContent}
                                                    onChange={e => setNewTcForm({ ...newTcForm, outputContent: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '15px', textAlign: 'right' }}>
                                            <button
                                                type="button"
                                                onClick={handleAddTestCase}
                                                style={{ padding: '8px 20px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                确认添加
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="testcases-list" style={{
                                    maxHeight: '500px',
                                    overflowY: 'auto',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    background: '#fff'
                                }}>
                                    {testCases.length > 0 ? (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                            <thead style={{ position: 'sticky', top: 0, background: '#f8f9fa', zIndex: 1 }}>
                                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                                    <th style={{ padding: '12px' }}>测试点信息</th>
                                                    <th style={{ padding: '12px' }}>内容编辑</th>
                                                    <th style={{ padding: '12px', width: '100px' }}>操作</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {testCases.map((tc, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                        <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                                            <div style={{ fontWeight: 'bold', color: '#2d3748' }}>#{i + 1}</div>
                                                            <div style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>
                                                                In: {tc.inputPath.split('/').pop()}<br />
                                                                Out: {tc.outputPath.split('/').pop()}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '12px' }}>
                                                            {editingTestCase === tc.id ? (
                                                                <div style={{ display: 'flex', gap: '15px' }}>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>输入 (Input)</div>
                                                                        <textarea
                                                                            style={{ width: '100%', height: '200px', fontSize: '13px', fontFamily: 'monospace', padding: '8px', border: '1px solid #cbd5e0', borderRadius: '4px' }}
                                                                            value={tcEditForm.inputContent}
                                                                            onChange={e => setTcEditForm({ ...tcEditForm, inputContent: e.target.value })}
                                                                        />
                                                                    </div>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>输出 (Output)</div>
                                                                        <textarea
                                                                            style={{ width: '100%', height: '200px', fontSize: '13px', fontFamily: 'monospace', padding: '8px', border: '1px solid #cbd5e0', borderRadius: '4px' }}
                                                                            value={tcEditForm.outputContent}
                                                                            onChange={e => setTcEditForm({ ...tcEditForm, outputContent: e.target.value })}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div style={{ display: 'flex', gap: '15px' }}>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>输入预览</div>
                                                                        <pre style={{
                                                                            margin: 0,
                                                                            background: '#f8f9fa',
                                                                            padding: '10px',
                                                                            borderRadius: '4px',
                                                                            maxHeight: '120px',
                                                                            overflow: 'auto',
                                                                            whiteSpace: 'pre-wrap',
                                                                            fontSize: '12px',
                                                                            border: '1px solid #edf2f7'
                                                                        }}>{tc.inputContent}</pre>
                                                                    </div>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>输出预览</div>
                                                                        <pre style={{
                                                                            margin: 0,
                                                                            background: '#f8f9fa',
                                                                            padding: '10px',
                                                                            borderRadius: '4px',
                                                                            maxHeight: '120px',
                                                                            overflow: 'auto',
                                                                            whiteSpace: 'pre-wrap',
                                                                            fontSize: '12px',
                                                                            border: '1px solid #edf2f7'
                                                                        }}>{tc.outputContent}</pre>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                                            {editingTestCase === tc.id ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                    <button type="button" onClick={() => handleUpdateTestCase(tc.id)} style={{ padding: '6px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>保存</button>
                                                                    <button type="button" onClick={() => setEditingTestCase(null)} style={{ padding: '6px', background: '#9e9e9e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>取消</button>
                                                                </div>
                                                            ) : (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                    <button type="button" onClick={() => startEditingTestCase(tc)} style={{ padding: '6px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>编辑</button>
                                                                    <button type="button" onClick={() => handleDeleteTestCase(tc.id)} style={{ padding: '6px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>删除</button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                            <p style={{ margin: 0 }}>暂无测试用例</p>
                                            <p style={{ fontSize: '12px', marginTop: '8px' }}>请上传 ZIP 包或手动添加</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="form-group" style={{ marginTop: '20px', padding: '25px', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0', textAlign: 'center' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '15px', fontSize: '1.1rem', color: '#4a5568' }}>
                                批量上传测试用例 (ZIP)
                            </label>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <input
                                    type="file"
                                    accept=".zip"
                                    id="zip-upload"
                                    style={{ display: 'none' }}
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) handleZipUpload(file);
                                    }}
                                    disabled={isUploadingZip}
                                />
                                <label
                                    htmlFor="zip-upload"
                                    style={{
                                        display: 'inline-block',
                                        padding: '12px 30px',
                                        background: isUploadingZip ? '#cbd5e0' : '#667eea',
                                        color: 'white',
                                        borderRadius: '8px',
                                        cursor: isUploadingZip ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isUploadingZip ? '正在上传解析...' : '选择 ZIP 文件并上传'}
                                </label>
                            </div>
                            <p style={{ fontSize: '13px', color: '#718096', marginTop: '15px', lineHeight: '1.6' }}>
                                请上传包含 .in 和 .out 文件的 ZIP 压缩包。文件名需对应（如 1.in, 1.out）。<br />
                                <strong>注意：上传 ZIP 会覆盖当前题目的所有测试用例。</strong>
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
