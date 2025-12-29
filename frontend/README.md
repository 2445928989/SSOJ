# SSOJ 前端模块

SSOJ 的前端界面基于 React 18 和 TypeScript 构建，采用 Vite 作为构建工具，提供响应式且高性能的用户体验。

## 技术栈

- 核心框架：React 18
- 路由管理：React Router Dom 6
- 状态管理：React Hooks
- 网络请求：Axios
- 代码编辑器：Monaco Editor
- 数学公式渲染：KaTeX + React-Markdown
- 构建工具：Vite

## 核心功能

1. **仪表盘**：展示系统公告、最近题目及用户统计信息。
2. **题目列表**：支持按标题搜索、按难度和标签筛选。
3. **题目详情**：展示题目描述、输入输出格式、样例，并支持数学公式渲染。
4. **代码提交**：集成 Monaco Editor，支持多种编程语言的高亮和基础补全。
5. **提交详情**：实时展示判题进度，支持查看每个测试点的详细运行结果。
6. **个人中心**：管理个人资料、查看提交热力图及做题统计。
7. **管理后台**：提供题目管理、测试点在线编辑、公告发布等功能。

## 开发与运行

### 环境要求

- Node.js 18+
- npm 或 yarn

### 本地运行

1. 安装依赖：
   ```bash
   npm install
   ```
2. 启动开发服务器：
   ```bash
   npm run dev
   ```
   默认情况下，开发服务器会代理 `/api` 请求到 `http://localhost:8080`。

### 生产构建

```bash
npm run build
```
构建产物将生成在 `dist/` 目录下。

## 注意事项

- 认证机制：系统使用服务器端 Session (Cookie) 进行认证，Axios 已配置 `withCredentials: true`。
- 静态资源：Monaco Editor 的核心库已本地化部署在 `public/libs/monaco-editor` 目录下，以确保在无外网环境下也能正常加载。
