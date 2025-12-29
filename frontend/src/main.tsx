import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { loader } from '@monaco-editor/react'
import App from './App'
import './styles.css'

// 配置 Monaco Editor 使用国内镜像 CDN，解决 jsdelivr 无法访问的问题
loader.config({
    paths: {
        vs: 'https://lib.baomitu.com/monaco-editor/0.52.2/min/vs'
    }
})

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
)
