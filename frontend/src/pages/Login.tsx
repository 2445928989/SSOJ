import React, { useState } from 'react'
import api from '../api'
import { useNavigate, Link } from 'react-router-dom'

export default function Login({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!username.trim()) {
            setError('Please enter username')
            return
        }
        if (!password) {
            setError('Please enter password')
            return
        }
        setLoading(true)
        setError('')
        try {
            await api.post('/api/user/login', { username, password })
            onLoginSuccess?.()
            navigate('/problems')
        } catch (e: any) {
            setError(e.response?.data?.error || 'Login failed')
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
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>登录</h2>
                {error && <div className="error" style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px' }}>{error}</div>}
                <input
                    name="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="用户名或邮箱"
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
                    placeholder="密码"
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
                    {loading ? '登录中...' : '登录'}
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontSize: '14px' }}>
                    <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none' }}>立即注册</Link>
                    <Link to="/forgot-password" style={{ color: '#1976d2', textDecoration: 'none' }}>忘记密码？</Link>
                </div>
            </form>
        </div>
    )
}
