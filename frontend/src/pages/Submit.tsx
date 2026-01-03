import React, { useState, useEffect } from 'react'
import api from '../api'
import { useParams, useNavigate } from 'react-router-dom'
import Editor, { loader } from '@monaco-editor/react'
import type { Monaco } from '@monaco-editor/react'
import * as prettier from 'prettier'
import { cppCompletions, pythonCompletions, javaCompletions, cCompletions } from '../completions'

// 配置 Monaco Editor 使用本地静态资源路径
loader.config({
    paths: {
        vs: '/libs/monaco-editor/min/vs'
    }
})

export default function SubmitPage() {
    const { id } = useParams()
    const [problem, setProblem] = useState<any>(null)
    const [code, setCode] = useState('')
    const [language, setLanguage] = useState('cpp')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const getMonacoLanguage = () => {
        const map: { [key: string]: string } = {
            'cpp': 'cpp',
            'c++': 'cpp',
            'c': 'c',
            'python': 'python',
            'python3': 'python',
            'java': 'java'
        }
        return map[language] || 'cpp'
    }

    useEffect(() => {
        if (id) {
            api.get(`/api/problem/${id}`)
                .then(res => setProblem(res.data))
                .catch(() => { })
        }
    }, [id])

    // 获取上次提交的代码
    useEffect(() => {
        if (id) {
            api.get(`/api/submission/latest?problemId=${id}`)
                .then(res => {
                    if (res.data && res.data.code) {
                        setCode(res.data.code)
                        if (res.data.language) {
                            setLanguage(res.data.language)
                        }
                    }
                })
                .catch(() => {
                    // 忽略错误，可能是未登录或没有提交记录
                })
        }
    }, [id])

    const handleEditorMount = (editor: any, monaco: Monaco) => {
        // 注册 C++ 补全提供器
        monaco.languages.registerCompletionItemProvider('cpp', {
            provideCompletionItems: () => ({
                suggestions: cppCompletions.map(c => ({
                    ...c,
                    kind: monaco.languages.CompletionItemKind[
                        typeof c.kind === 'number' ?
                            Object.keys(monaco.languages.CompletionItemKind)[c.kind] :
                            c.kind
                    ] || 1,
                }))
            })
        })

        // 注册 Python 补全提供器
        monaco.languages.registerCompletionItemProvider('python', {
            provideCompletionItems: () => ({
                suggestions: pythonCompletions.map(c => ({
                    ...c,
                    kind: monaco.languages.CompletionItemKind[
                        typeof c.kind === 'number' ?
                            Object.keys(monaco.languages.CompletionItemKind)[c.kind] :
                            c.kind
                    ] || 1,
                }))
            })
        })

        // 注册 Java 补全提供器
        monaco.languages.registerCompletionItemProvider('java', {
            provideCompletionItems: () => ({
                suggestions: javaCompletions.map(c => ({
                    ...c,
                    kind: monaco.languages.CompletionItemKind[
                        typeof c.kind === 'number' ?
                            Object.keys(monaco.languages.CompletionItemKind)[c.kind] :
                            c.kind
                    ] || 1,
                }))
            })
        })

        // 注册 C 语言补全提供器
        monaco.languages.registerCompletionItemProvider('c', {
            provideCompletionItems: () => ({
                suggestions: cCompletions.map(c => ({
                    ...c,
                    kind: monaco.languages.CompletionItemKind[
                        typeof c.kind === 'number' ?
                            Object.keys(monaco.languages.CompletionItemKind)[c.kind] :
                            c.kind
                    ] || 1,
                }))
            })
        })

        // 快捷键: Shift+Alt+F 格式化代码
        editor.addCommand(
            monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
            async () => {
                const model = editor.getModel()
                const code = model.getValue()
                const lang = model.getLanguageId()

                try {
                    let formatted = code
                    if (lang === 'cpp' || lang === 'c') {
                        formatted = await prettier.format(code, {
                            parser: 'babel',
                            semi: true,
                            tabWidth: 4
                        })
                    } else if (lang === 'python') {
                        formatted = await prettier.format(code, {
                            parser: 'python',
                            tabWidth: 4
                        })
                    } else if (lang === 'java') {
                        formatted = await prettier.format(code, {
                            parser: 'babel',
                            tabWidth: 4
                        })
                    }
                    model.setValue(formatted)
                } catch (e) {
                    console.log('Format error:', e)
                }
            }
        )
    }

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code.trim()) {
            setError('请输入代码')
            return
        }
        setLoading(true)
        setError('')
        try {
            const res = await api.post('/api/submission/submit', {
                problemId: Number(id),
                code,
                language
            })
            navigate(`/submissions/${res.data.submissionId}`)
        } catch (e: any) {
            setError(e.response?.data?.error || '提交失败')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="submit-container">
            <div className="submit-card">
                <div className="submit-header">
                    {problem && (
                        <div className="problem-info">
                            <h1>提交解答</h1>
                            <p className="problem-title">题目：{problem.title}</p>
                        </div>
                    )}
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form className="submit-form" onSubmit={submit}>
                    <div className="form-group">
                        <label htmlFor="language">选择编程语言</label>
                        <select
                            id="language"
                            value={language}
                            onChange={e => setLanguage(e.target.value)}
                            className="language-select"
                        >
                            <option value="cpp">C++</option>
                            <option value="c">C</option>
                            <option value="python">Python</option>
                            <option value="python3">Python3</option>
                            <option value="java">Java</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="code">代码编辑</label>
                        <div className="code-editor-wrapper">
                            <Editor
                                height="500px"
                                language={getMonacoLanguage()}
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                onMount={handleEditorMount}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: 4,
                                    insertSpaces: false,
                                    wordWrap: 'off',
                                    bracketPairColorization: {
                                        enabled: true
                                    },
                                    autoClosingBrackets: 'always',
                                    autoClosingQuotes: 'always',
                                    autoIndent: 'full',
                                    formatOnPaste: false,
                                    suggest: {
                                        showKeywords: true,
                                        showSnippets: true
                                    },
                                    quickSuggestions: {
                                        other: 'on',
                                        comments: 'off',
                                        strings: 'off'
                                    },
                                    suggestOnTriggerCharacters: true,
                                    acceptSuggestionOnCommitCharacter: true,
                                    acceptSuggestionOnEnter: 'smart'
                                }}
                            />
                        </div>
                        <div className="code-hint">
                            已输入 {code.length} 个字符
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            disabled={loading}
                            className="submit-btn"
                        >
                            {loading ? '⏳ 提交中...' : '提交代码'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="back-btn"
                        >
                            ← 返回
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .submit-container {
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .submit-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
                    overflow: hidden;
                }

                .submit-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 40px 30px;
                }

                .problem-info h1 {
                    margin: 0 0 15px 0;
                    font-size: 2em;
                }

                .problem-title {
                    margin: 0;
                    font-size: 1.1em;
                    opacity: 0.9;
                }

                .error-msg {
                    background: #ffebee;
                    border-left: 4px solid #f44336;
                    color: #c62828;
                    padding: 15px 20px;
                    margin: 20px 20px 0 20px;
                    border-radius: 4px;
                }

                .submit-form {
                    padding: 40px;
                }

                .form-group {
                    margin-bottom: 30px;
                }

                .form-group label {
                    display: block;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 12px;
                    font-size: 1.05em;
                }

                .language-select {
                    width: 100%;
                    padding: 12px 15px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 1em;
                    cursor: pointer;
                    transition: all 0.3s;
                    background: white;
                }

                .language-select:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 8px rgba(102, 126, 234, 0.2);
                }

                .code-editor-wrapper {
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .cm-editor {
                    border: none !important;
                    border-radius: 6px;
                    font-family: 'Courier New', monospace !important;
                    font-size: 0.95em !important;
                }

                .cm-gutters {
                    background-color: #282c34 !important;
                    border-right: 1px solid #3e4451 !important;
                }

                .cm-linenumber {
                    color: #5a5e6f !important;
                }

                .code-hint {
                    text-align: right;
                    font-size: 0.85em;
                    color: #999;
                    margin-top: 8px;
                }

                .form-actions {
                    display: flex;
                    gap: 15px;
                    margin: 30px 0;
                }

                .submit-btn,
                .back-btn {
                    flex: 1;
                    padding: 15px 30px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1.05em;
                    transition: all 0.3s;
                }

                .submit-btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
                }

                .submit-btn:active:not(:disabled) {
                    transform: translateY(-1px);
                }

                .submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .back-btn {
                    background: #f0f0f0;
                    color: #555;
                }

                .back-btn:hover {
                    background: #e0e0e0;
                }

                .submit-tips {
                    background: #e3f2fd;
                    border-top: 1px solid #bbdefb;
                    padding: 25px 40px;
                    color: #1565c0;
                }

                .submit-tips h3 {
                    margin-top: 0;
                }

                .submit-tips ul {
                    margin: 10px 0;
                    padding-left: 20px;
                }

                .submit-tips li {
                    margin: 8px 0;
                }

                @media (max-width: 768px) {
                    .submit-container {
                        padding: 10px;
                    }

                    .submit-btn,
                    .back-btn {
                        padding: 12px 20px;
                        font-size: 0.95em;
                    }

                    .form-actions {
                        flex-direction: column;
                    }

                    .cm-editor {
                        font-size: 0.85em !important;
                    }
                }
            `}</style>
        </div>
    )
}
