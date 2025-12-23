import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function Home() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            api.get('/api/problem/list?page=1&size=1'),
            api.get('/api/user/list?page=1&size=1'),
            api.get('/api/submission/recent?page=1&size=5')
        ])
            .then(([probRes, userRes, subRes]) => {
                setStats({
                    totalProblems: probRes.data.total || 0,
                    totalUsers: userRes.data.total || 0,
                    recentSubmissions: subRes.data.data || []
                })
            })
            .catch(() => {
                setStats({
                    totalProblems: 0,
                    totalUsers: 0,
                    recentSubmissions: []
                })
            })
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="home">
            <section className="hero">
                <div className="hero-content">
                    <h1>SSOJ</h1>
                    <p className="subtitle">Smart Social Online Judge</p>
                    <p className="description">一个开源的在线编程练习和竞赛平台</p>
                    <div className="hero-buttons">
                        <Link to="/problems" className="btn btn-primary">浏览题目</Link>
                        <Link to="/login" className="btn btn-secondary">登录</Link>
                        <Link to="/register" className="btn btn-secondary">注册</Link>
                    </div>
                </div>
                <div className="hero-stats">
                    {!loading && stats && (
                        <>
                            <div className="stat">
                                <div className="stat-number">{stats.totalProblems}</div>
                                <div className="stat-label">道题目</div>
                            </div>
                            <div className="stat">
                                <div className="stat-number">{stats.totalUsers}</div>
                                <div className="stat-label">位用户</div>
                            </div>
                            <div className="stat">
                                <div className="stat-number">{stats.recentSubmissions.length}</div>
                                <div className="stat-label">次最近提交</div>
                            </div>
                        </>
                    )}
                </div>
            </section>

            <section className="features">
                <h2>核心功能</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📚</div>
                        <h3>丰富题库</h3>
                        <p>涵盖算法、数据结构、动态规划等多个领域，难度从入门到进阶</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>实时判题</h3>
                        <p>支持C/C++、Java、Python等多种编程语言，秒级反馈</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🏆</div>
                        <h3>排行榜</h3>
                        <p>全站用户排行榜，实时更新，激励学习</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">👥</div>
                        <h3>社区交互</h3>
                        <p>与其他编程爱好者互动，分享解题心得和经验</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>数据统计</h3>
                        <p>详细的提交记录和成功率统计，追踪学习进度</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎯</div>
                        <h3>标签分类</h3>
                        <p>按难度和算法标签分类，高效制定学习计划</p>
                    </div>
                </div>
            </section>

            {stats && stats.recentSubmissions.length > 0 && (
                <section className="recent-submissions">
                    <h2>最近提交</h2>
                    <table className="submissions-table">
                        <thead>
                            <tr>
                                <th>提交ID</th>
                                <th>题目</th>
                                <th>状态</th>
                                <th>用户</th>
                                <th>时间</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentSubmissions.slice(0, 10).map((s: any) => (
                                <tr key={s.id}>
                                    <td>#{s.id}</td>
                                    <td>{s.problemTitle || `题目 ${s.problemId}`}</td>
                                    <td><span className={`status-${s.status.toLowerCase()}`}>{s.status}</span></td>
                                    <td>{s.username || `用户 ${s.userId}`}</td>
                                    <td>{new Date(s.submittedAt).toLocaleString('zh-CN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            <section className="cta">
                <h2>准备好开始了吗？</h2>
                <p>加入SSOJ社区，提升你的编程能力</p>
                <div className="cta-buttons">
                    <Link to="/register" className="btn btn-primary">立即注册</Link>
                    <Link to="/problems" className="btn btn-secondary">浏览题目</Link>
                </div>
            </section>

            <style>{`
                .home {
                    overflow-x: hidden;
                }

                .hero {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 80px 40px;
                    text-align: center;
                    min-height: 600px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 60px;
                }

                .hero-content {
                    flex: 1;
                    min-width: 300px;
                }

                .hero h1 {
                    font-size: 3.5em;
                    margin: 0 0 10px 0;
                    font-weight: 700;
                    letter-spacing: 2px;
                }

                .hero .subtitle {
                    font-size: 1.5em;
                    margin: 10px 0;
                    opacity: 0.9;
                }

                .hero .description {
                    font-size: 1.1em;
                    margin: 20px 0 30px 0;
                    opacity: 0.8;
                }

                .hero-buttons {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .btn {
                    display: inline-block;
                    padding: 12px 30px;
                    border-radius: 5px;
                    text-decoration: none;
                    font-size: 1em;
                    font-weight: 600;
                    transition: all 0.3s;
                    cursor: pointer;
                    border: none;
                }

                .btn-primary {
                    background: white;
                    color: #667eea;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
                }

                .btn-secondary {
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 2px solid white;
                }

                .btn-secondary:hover {
                    background: rgba(255,255,255,0.3);
                    transform: translateY(-2px);
                }

                .hero-stats {
                    display: flex;
                    gap: 40px;
                    justify-content: center;
                    flex-wrap: wrap;
                    flex: 1;
                    min-width: 300px;
                }

                .stat {
                    text-align: center;
                    background: rgba(255,255,255,0.1);
                    padding: 30px;
                    border-radius: 10px;
                    backdrop-filter: blur(10px);
                    min-width: 120px;
                }

                .stat-number {
                    font-size: 2.5em;
                    font-weight: bold;
                    margin-bottom: 10px;
                }

                .stat-label {
                    font-size: 0.95em;
                    opacity: 0.9;
                }

                .features {
                    padding: 80px 40px;
                    background: #f9f9f9;
                    text-align: center;
                }

                .features h2 {
                    font-size: 2.5em;
                    margin-bottom: 50px;
                    color: #333;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 30px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .feature-card {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                    transition: all 0.3s;
                    text-align: center;
                }

                .feature-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                }

                .feature-icon {
                    font-size: 2.5em;
                    margin-bottom: 15px;
                }

                .feature-card h3 {
                    font-size: 1.3em;
                    margin: 15px 0 10px 0;
                    color: #333;
                }

                .feature-card p {
                    color: #666;
                    line-height: 1.6;
                    margin: 0;
                }

                .recent-submissions {
                    padding: 80px 40px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .recent-submissions h2 {
                    font-size: 2em;
                    margin-bottom: 30px;
                    color: #333;
                    text-align: center;
                }

                .submissions-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                }

                .submissions-table thead {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .submissions-table th {
                    padding: 15px;
                    text-align: left;
                    font-weight: 600;
                }

                .submissions-table td {
                    padding: 12px 15px;
                    border-top: 1px solid #e0e0e0;
                }

                .submissions-table tbody tr:hover {
                    background: #f9f9f9;
                }

                .status-ac { color: #4caf50; font-weight: bold; }
                .status-wa { color: #ff9800; font-weight: bold; }
                .status-tle { color: #f44336; font-weight: bold; }
                .status-mle { color: #f44336; font-weight: bold; }
                .status-re { color: #f44336; font-weight: bold; }
                .status-ce { color: #9c27b0; font-weight: bold; }
                .status-running { color: #2196f3; font-weight: bold; }

                .cta {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 80px 40px;
                    text-align: center;
                }

                .cta h2 {
                    font-size: 2.5em;
                    margin: 0 0 15px 0;
                }

                .cta p {
                    font-size: 1.2em;
                    margin: 0 0 30px 0;
                    opacity: 0.9;
                }

                .cta-buttons {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                @media (max-width: 768px) {
                    .hero {
                        padding: 40px 20px;
                        flex-direction: column;
                        gap: 40px;
                    }

                    .hero h1 {
                        font-size: 2.5em;
                    }

                    .hero .subtitle {
                        font-size: 1.2em;
                    }

                    .hero-buttons {
                        flex-direction: column;
                    }

                    .features h2, .cta h2 {
                        font-size: 2em;
                    }

                    .features-grid {
                        grid-template-columns: 1fr;
                    }

                    .hero-stats {
                        gap: 20px;
                    }

                    .stat {
                        padding: 20px;
                    }

                    .btn {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    )
}
