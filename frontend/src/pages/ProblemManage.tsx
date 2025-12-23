import React, { useEffect, useState } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'

export default function ProblemManage() {
    const [problems, setProblems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({
        title: '',
        description: '',
        inputFormat: '',
        outputFormat: '',
        sampleInput: '',
        sampleOutput: '',
        difficulty: 'easy',
        timeLimit: 1.0,
        memoryLimit: 262144
    })

    // 格式化内存大小显示（超过1MB用MB单位）
    const formatMemory = (kb: number) => {
        if (kb >= 1024) {
            return `${(kb / 1024).toFixed(1)}MB`
        }
        return `${kb}KB`
    }

    useEffect(() => {
        loadProblems()
    }, [])

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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post('/api/problem', form)
            setForm({
                title: '', description: '', inputFormat: '', outputFormat: '',
                sampleInput: '', sampleOutput: '', difficulty: 'easy',
                timeLimit: 1.0, memoryLimit: 262144
            })
            setShowForm(false)
            loadProblems()
        } catch (e: any) {
            setError(e.response?.data?.error || 'Failed to create')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Delete?')) return
        try {
            await api.delete(`/api/problem/${id}`)
            loadProblems()
        } catch (e: any) {
            setError(e.response?.data?.error || 'Failed to delete')
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <h2>Manage Problems (Admin)</h2>
            {error && <div className="error">{error}</div>}
            <button onClick={() => setShowForm(!showForm)}>Create Problem</button>

            {showForm && (
                <form onSubmit={handleCreate} className="form">
                    <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    <input placeholder="Input Format" value={form.inputFormat} onChange={e => setForm({ ...form, inputFormat: e.target.value })} />
                    <input placeholder="Output Format" value={form.outputFormat} onChange={e => setForm({ ...form, outputFormat: e.target.value })} />
                    <textarea placeholder="Sample Input" value={form.sampleInput} onChange={e => setForm({ ...form, sampleInput: e.target.value })} />
                    <textarea placeholder="Sample Output" value={form.sampleOutput} onChange={e => setForm({ ...form, sampleOutput: e.target.value })} />
                    <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                    <input type="number" placeholder="Time Limit (s)" value={form.timeLimit} onChange={e => setForm({ ...form, timeLimit: Number(e.target.value) })} />
                    <input type="number" placeholder="Memory Limit (KB)" value={form.memoryLimit} onChange={e => setForm({ ...form, memoryLimit: Number(e.target.value) })} />
                    <button type="submit">Create</button>
                </form>
            )}

            <table>
                <thead>
                    <tr><th>ID</th><th>Title</th><th>Difficulty</th><th>Subs</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {problems.map(p => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td><Link to={`/problems/${p.id}`}>{p.title}</Link></td>
                            <td>{p.difficulty}</td>
                            <td>{p.numberOfSubmissions}</td>
                            <td><button onClick={() => handleDelete(p.id)}>Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
