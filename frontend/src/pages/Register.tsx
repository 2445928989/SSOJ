import React, { useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function Register() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!username.trim() || username.length < 3) {
            setError('Username must be at least 3 characters')
            return
        }
        if (!email.includes('@')) {
            setError('Please enter a valid email')
            return
        }
        if (!password || password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }
        setLoading(true)
        setError('')
        try {
            await api.post('/api/user/register', { username, password, email })
            navigate('/login')
        } catch (e: any) {
            setError(e.response?.data?.error || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#fafbfc',
            padding: '20px',
            position: 'fixed',
            top: '60px',
            left: 0,
            right: 0,
            bottom: 0
        }}>
            <form onSubmit={submit} className="form" style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '8px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>注册</h2>
                {error && <div className="error" style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px' }}>{error}</div>}
                <input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="用户名（至少3个字符）"
                    style={{
                        width: '100%',
                        padding: '12px',
                        marginBottom: '15px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                    }}
                />
                <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="邮箱地址"
                    type="email"
                    style={{
                        width: '100%',
                        padding: '12px',
                        marginBottom: '15px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                    }}
                />
                <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="密码（至少6个字符）"
                    type="password"
                    style={{
                        width: '100%',
                        padding: '12px',
                        marginBottom: '20px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                    }}
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: loading ? '#ccc' : '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: loading ? 'default' : 'pointer',
                        transition: 'background-color 0.3s'
                    }}
                >
                    {loading ? '注册中...' : '注册'}
                </button>
            </form>
        </div>
    )
}
