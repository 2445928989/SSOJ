import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default defineConfig({
    plugins: [
        react(),
        monacoEditorPlugin({
            languageWorkers: ['editorWorkerService', 'typescript', 'json', 'html', 'css']
        })
    ],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
                changeOrigin: true,
                secure: false
            }
        }
    }
})
