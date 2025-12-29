# SSOJ - Simple School Online Judge

SSOJ 是一个轻量级的在线编程判题系统，旨在为学校或小型组织提供简单易用的编程练习和竞赛平台。

## 项目简介

SSOJ 采用了现代化的前后端分离架构，结合了高性能的判题核心，支持多种编程语言。系统提供了从题目管理、代码提交到自动判题、结果反馈的完整流程。

## 核心特性

- 前端：基于 React 18 和 TypeScript 构建，使用 Vite 作为构建工具，提供流畅的用户体验。
- 后端：基于 Spring Boot 3 框架，使用 MyBatis 进行持久层管理，保证了系统的稳定性和可扩展性。
- 判题系统：独立的 C++ 判题核心，运行在隔离的 Docker 容器中，确保判题的安全性和准确性。
- 数据库：使用 MySQL 8.0 存储用户、题目、提交记录等核心数据。
- 认证系统：支持邮箱注册、登录以及找回密码功能。
- 题目管理：支持 Markdown 格式的题目描述，支持 ZIP 压缩包批量上传测试用例，并允许管理员直接在线编辑测试点。
- 实时反馈：采用异步判题机制，用户提交代码后可实时查看判题进度和详细结果。

## 技术栈

- 后端：Spring Boot 3, MyBatis, MySQL, JavaMail (用于验证码发送)
- 前端：React 18, TypeScript, Vite, Monaco Editor (代码编辑器), KaTeX (数学公式渲染)
- 判题核心：C++, Docker SDK
- 部署：Docker, Docker Compose, Nginx

## 快速开始

### 环境要求

- Docker
- Docker Compose

### 部署步骤

1. 克隆仓库到本地。
2. 配置环境变量（如 SMTP 邮箱设置，见 docker-compose.yml）。
3. 在项目根目录下执行启动命令：
   ```bash
   docker-compose up -d
   ```
4. 访问地址：
   - 前端界面：http://localhost:8088 (默认配置)
   - 数据库管理 (Adminer)：http://localhost:8082

### 默认管理员账号

- 用户名：admin
- 密码：admin123

## 项目结构

- backend/: Spring Boot 后端源代码。
- frontend/: React 前端源代码。
- judger/: C++ 判题核心程序。
- database/: 数据库初始化脚本和测试用例示例。
- docs/: 项目文档，包括需求分析、设计文档和用户手册。
- maker/: 测试用例生成工具。

## 许可证

本项目采用 MIT 许可证。
