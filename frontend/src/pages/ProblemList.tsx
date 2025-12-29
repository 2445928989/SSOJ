import React, { useEffect, useState } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'

export default function ProblemList() {
    const [problems, setProblems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchKeyword, setSearchKeyword] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [size] = useState(20)
    const [sortBy, setSortBy] = useState<'id' | 'difficulty' | 'passRate'>('id')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [solvedProblems, setSolvedProblems] = useState<Set<number>>(new Set())
    const [showTags, setShowTags] = useState(false)
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    const [tags, setTags] = useState<string[]>([])

    const loadProblems = (pageNum: number = 1, keyword: string = '', sort: string = 'id', order: string = 'asc', tag: string | null = null) => {
        setLoading(true)
        setError('')

        let promise
        if (keyword.trim()) {
            promise = api.get(`/api/problem/search?keyword=${encodeURIComponent(keyword)}&page=${pageNum}&size=${size}`)
            setIsSearching(true)
        } else if (tag) {
            promise = api.get(`/api/problem/list?tag=${encodeURIComponent(tag)}&page=${pageNum}&size=${size}`)
            setIsSearching(false)
        } else {
            promise = api.get(`/api/problem/list?page=${pageNum}&size=${size}`)
            setIsSearching(false)
        }

        promise
            .then(res => {
                let data = res.data.data || []

                // 客户端排序
                data.sort((a: any, b: any) => {
                    let aVal, bVal
                    if (sort === 'difficulty') {
                        const diffMap: any = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 }
                        aVal = diffMap[a.difficulty] || 0
                        bVal = diffMap[b.difficulty] || 0
                    } else if (sort === 'passRate') {
                        const aPass = a.numberOfSubmissions > 0 ? (a.numberOfAccepted / a.numberOfSubmissions) * 100 : 0
                        const bPass = b.numberOfSubmissions > 0 ? (b.numberOfAccepted / b.numberOfSubmissions) * 100 : 0
                        aVal = aPass
                        bVal = bPass
                    } else {
                        aVal = a.id
                        bVal = b.id
                    }

                    return order === 'asc' ? aVal - bVal : bVal - aVal
                })

                setProblems(data)
                setTotal(res.data.total || 0)
                setPage(pageNum)
            })
            .catch(e => {
                setError(e.response?.data?.error || 'Failed to load problems')
                setProblems([])
            })
            .finally(() => setLoading(false))
    }

    // 获取已通过的题目
    const loadSolvedProblems = () => {
        api.get('/api/user/solved-problems')
            .then(res => {
                setSolvedProblems(new Set(res.data.data || []))
            })
            .catch(() => {
                // 未登录或请求失败，保持为空
                setSolvedProblems(new Set())
            })
    }

    // 加载标签列表
    const loadTags = () => {
        api.get('/api/problem/tags')
            .then(res => {
                setTags(res.data.data || [])
            })
            .catch(() => {
                setTags([])
            })
    }

    useEffect(() => {
        loadProblems(1, searchKeyword, sortBy, sortOrder)
        loadSolvedProblems()
        loadTags()
    }, [])

    // 监听登录状态变化（通过定期检查已通过题目）
    useEffect(() => {
        const interval = setInterval(() => {
            loadSolvedProblems()
        }, 5000) // 每5秒检查一次
        return () => clearInterval(interval)
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setSelectedTag(null)
        loadProblems(1, searchKeyword, sortBy, sortOrder, null)
    }

    const handleSort = (newSort: 'id' | 'difficulty' | 'passRate') => {
        let newOrder: 'asc' | 'desc' = 'asc'
        if (sortBy === newSort) {
            // 同一列，切换排序方向
            newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
            setSortOrder(newOrder)
        } else {
            // 不同列，默认升序
            setSortBy(newSort)
            setSortOrder('asc')
        }
        loadProblems(page, searchKeyword, newSort, newOrder, selectedTag)
    }

    const handleClearSearch = () => {
        setSearchKeyword('')
        setSelectedTag(null)
        loadProblems(1, '', sortBy, sortOrder, null)
    }

    const handleTagSelect = (tag: string | null) => {
        setSelectedTag(tag)
        setSearchKeyword('')
        loadProblems(1, '', sortBy, sortOrder, tag)
    }

    // 根据选中的标签过滤题目 (现在由后端处理，但保留这个逻辑以防万一，或者移除它)
    const filteredProblems = problems

    const totalPages = Math.ceil(total / size)

    if (error) return <div className="container error">{error}</div>

    return (
        <div className="problems-wrapper">
            <div className="problems-toolbar">
                <form className="search-form" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="搜索题目名称..."
                        value={searchKeyword}
                        onChange={e => setSearchKeyword(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-btn">搜索</button>
                    {isSearching && (
                        <button type="button" onClick={handleClearSearch} className="clear-btn">清除</button>
                    )}
                </form>
                <label className="tags-toggle">
                    <input
                        type="checkbox"
                        checked={showTags}
                        onChange={e => setShowTags(e.target.checked)}
                    />
                    <span>显示分类标签</span>
                </label>
            </div>

            <div className="problems-container">
                {showTags && tags.length > 0 && (
                    <div className="tags-sidebar">
                        <div className="tags-title">标签</div>
                        <div className="tags-list">
                            <button
                                className={`tag-btn ${selectedTag === null ? 'active' : ''}`}
                                onClick={() => handleTagSelect(null)}
                            >
                                全部
                            </button>
                            {tags.map(tag => (
                                <button
                                    key={tag}
                                    className={`tag-btn ${selectedTag === tag ? 'active' : ''}`}
                                    onClick={() => handleTagSelect(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="problems-content">
                    {isSearching && (
                        <div className="search-info">
                            搜索结果 ({total} 个题目)
                        </div>
                    )}

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <div className="loading-text">正在加载题目列表...</div>
                        </div>
                    ) : problems.length === 0 ? (
                        <div className="empty-state">
                            {isSearching ? '没有找到匹配的题目' : '暂无题目'}
                        </div>
                    ) : (
                        <>
                            <div className="problems-count">共 {filteredProblems.length} 道题目</div>
                            <table className="problems-table">
                                <thead>
                                    <tr>
                                        <th>状态</th>
                                        <th
                                            onClick={() => handleSort('id')}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                            title="点击排序"
                                        >
                                            ID <span style={{ opacity: sortBy === 'id' ? 1 : 0.4 }}>{sortBy === 'id' ? (sortOrder === 'asc' ? '↑' : '↓') : '↑'}</span>
                                        </th>
                                        <th>题目</th>
                                        {showTags && <th>标签</th>}
                                        <th
                                            onClick={() => handleSort('difficulty')}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                            title="点击排序"
                                        >
                                            难度 <span style={{ opacity: sortBy === 'difficulty' ? 1 : 0.4 }}>{sortBy === 'difficulty' ? (sortOrder === 'asc' ? '↑' : '↓') : '↑'}</span>
                                        </th>
                                        <th>提交</th>
                                        <th>通过</th>
                                        <th
                                            onClick={() => handleSort('passRate')}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                            title="点击排序"
                                        >
                                            通过率 <span style={{ opacity: sortBy === 'passRate' ? 1 : 0.4 }}>{sortBy === 'passRate' ? (sortOrder === 'asc' ? '↑' : '↓') : '↑'}</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProblems.map(p => {
                                        const passRate = p.numberOfSubmissions > 0
                                            ? ((p.numberOfAccepted / p.numberOfSubmissions) * 100).toFixed(1)
                                            : 0
                                        const isSolved = solvedProblems.has(p.id)
                                        return (
                                            <tr
                                                key={p.id}
                                                style={{
                                                    cursor: 'pointer',
                                                    backgroundColor: isSolved ? '#f0f8f0' : 'transparent'
                                                }}
                                                onClick={() => window.location.href = `/problems/${p.id}`}
                                            >
                                                <td>{isSolved ? '✓ ' : ''}</td>
                                                <td>#{p.id}</td>
                                                <td>
                                                    <Link to={`/problems/${p.id}`} className="problem-title">
                                                        {p.title}
                                                    </Link>
                                                </td>
                                                {showTags && (
                                                    <td>
                                                        <div className="tags-cell">
                                                            {p.categories && p.categories.length > 0
                                                                ? p.categories.map(cat => (
                                                                    <span key={cat} className="tag-badge">{cat}</span>
                                                                ))
                                                                : <span style={{ color: '#999' }}>-</span>
                                                            }
                                                        </div>
                                                    </td>
                                                )}
                                                <td>
                                                    <span className={`difficulty-${p.difficulty.toLowerCase()}`}>
                                                        {p.difficulty === 'EASY' && '简单'}
                                                        {p.difficulty === 'MEDIUM' && '中等'}
                                                        {p.difficulty === 'HARD' && '困难'}
                                                    </span>
                                                </td>
                                                <td>{p.numberOfSubmissions || 0}</td>
                                                <td>{p.numberOfAccepted || 0}</td>
                                                <td>{passRate}%</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>

                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        onClick={() => loadProblems(page - 1, searchKeyword, sortBy, sortOrder, selectedTag)}
                                        disabled={page <= 1}
                                        className="page-btn"
                                    >
                                        ← 上一页
                                    </button>
                                    <span className="page-info">
                                        第 {page} / {totalPages} 页
                                    </span>
                                    <button
                                        onClick={() => loadProblems(page + 1, searchKeyword, sortBy, sortOrder, selectedTag)}
                                        disabled={page >= totalPages}
                                        className="page-btn"
                                    >
                                        下一页 →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <style>{`
                .problems-wrapper {
                    min-height: 100vh;
                    background: #fafbfc;
                }

                .problems-toolbar {
                    background: white;
                    padding: 16px 20px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                    flex-wrap: wrap;
                }

                .search-form {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    flex: 1;
                    min-width: 250px;
                }

                .search-input {
                    flex: 1;
                    padding: 8px 12px;
                    border: 1px solid #e0e0e0;
                    border-radius: 4px;
                    font-size: 14px;
                    transition: border-color 0.2s;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 4px rgba(102, 126, 234, 0.2);
                }

                .search-btn {
                    padding: 8px 16px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: background 0.2s;
                }

                .search-btn:hover {
                    background: #764ba2;
                }

                .clear-btn {
                    padding: 8px 12px;
                    background: #e0e0e0;
                    color: #666;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background 0.2s;
                }

                .clear-btn:hover {
                    background: #d0d0d0;
                }

                .tags-toggle {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #666;
                    user-select: none;
                }

                .tags-toggle input {
                    cursor: pointer;
                    width: 16px;
                    height: 16px;
                }

                .problems-container {
                    display: flex;
                    max-width: 1400px;
                    margin: 0 auto;
                    gap: 20px;
                    padding: 20px;
                    min-height: calc(100vh - 70px);
                }

                .tags-sidebar {
                    width: 200px;
                    background: white;
                    border-radius: 6px;
                    padding: 0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    height: fit-content;
                    position: sticky;
                    top: 76px;
                }

                .tags-title {
                    padding: 12px 16px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                    border-bottom: 1px solid #f0f0f0;
                }

                .tags-list {
                    display: flex;
                    flex-direction: column;
                }

                .tag-btn {
                    padding: 8px 16px;
                    background: transparent;
                    border: none;
                    text-align: left;
                    cursor: pointer;
                    font-size: 13px;
                    color: #666;
                    border-left: 3px solid transparent;
                    transition: all 0.2s;
                }

                .tag-btn:hover {
                    background: #f5f5f5;
                    color: #333;
                }

                .tag-btn.active {
                    color: #667eea;
                    border-left-color: #667eea;
                    background: #f0f2ff;
                }

                .problems-content {
                    flex: 1;
                }

                .search-info {
                    background: #f0f8ff;
                    border-left: 3px solid #2196f3;
                    padding: 12px 16px;
                    margin-bottom: 16px;
                    border-radius: 4px;
                    color: #1565c0;
                    font-size: 13px;
                }

                .problems-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    border-radius: 6px;
                    overflow: hidden;
                }

                .problems-table thead {
                    background: #f8f9fa;
                }

                .problems-table th {
                    padding: 12px 16px;
                    text-align: left;
                    font-weight: 600;
                    color: #333;
                    font-size: 13px;
                    border-bottom: 1px solid #e8e8e8;
                    letter-spacing: 0.3px;
                }

                .problems-table td {
                    padding: 11px 16px;
                    border-bottom: 1px solid #f0f0f0;
                    font-size: 13px;
                }

                .problems-table tbody tr:hover {
                    background: #fafbfc;
                }

                .problems-table tbody tr {
                    transition: background 0.1s;
                }

                .problem-title {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.2s;
                    cursor: pointer;
                }

                .problem-title:hover {
                    color: #764ba2;
                    text-decoration: underline;
                }

                .difficulty-easy { 
                    background: #e8f5e9;
                    color: #2e7d32;
                    padding: 3px 8px;
                    border-radius: 3px;
                    font-weight: 500;
                    font-size: 12px;
                    display: inline-block;
                }

                .difficulty-medium { 
                    background: #fff3e0;
                    color: #e65100;
                    padding: 3px 8px;
                    border-radius: 3px;
                    font-weight: 500;
                    font-size: 12px;
                    display: inline-block;
                }

                .difficulty-hard { 
                    background: #ffebee;
                    color: #c62828;
                    padding: 3px 8px;
                    border-radius: 3px;
                    font-weight: 500;
                    font-size: 12px;
                    display: inline-block;
                }

                .pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    margin-top: 24px;
                    padding: 16px;
                    background: white;
                    border-radius: 6px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }

                .page-btn {
                    padding: 8px 14px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    transition: background 0.2s;
                }

                .page-btn:hover:not(:disabled) {
                    background: #764ba2;
                }

                .page-btn:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                    opacity: 0.6;
                }

                .page-info {
                    color: #666;
                    font-weight: 500;
                    font-size: 13px;
                    min-width: 80px;
                    text-align: center;
                }

                .loading {
                    text-align: center;
                    padding: 40px;
                    color: #999;
                    font-size: 14px;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #999;
                    font-size: 14px;
                    background: white;
                    border-radius: 6px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }

                .tags-cell {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                }

                .tag-badge {
                    display: inline-block;
                    background: #f0f0f0;
                    color: #666;
                    padding: 2px 8px;
                    border-radius: 3px;
                    font-size: 12px;
                    white-space: nowrap;
                }

                .problems-count {
                    color: #666;
                    font-size: 14px;
                    padding-bottom: 8px;
                    margin-left: 20px;
                }

                @media (max-width: 1024px) {
                    .problems-container {
                        flex-direction: column;
                        gap: 16px;
                    }

                    .tags-sidebar {
                        width: 100%;
                        display: flex;
                        height: auto;
                        position: static;
                    }

                    .tags-list {
                        flex-direction: row;
                        flex-wrap: wrap;
                        padding: 8px;
                    }

                    .tag-btn {
                        flex: 0 1 calc(50% - 8px);
                        margin: 4px;
                        border-left: none;
                        border-bottom: 2px solid transparent;
                        padding: 8px 12px;
                    }

                    .tag-btn.active {
                        border-left: none;
                        border-bottom-color: #667eea;
                    }
                }

                @media (max-width: 768px) {
                    .problems-toolbar {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .search-form {
                        flex: 1;
                        min-width: auto;
                    }

                    .tags-toggle {
                        justify-content: center;
                    }

                    .problems-table {
                        font-size: 12px;
                    }

                    .problems-table th,
                    .problems-table td {
                        padding: 8px 12px;
                    }

                    .pagination {
                        flex-direction: column;
                        gap: 8px;
                    }

                    .page-btn {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    )
}
