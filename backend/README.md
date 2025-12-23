# SSOJ Backend 开发说明

## 项目结构

已创建完整的三层架构框架，所有类都包含 TODO 注释，待你逐步实现。

## 开发顺序建议

### 第一阶段：数据库和基础功能（已完成）
1. **创建数据库表**
   
   ```sql
   CREATE DATABASE ssoj;
   USE ssoj;
   
   -- 参考 entity 类的字段创建表
   -- user, problem, test_case, submission
   ```
   
2. **配置数据库连接**
   - 编辑 `application.properties`，取消注释数据库配置
   - 填写你的 MySQL 用户名密码

3. **实现 Entity 字段**
   
   - 在 `User.java`, `Problem.java` 等类中添加具体字段
   
4. **实现 Mapper XML**
   - 填充 `mapper/*.xml` 中的 SQL 语句

### 第二阶段：实现 Service 层
5. **UserService** - 注册、登录、JWT 生成
6. **ProblemService** - CRUD 操作
7. **SubmissionService** - 提交记录管理

### 第三阶段：实现 Controller 层
8. **UserController** - `/api/user/*` 接口
9. **ProblemController** - `/api/problem/*` 接口
10. **SubmissionController** - `/api/submission/*` 接口

### 第四阶段：核心判题功能
11. **JudgerInvoker** - 调用 judger 程序
12. **JudgeService** - 异步判题逻辑
13. **FileUtil** - 临时文件管理

### 第五阶段：配置和优化
14. **CorsConfig** - 跨域配置（对接前端时）
15. **AsyncConfig** - 判题线程池
16. **SecurityConfig** - 鉴权（可选）

## 测试运行

```bash
# 编译
mvn clean compile

# 运行
mvn spring-boot:run

# 测试
mvn test
```

## API 文档

所有 Controller 中都有 API 注释，包括：
- 请求方法
- 路径
- 参数格式
- 响应格式

## 依赖说明（已完成）

需要在 `pom.xml` 添加的依赖（如果还没有）：
- `spring-boot-starter-web`
- `spring-boot-starter-data-jdbc` 或 `mybatis-spring-boot-starter`
- `mysql-connector-java`
- `lombok`
- `jjwt` (JWT 库)
- `jackson-databind` (JSON 解析)

## 数据库表设计参考（已完成）

```sql
CREATE TABLE user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE problem (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    input_format TEXT,
    output_format TEXT,
    sample_input TEXT,
    sample_output TEXT,
    difficulty VARCHAR(20),
    time_limit DOUBLE DEFAULT 1.0,
    memory_limit INT DEFAULT 262144,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE test_case (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    problem_id BIGINT NOT NULL,
    input_path VARCHAR(255),
    output_path VARCHAR(255),
    is_sample BOOLEAN DEFAULT FALSE
);

CREATE TABLE submission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    problem_id BIGINT NOT NULL,
    code TEXT,
    language VARCHAR(20),
    status VARCHAR(20) DEFAULT 'PENDING',
    time_used BIGINT,
    memory_used BIGINT,
    error_message TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    judged_at TIMESTAMP
);
```

## 下一步（已完成）

从 Entity 字段定义开始，逐步实现每个 TODO 标记的功能。

​	
