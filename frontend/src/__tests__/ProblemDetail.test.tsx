import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProblemDetail from '../pages/ProblemDetail'
import { vi } from 'vitest'

vi.mock('../api', () => {
    return {
        default: {
            get: vi.fn((url: string) => {
                if (url.includes('/api/problem/123')) {
                    return Promise.resolve({
                        data: {
                            id: 123,
                            title: '两数之和',
                            timeLimit: 1.0,
                            memoryLimit: 262144,
                            numberOfAccepted: 10,
                            numberOfSubmissions: 20,
                            categories: ['数学'],
                            description: '**加法**',
                            inputFormat: '输入',
                            outputFormat: '输出',
                            sampleInput: '1 2',
                            sampleOutput: '3'
                        }
                    })
                }
                return Promise.resolve({ data: {} })
            })
        }
    }
})

describe('ProblemDetail', () => {
    it('渲染题目详情并显示提交按钮与各内容块', async () => {
        render(
            <MemoryRouter initialEntries={["/problems/123"]}>
                <Routes>
                    <Route path="/problems/:id" element={<ProblemDetail />} />
                </Routes>
            </MemoryRouter>
        )

        // 标题加载
        await waitFor(() => {
            expect(screen.getByText('#123. 两数之和')).toBeInTheDocument()
        })

        // 提交按钮链接正确
        const submitLink = screen.getByText('提交解答') as HTMLAnchorElement
        expect(submitLink.getAttribute('href')).toBe('/submit/123')

        // 统计信息渲染
        expect(screen.getByText('10 通过')).toBeInTheDocument()
        expect(screen.getByText('20 提交')).toBeInTheDocument()

        // 各内容区块标题
        expect(screen.getByText('题目描述')).toBeInTheDocument()
        expect(screen.getByText('输入格式')).toBeInTheDocument()
        expect(screen.getByText('输出格式')).toBeInTheDocument()
        expect(screen.getByText('样例')).toBeInTheDocument()

        // 样例内容
        expect(screen.getByText('1 2')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
    })
})
