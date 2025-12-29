# SSOJ 后端模块

SSOJ 的后端服务基于 Spring Boot 3 构建，负责处理业务逻辑、用户认证、题目管理以及判题任务的调度。

## 技术栈

- 核心框架：Spring Boot 3.4.1
- 持久层：MyBatis
- 数据库：MySQL 8.0
- 认证：基于 Session 的认证，支持邮箱验证码
- 邮件服务：JavaMailSender (用于注册验证和密码重置)
- 异步处理：Spring TaskExecutor (用于异步判题调度)

## 项目结构

- `src/main/java/com/ssoj/backend/`
  - `controller/`: REST API 控制器
  - `service/`: 业务逻辑层
  - `dao/`: 数据访问接口 (MyBatis Mapper)
  - `entity/`: 数据库实体类
  - `util/`: 工具类 (文件操作、邮件发送等)
  - `config/`: 系统配置 (跨域、异步、安全等)
- `src/main/resources/`
  - `mapper/`: MyBatis SQL 映射文件
  - `application.properties`: 核心配置文件

## 核心功能

1. **用户系统**：支持注册、登录、个人资料修改、头像上传、邮箱验证码发送及密码重置。
2. **题目管理**：支持题目的 CRUD 操作，支持 ZIP 压缩包上传测试用例，支持在线编辑测试点。
3. **判题调度**：接收用户提交的代码，将其保存到本地文件系统，并调用独立的判题核心进行评测。
4. **结果统计**：实时更新用户的通过数、提交数以及题目的通过率。

## 开发与运行

### 环境要求

- JDK 17+
- Maven 3.6+
- MySQL 8.0

### 本地运行

1. 配置 `src/main/resources/application.properties` 中的数据库连接和邮件服务器信息。
2. 执行 Maven 命令：
   ```bash
   mvn spring-boot:run
   ```

### 编译打包

```bash
mvn clean package
```
生成的 JAR 包位于 `target/` 目录下。

## API 接口

后端提供标准的 RESTful API，主要路径前缀为 `/api`。详细接口定义请参考各 Controller 类中的注释。