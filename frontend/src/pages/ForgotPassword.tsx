import React, { useState } from 'react'
import api from '../api'
import { useNavigate, Link } from 'react-router-dom'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
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
        setMessage('')
        try {
            const res = await api.post('/api/user/send-reset-code', { email })
            if (res.data.success) {
                setMessage('验证码已发送至您的邮箱')
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
        if (!email.includes('@')) {
            setError('请输入有效的邮箱地址')
            return
        }
        if (!code.trim()) {
            setError('请输入验证码')
            return
        }
        if (!newPassword || newPassword.length < 6) {
            setError('新密码长度至少为 6 个字符')
            return
        }
        setLoading(true)
        setError('')
        setMessage('')
        try {
            const res = await api.post('/api/user/reset-password', { email, code, newPassword })
            if (res.data.success) {
                setMessage('密码重置成功，正在跳转至登录页...')
                setTimeout(() => navigate('/login'), 2000)
            } else {
                setError(res.data.message || '重置失败')
            }
        } catch (e: any) {
            setError(e.response?.data?.message || '重置失败')
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
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>找回密码</h2>
                {error && <div className="error">{error}</div>}
                {message && <div className="success-msg">{message}</div>}

                <input
                    name="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="注册邮箱"
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
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="新密码（至少6个字符）"
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
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginBottom: '15px'
                    }}
                >
                    {loading ? '正在重置...' : '重置密码'}
                </button>

                <div style={{ textAlign: 'center', fontSize: '14px' }}>
                    <Link to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>返回登录</Link>
                </div>
            </form>
        </div>
    )
}
