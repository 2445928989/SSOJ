# 🎓 SSOJ - Simple School Online Judge

轻量级在线编程判题系统。

## ✨ 特性

- React 18 + TypeScript 前端
- Spring Boot 3 后端
- MySQL 8.0 数据库
- 题目管理和代码提交
- 异步判题系统
- 用户排行榜
- Docker 容器化部署

## 🚀 快速开始

### Docker 部署

```bash
docker-compose up -d
```

访问:
- 前端: http://localhost
- 后端: http://localhost:8080

### 本地开发

**后端:**
```bash
cd backend
mvn spring-boot:run
```

**前端:**
```bash
cd frontend
npm install
npm run dev
```

## 🔐 默认账号

```
用户名: admin
密码: admin123
```

## 🏗️ 项目结构

```
ssoj/
├── backend/              # Spring Boot 后端
├── frontend/             # React 前端
├── database/             # 数据库 schema 和初始数据
├── judger/              # 判题程序（C++）
└── docker-compose.yml    # Docker 编排配置
```

## 📚 技术栈

**后端:** Spring Boot 3, MyBatis, MySQL, BCrypt, Spring Event  
**前端:** React 18, TypeScript, Vite, Axios, React Router  
**部署:** Docker, Docker Compose, Nginx

## 🐳 Docker 命令

```bash
docker-compose up -d        # 启动
docker-compose down         # 停止（保留数据）
docker-compose down -v      # 停止（删除所有）
docker-compose logs -f      # 查看日志
docker-compose ps           # 查看容器状态
```

## 📝 初始化数据

- 1 个管理员用户 (admin/admin123)
- 5 个示例题目
- 7 个分类标签

## 🔧 环境配置

数据库用户: `ssoj_dev`  
数据库密码: `ssoj_dev123`  
数据库名: `ssoj`

## 📄 许可证

MIT
