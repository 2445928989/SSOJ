import React, { useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function Register() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const navigate = useNavigate()

    const sendCode = async () => {
        if (!email.includes('@')) {
            setError('请输入有效的邮箱地址')
            return
        }
        setSending(true)
        setError('')
        try {
            const res = await api.post('/api/user/send-code', { email })
            if (res.data.success) {
                setCountdown(60)
                const timer = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer)
                            return 0
                        }
                        return prev - 1
                    })
                }, 1000)
            } else {
                setError(res.data.message || '发送失败')
            }
        } catch (e: any) {
            setError(e.response?.data?.message || '发送失败')
        } finally {
            setSending(false)
        }
    }

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
        if (!usernameRegex.test(username)) {
            setError('用户名格式不正确（仅允许3-20位字母、数字或下划线）')
            return
        }
        if (!email.includes('@')) {
            setError('请输入有效的邮箱地址')
            return
        }
        if (!password || password.length < 6) {
            setError('密码长度至少为 6 个字符')
            return
        }
        if (!code.trim()) {
            setError('请输入验证码')
            return
        }
        setLoading(true)
        setError('')
        try {
            const res = await api.post('/api/user/register', { username, password, email, code })
            if (res.data.success) {
                navigate('/login')
            } else {
                setError(res.data.message || '注册失败')
            }
        } catch (e: any) {
            setError(e.response?.data?.message || '注册失败')
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
                    name="username"
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
                    name="email"
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
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <input
                        name="code"
                        autoComplete="one-time-code"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        placeholder="验证码"
                        style={{
                            flex: 1,
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                        }}
                    />
                    <button
                        type="button"
                        onClick={sendCode}
                        disabled={sending || countdown > 0}
                        style={{
                            padding: '0 15px',
                            backgroundColor: countdown > 0 ? '#ccc' : '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: (sending || countdown > 0) ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </button>
                </div>
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
