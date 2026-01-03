import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import api from './api'
import Home from './pages/Home'
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
                </div>
                <div className="nav-right">
                    {user ? (
                        <>
                            <Link to="/profile" className="username" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>{user.username}</Link>
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
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/announcements" element={<Announcements />} />
                    <Route path="/admin/problems" element={<ProblemManage />} />
                </Routes>
            </main>

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
            `}</style>
        </div>
    )
}
