import React, { useEffect, useState, useRef } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'

// 智能预览组件，避免在列表中渲染超大文本导致卡顿
const SmartPreview = React.memo(({ content, label }: { content: string, label: string }) => {
    const safeContent = content || '';
    const isLarge = safeContent.length > 1000;
    const previewText = isLarge ? safeContent.substring(0, 1000) + '...' : safeContent;

    return (
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{label}</span>
                {isLarge && <span style={{ color: '#3182ce' }}>仅显示前 1000 字符</span>}
            </div>
            <pre style={{
                margin: 0,
                background: '#f8f9fa',
                padding: '10px',
                borderRadius: '4px',
                maxHeight: '120px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                fontSize: '12px',
                border: '1px solid #edf2f7',
                color: '#4a5568'
            }}>{previewText || '-'}</pre>
        </div>
    );
});

export default function ProblemManage() {
    const [problems, setProblems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [testCaseFile, setTestCaseFile] = useState<File | null>(null)
    const [testCases, setTestCases] = useState<any[]>([])
    const [isUploadingZip, setIsUploadingZip] = useState(false)
    const [showAddTcForm, setShowAddTcForm] = useState(false)
    const [newTcForm, setNewTcForm] = useState({ inputContent: '', outputContent: '' })
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [decompressionProgress, setDecompressionProgress] = useState(0)
    const [decompressionMsg, setDecompressionMsg] = useState('')
    const [isDecompressing, setIsDecompressing] = useState(false)

    const initialForm = {
        title: '',
        description: '',
        hint: '',
        difficulty: 'EASY',
        timeLimit: 1.0,
        memoryLimit: 262144,
        categories: [] as string[]
    }
    const [form, setForm] = useState(initialForm)
    const [samples, setSamples] = useState<{ input: string, output: string }[]>([{ input: '', output: '' }])
    const [tagInput, setTagInput] = useState('')
    const [searchKeyword, setSearchKeyword] = useState('')

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

    const loadProblems = async (keyword: string = '') => {
        try {
            let res;
            if (keyword.trim()) {
                res = await api.get(`/api/problem/search?keyword=${encodeURIComponent(keyword)}&page=1&size=100`)
            } else {
                res = await api.get('/api/problem/list?page=1&size=100')
            }
            setProblems(res.data.data || [])
        } catch (e: any) {
            setError(e.response?.data?.error || 'Failed to load')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        loadProblems(searchKeyword)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // 处理标签输入
            const categories = tagInput.split(/[,，\s]+/).map(s => s.trim()).filter(s => s !== '')

            // 转换为后端需要的样例格式
            const mappedSamples = samples.map((s, index) => ({
                inputText: s.input,
                outputText: s.output,
                orderNum: index
            }))

            const finalForm = {
                ...form,
                categories,
                samples: mappedSamples
            }

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
                    const res = await api.post(`/api/problem/${problemId}/testcases`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    })
                    if (res.data.taskId) {
                        pollDecompressionStatus(res.data.taskId)
                    }
                } catch (e: any) {
                    alert('测试用例上传失败: ' + (e.response?.data?.message || '未知错误'))
                }
            }

            setForm(initialForm)
            setSamples([{ input: '', output: '' }])
            setTestCaseFile(null)
            setEditingId(null)
            setShowForm(false)
            loadProblems(searchKeyword)
            alert(editingId ? '更新成功' : '创建成功')
        } catch (e: any) {
            setError(e.response?.data?.error || '操作失败')
        }
    }

    const handleEdit = (p: any) => {
        setIsTransitioning(true)
        // 使用双重 RAF 确保 Loading 状态先渲染
        setTimeout(() => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setForm({
                        title: p.title || '',
                        description: p.description || '',
                        difficulty: p.difficulty || 'EASY',
                        timeLimit: p.timeLimit || 1.0,
                        memoryLimit: p.memoryLimit || 262144,
                        categories: p.categories || []
                    })

                    // 优先使用结构化样例数组
                    if (p.samples && p.samples.length > 0) {
                        setSamples(p.samples.map((s: any) => ({
                            input: s.inputText || '',
                            output: s.outputText || ''
                        })));
                    } else {
                        setSamples([{ input: '', output: '' }]);
                    }

                    setTagInput((p.categories || []).join(', '))
                    setEditingId(p.id)
                    setShowForm(true)
                    loadTestCases(p.id).then(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                        setIsTransitioning(false)
                    })
                })
            })
        }, 50)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('确定删除该题目吗？')) return
        try {
            await api.delete(`/api/problem/${id}`)
            loadProblems(searchKeyword)
        } catch (e: any) {
            setError(e.response?.data?.error || '删除失败')
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
            const res = await api.post(`/api/problem/${editingId}/testcases`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            if (res.data.taskId) {
                pollDecompressionStatus(res.data.taskId)
            } else {
                loadTestCases(editingId)
                alert('测试用例上传成功')
            }
        } catch (e: any) {
            alert('测试用例上传失败: ' + (e.response?.data?.message || e.response?.data?.error || '未知错误'))
        } finally {
            setIsUploadingZip(false)
        }
    }

    const pollDecompressionStatus = async (taskId: string) => {
        setIsDecompressing(true)
        setDecompressionProgress(0)
        setDecompressionMsg('正在解析文件...')

        const poll = async () => {
            try {
                const res = await api.get(`/api/problem/task/${taskId}`)
                const { status, progress, message } = res.data.data

                setDecompressionProgress(progress)
                setDecompressionMsg(message)

                if (status === 'completed') {
                    setIsDecompressing(false)
                    if (editingId) loadTestCases(editingId)
                } else if (status === 'error') {
                    setIsDecompressing(false)
                    alert('测试用例处理失败: ' + message)
                } else {
                    setTimeout(poll, 1000)
                }
            } catch (e) {
                console.error('Polling error', e)
                setIsDecompressing(false)
            }
        }

        poll()
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
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '5px' }}>
                        <input
                            type="text"
                            placeholder="搜索题目 ID 或标题..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            style={{
                                padding: '8px 15px',
                                borderRadius: '8px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '14px',
                                width: '240px',
                                outline: 'none'
                            }}
                        />
                        <button type="submit" className="submit-btn" style={{ width: 'auto', padding: '8px 15px', margin: 0 }}>
                            搜索
                        </button>
                    </form>
                    <button className="submit-btn" style={{ width: 'auto', padding: '8px 20px', margin: 0 }} onClick={() => {
                        setEditingId(null)
                        setForm(initialForm)
                        setSamples([{ input: '', output: '' }])
                        setTagInput('')
                        setTestCases([])
                        setShowForm(!showForm)
                    }}>
                        {showForm ? '取消' : '+ 创建新题目'}
                    </button>
                </div>
            </div>

            {error && <div className="error" style={{ marginBottom: '20px' }}>{error}</div>}

            {isTransitioning && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255, 255, 255, 0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div className="spin" style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid var(--primary-color)',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        marginBottom: '15px'
                    }}></div>
                    <div style={{ color: 'var(--primary-color)', fontWeight: '600' }}>正在加载题目数据...</div>
                </div>
            )}

            {showForm && (
                <div className="card" style={{ marginBottom: '40px', padding: '30px' }}>
                    <h3 style={{ marginBottom: '25px', fontSize: '1.5rem' }}>{editingId ? '编辑题目' : '创建新题目'}</h3>
                    <form onSubmit={handleSubmit} className="problem-form">
                        <div className="form-group">
                            <label>题目标题</label>
                            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="输入题目名称" />
                        </div>
                        <div className="form-group">
                            <label>题目详情 (Markdown)</label>
                            <div style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>
                                请在此输入完整题干。建议包含：题目描述、输入格式、输出格式、样例说明等。可以使用 Markdown 标题（如 #, ##）进行分块。
                            </div>
                            <textarea rows={20} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required placeholder="在此输入完整 Markdown 题干内容..." />
                        </div>

                        <div style={{ marginBottom: '25px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <label style={{ fontWeight: '600', fontSize: '1rem' }}>样例管理</label>
                                <button
                                    type="button"
                                    onClick={() => setSamples([...samples, { input: '', output: '' }])}
                                    style={{ padding: '4px 12px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                                >
                                    + 添加样例
                                </button>
                            </div>
                            {samples.map((s, i) => (
                                <div key={i} style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '6px', border: '1px solid #edf2f7', position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px' }}>样例 {i + 1}</span>
                                        {samples.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setSamples(samples.filter((_, idx) => idx !== i))}
                                                style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                                            >
                                                删除此样例
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label style={{ fontSize: '12px' }}>输入</label>
                                            <textarea
                                                rows={4}
                                                value={s.input}
                                                onChange={e => {
                                                    const newSamples = [...samples];
                                                    newSamples[i].input = e.target.value;
                                                    setSamples(newSamples);
                                                }}
                                                style={{ fontFamily: 'monospace', fontSize: '13px' }}
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label style={{ fontSize: '12px' }}>输出</label>
                                            <textarea
                                                rows={4}
                                                value={s.output}
                                                onChange={e => {
                                                    const newSamples = [...samples];
                                                    newSamples[i].output = e.target.value;
                                                    setSamples(newSamples);
                                                }}
                                                style={{ fontFamily: 'monospace', fontSize: '13px' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="form-group">
                            <label>样例解释 / 提示 (Markdown)</label>
                            <div style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>
                                此内容将显示在所有样例之后，用于解释样例或提供解题提示。
                            </div>
                            <textarea rows={5} value={form.hint} onChange={e => setForm({ ...form, hint: e.target.value })} placeholder="输入样例解释或提示内容..." />
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
                                {(isDecompressing || isUploadingZip) && (
                                    <div style={{
                                        background: '#ebf8ff',
                                        padding: '15px 20px',
                                        borderRadius: '8px',
                                        border: '1px solid #bee3f8',
                                        marginBottom: '20px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: '600', color: '#2b6cb0' }}>
                                                {isUploadingZip ? '正在上传文件...' : (decompressionMsg || '正在处理测试用例...')}
                                            </span>
                                            {!isUploadingZip && <span style={{ color: '#2b6cb0' }}>{Math.round(decompressionProgress)}%</span>}
                                        </div>
                                        {!isUploadingZip && (
                                            <div style={{
                                                width: '100%',
                                                height: '8px',
                                                background: '#bee3f8',
                                                borderRadius: '4px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${decompressionProgress}%`,
                                                    height: '100%',
                                                    background: '#3182ce',
                                                    transition: 'width 0.3s ease'
                                                }}></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <label style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        测试用例管理 ({testCases.length})
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddTcForm(!showAddTcForm)}
                                        style={{
                                            padding: '5px 15px',
                                            background: 'var(--primary-color)',
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
                                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <SmartPreview label="输入预览" content={tc.inputContent} />
                                                                    <a
                                                                        href={`${api.defaults.baseURL}/api/problem/${editingId}/testcases/${tc.id}/download/input`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        style={{ fontSize: '12px', color: '#3182ce', textDecoration: 'none', display: 'inline-block', marginTop: '4px' }}
                                                                    >
                                                                        下载完整输入
                                                                    </a>
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <SmartPreview label="输出预览" content={tc.outputContent} />
                                                                    <a
                                                                        href={`${api.defaults.baseURL}/api/problem/${editingId}/testcases/${tc.id}/download/output`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        style={{ fontSize: '12px', color: '#3182ce', textDecoration: 'none', display: 'inline-block', marginTop: '4px' }}
                                                                    >
                                                                        下载完整输出
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                <button type="button" onClick={() => handleDeleteTestCase(tc.id)} style={{ padding: '6px', background: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>删除</button>
                                                            </div>
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
                                        background: isUploadingZip ? '#cbd5e0' : 'var(--primary-color)',
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

            {!showForm && (
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
            )}

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
