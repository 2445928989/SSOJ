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
    const [agreed, setAgreed] = useState(false)
    const [showAgreement, setShowAgreement] = useState(false)
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
        if (!agreed) {
            setError('请先阅读并同意用户许可协议')
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
                {error && <div className="error">{error}</div>}
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '13px', color: '#666' }}>
                    <input
                        type="checkbox"
                        id="agree"
                        checked={agreed}
                        onChange={e => setAgreed(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="agree" style={{ cursor: 'pointer', userSelect: 'none' }}>
                        我已阅读并同意 <span
                            onClick={(e) => { e.preventDefault(); setShowAgreement(true); }}
                            style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            用户许可协议
                        </span>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading || !agreed}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: (loading || !agreed) ? '#ccc' : '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: (loading || !agreed) ? 'default' : 'pointer',
                        transition: 'background-color 0.3s'
                    }}
                >
                    {loading ? '注册中...' : '注册'}
                </button>
            </form>

            {showAgreement && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        position: 'relative',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}>
                        <button
                            onClick={() => setShowAgreement(false)}
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                border: 'none',
                                background: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                color: '#999'
                            }}
                        >
                            ×
                        </button>
                        <h3 style={{ marginTop: '20px', marginBottom: '20px', textAlign: 'center' }}>SSOJ - 网站使用免责声明</h3>
                        <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#444', whiteSpace: 'pre-wrap' }}>
                            {`欢迎注册并使用本网站。本网站为个人技术学习与实验项目，请在使用前仔细阅读并同意以下全部条款。

一、 网站性质声明
1.1 本网站（SSOJ）是由个人开发者创建的、用于技术交流与学习的非商业性项目。所有功能均处于测试、实验状态，无法保证其持续性、稳定性与安全性。
1.2 本网站为开源项目，源代码以MIT协议公开。网站内容及用户生成内容与任何托管服务商、开源社区无关。

二、 用户责任与行为规范
2.1 您注册成为用户，即表示您理解本网站的测试性质，并自愿承担使用过程中可能遇到的数据丢失、服务中断等风险。
2.2 您应对您的账户下进行的所有活动、以及您在本网站发布、上传、传输的任何数据、代码、文本、链接等信息（以下简称“用户内容”）负全部法律责任。
2.3 您承诺，您的用户内容及使用行为不会：
a) 违反中华人民共和国法律法规，包含任何违法、破坏性、侵权、诽谤、骚扰、欺诈、淫秽或暴力信息；
b) 侵犯任何第三方的知识产权、肖像权、隐私权、商业秘密等合法权益；
c) 包含计算机病毒、恶意代码，或进行任何可能破坏、干扰网站正常运行的网络活动；
d) 尝试进行未经授权的访问，或对本网站进行任何形式的压力测试、漏洞扫描。

三、 内容管理声明
3.1 作为个人项目运营者，我们没有能力对用户内容进行实时监控、审查或保证其真实性、准确性与合法性。所有用户内容仅代表其发布者个人观点，与本网站立场无关。
3.2 我们保留在任何时候，在不事先通知的情况下，根据自身判断对任何涉嫌违规的用户内容进行编辑、移动、屏蔽或删除的权利，并对违规用户采取警告、禁用账户等措施。

四、 责任限制
4.1 本网站按“现状”提供，不提供任何形式的明示或暗示保证。运营者不对因使用或无法使用本网站所引发的任何直接、间接、附带或后果性的损失或损害承担责任，包括但不限于数据丢失、利润损失或服务中断。
4.2 因您违反本声明或相关法律，导致任何第三方提出索赔或要求，您应自行承担全部赔偿责任，并确保本网站及其运营者免于因此遭受损害。

五、 知识产权与侵权处理
5.1 本网站原始设计、代码、Logo等知识产权归运营者所有。网站所使用的开源组件遵从其各自许可证。
5.2 如果您认为本网站上的任何内容（包括用户内容）侵犯了您的合法权益，请通过邮件 2445928989@qq.com 提交符合法律要求的书面权利通知，我们将在核实后依法处理。

六、 协议修改与终止
6.1 我们有权随时更新本声明，更新后的声明将在网站上公布后立即生效。
6.2 我们有权因任何原因，随时终止或暂停本网站的全部或部分服务，无需提前通知。

请您在点击“同意”前务必审慎阅读。一旦完成注册，即视为您已充分理解并完全接受本声明的全部内容。

最后更新日期：2026年1月3日`}
                        </div>
                        <button
                            onClick={() => { setAgreed(true); setShowAgreement(false); }}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                marginTop: '20px'
                            }}
                        >
                            我已阅读并同意
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
