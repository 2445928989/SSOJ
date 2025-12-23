import React, { useEffect, useState } from 'react'
import api from '../api'

interface UserStats {
    id: number
    username: string
    solved: number
    submissions: number
}

export default function Leaderboard() {
    const [users, setUsers] = useState<UserStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        api.get('/api/user/list')
            .then(res => {
                // Calculate stats for each user
                const userStats: UserStats[] = (res.data.data || []).map((u: any) => ({
                    id: u.id,
                    username: u.username,
                    solved: u.solved || 0,
                    submissions: u.submissions || 0
                }))
                // Sort by solved count (descending)
                userStats.sort((a, b) => (b.solved - a.solved))
                setUsers(userStats)
            })
            .catch(e => {
                setError(e.response?.data?.error || '加载排行榜失败')
            })
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="container loading">加载中...</div>
    if (error) return <div className="container error">{error}</div>

    return (
        <div className="leaderboard-container">
            <h2>排行榜</h2>
            {users.length === 0 ? (
                <div className="empty-state">暂无用户数据</div>
            ) : (
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>排名</th>
                            <th>用户名</th>
                            <th>通过</th>
                            <th>提交</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, idx) => (
                            <tr key={user.id}>
                                <td>{idx + 1}</td>
                                <td>{user.username}</td>
                                <td className="solved">{user.solved}</td>
                                <td>{user.submissions}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}
