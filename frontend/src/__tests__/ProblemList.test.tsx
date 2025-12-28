import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import ProblemList from '../pages/ProblemList'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Mock api module
vi.mock('../api', () => {
    return {
        default: {
            get: vi.fn((url: string) => {
                if (url.includes('/api/problem/list')) {
                    return Promise.resolve({
                        data: {
                            data: [
                                { id: 1, title: 'A', difficulty: 'HARD', numberOfSubmissions: 10, numberOfAccepted: 5, categories: ['数学'] },
                                { id: 2, title: 'B', difficulty: 'EASY', numberOfSubmissions: 0, numberOfAccepted: 0, categories: ['图论'] },
                                { id: 3, title: 'C', difficulty: 'MEDIUM', numberOfSubmissions: 10, numberOfAccepted: 5, categories: ['数学', '数据结构'] }
                            ],
                            total: 3
                        }
                    })
                }
                if (url.includes('/api/user/solved-problems')) {
                    return Promise.resolve({ data: { data: [1] } })
                }
                if (url.includes('/api/problem/tags')) {
                    return Promise.resolve({ data: { data: ['数学', '图论'] } })
                }
                return Promise.resolve({ data: { data: [], total: 0 } })
            })
        }
    }
})

describe('ProblemList', () => {
    it('加载并展示题目列表与标签', async () => {
        render(
            <MemoryRouter>
                <ProblemList />
            </MemoryRouter>
        )

        // 初始加载提示
        expect(screen.getByText('加载中...')).toBeInTheDocument()

        // 加载完成后显示题目数量与标签侧栏
        await waitFor(() => {
            expect(screen.getByText(/共\s+3\s+道题目/)).toBeInTheDocument()
            expect(screen.getAllByText('标签').length).toBeGreaterThan(0)
            // 标签按钮存在
            expect(screen.getByRole('button', { name: '数学' })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: '图论' })).toBeInTheDocument()
        })

        // 表格应显示三行数据
        const rows = document.querySelectorAll('.problems-table tbody tr')
        expect(rows.length).toBe(3)
    })

    it('点击难度列进行排序（升序）', async () => {
        render(
            <MemoryRouter>
                <ProblemList />
            </MemoryRouter>
        )
        await screen.findByText(/共\s+3\s+道题目/)

        // 点击难度列头（第二个带有“点击排序”的表头：ID、难度、通过率）
        const sortHeaders = screen.getAllByTitle('点击排序')
        const difficultyHeader = sortHeaders[1]
        fireEvent.click(difficultyHeader)

        // 再次等待渲染
        await waitFor(() => {
            const firstRow = document.querySelector('.problems-table tbody tr') as HTMLTableRowElement
            // 难度列文本应为“简单”（EASY）
            expect(firstRow).toBeTruthy()
            expect(firstRow.textContent || '').toContain('简单')
        })
    })

    it('点击标签进行筛选', async () => {
        render(
            <MemoryRouter>
                <ProblemList />
            </MemoryRouter>
        )
        await screen.findByText(/共\s+3\s+道题目/)

        // 点击“数学”标签
        const mathTagBtn = screen.getByRole('button', { name: '数学' })
        fireEvent.click(mathTagBtn)

        await waitFor(() => {
            const rows = document.querySelectorAll('.problems-table tbody tr')
            // 期望筛选后行数为 2（属于“数学”的题目）
            expect(rows.length).toBe(2)
        })
    })
})
