import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import api from './api'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ProblemList from './pages/ProblemList'
import ProblemDetail from './pages/ProblemDetail'
import SubmitPage from './pages/Submit'
import Submissions from './pages/Submissions'
import SubmissionDetail from './pages/SubmissionDetail'
import UserProfile from './pages/UserProfile'
import OtherUserProfile from './pages/OtherUserProfile'
import ProblemManage from './pages/ProblemManage'
import Dashboard from './pages/Dashboard'
import Leaderboard from './pages/Leaderboard'
import Announcements from './pages/Announcements'
import DiscussionList from './pages/DiscussionList'
import NotificationDropdown from './components/NotificationDropdown'
import Notifications from './pages/Notifications'

export default function App() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const fetchUserProfile = () => {
        api.get('/api/user/profile')
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
    }

    useEffect(() => {
        fetchUserProfile()
    }, [])

    // 监听storage事件，当登录状态改变时更新用户信息
    useEffect(() => {
        const handleStorageChange = () => {
            fetchUserProfile()
        }
        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    // 路由改变时显示加载条并更新标题
    useEffect(() => {
        setLoading(true)
        const timer = setTimeout(() => setLoading(false), 600)

        // 根据路径设置默认标题
        const pathMap: Record<string, string> = {
            '/': '首页',
            '/login': '登录',
            '/register': '注册',
            '/forgot-password': '找回密码',
            '/problems': '题目列表',
            '/submissions': '提交记录',
            '/leaderboard': '排名',
            '/discussions': '讨论区',
            '/announcements': '公告',
            '/dashboard': '管理后台',
            '/problem-manage': '题目管理'
        }

        const title = pathMap[location.pathname]
        if (title) {
            document.title = `${title} - SSOJ`
        } else if (location.pathname.startsWith('/submission/')) {
            document.title = `提交详情 - SSOJ`
        } else if (location.pathname.startsWith('/submit/')) {
            document.title = `提交题目 - SSOJ`
        }

        return () => clearTimeout(timer)
    }, [location])

    const logout = async () => {
        await api.post('/api/user/logout')
        setUser(null)
        // 不导航，保持当前页面
    }

    return (
        <div>
            <nav className="nav">
                <div className="nav-loading-bar" style={{ width: loading ? '100%' : '100%', opacity: loading ? 1 : 0.3 }}></div>
                <div className="nav-left">
                    <Link to="/" className="logo">SSOJ</Link>
                    <Link to="/problems">题目</Link>
                    <Link to="/submissions">提交</Link>
                    <Link to="/leaderboard">排行榜</Link>
                    <Link to="/discussions">讨论</Link>
                </div>
                <div className="nav-right">
                    {user ? (
                        <>
                            <NotificationDropdown />
                            <Link to="/profile" className="nav-user-info" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                                {user.avatar ? (
                                    <img src={user.avatar} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #eee' }} />
                                ) : (
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#667eea', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="username">{user.username}</span>
                            </Link>
                            {user.role === 'ADMIN' && <Link to="/admin/problems">管理</Link>}
                            <button className="logout-btn" onClick={logout}>退出</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">登录</Link>
                            <Link to="/register">注册</Link>
                        </>
                    )}
                </div>
            </nav>
            <main className="container">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/login" element={<Login onLoginSuccess={fetchUserProfile} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/problems" element={<ProblemList />} />
                    <Route path="/problems/:id" element={<ProblemDetail />} />
                    <Route path="/submit/:id" element={<SubmitPage />} />
                    <Route path="/submissions" element={<Submissions />} />
                    <Route path="/submissions/:id" element={<SubmissionDetail />} />
                    <Route path="/user/:userId" element={<OtherUserProfile />} />
                    <Route path="/user/profile" element={<OtherUserProfile />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/discussions" element={<DiscussionList />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/announcements" element={<Announcements />} />
                    <Route path="/admin/problems" element={<ProblemManage />} />
                </Routes>
            </main>

            <footer className="footer">
                <div className="footer-content">
                    <p>© 2025-2026 SSOJ. All rights reserved.</p>
                    <a href="https://github.com/2445928989/SSOJ" target="_blank" rel="noopener noreferrer" className="github-link">
                        <svg height="20" viewBox="0 0 16 16" width="20" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                        </svg>
                        <span>Open Source on GitHub</span>
                    </a>
                </div>
            </footer>

            <style>{`
                /* Icon substitutions - replacing emojis */
                .icon-user::before { content: "👤"; }
                .icon-edit::before { content: "✏️"; }
                .icon-settings::before { content: "⚙️"; }
                .icon-bar-chart::before { content: "📊"; }
                .icon-check::before { content: "✅"; }
                .icon-people::before { content: "👥"; }
                .icon-card::before { content: "💳"; }
                .icon-fire::before { content: "🔥"; }
                .icon-target::before { content: "🎯"; }

                .nav-loading-bar {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
                    transition: opacity 0.3s ease;
                }

                .footer {
                    background: #f8f9fa;
                    border-top: 1px solid #e9ecef;
                    padding: 30px 0;
                    margin-top: 60px;
                    color: #6c757d;
                }

                .footer-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                }

                .footer-content p {
                    margin: 0;
                    font-size: 14px;
                }

                .github-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #4a5568;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    transition: color 0.2s;
                }

                .github-link:hover {
                    color: #2d3748;
                }

                .github-link svg {
                    color: #1a202c;
                }
            `}</style>
        </div>
    )
}
