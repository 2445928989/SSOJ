# Spring Boot 后端 Dockerfile
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline

COPY backend/src ./src
RUN mvn clean package -DskipTests

# Judger 编译阶段
FROM ubuntu:24.04 AS judger-builder

WORKDIR /app/judger
# 使用清华大学镜像加速 apt-get，同时兼容新旧两种配置格式
RUN (sed -i 's/archive.ubuntu.com/mirrors.tuna.tsinghua.edu.cn/g' /etc/apt/sources.list /etc/apt/sources.list.d/ubuntu.sources 2>/dev/null || true) && \
    (sed -i 's/security.ubuntu.com/mirrors.tuna.tsinghua.edu.cn/g' /etc/apt/sources.list /etc/apt/sources.list.d/ubuntu.sources 2>/dev/null || true) && \
    apt-get update && apt-get install -y \
    g++ \
    cmake \
    make \
    && rm -rf /var/lib/apt/lists/*

COPY judger/src ./src
COPY judger/CMakeLists.txt .
RUN mkdir build && cd build && cmake .. && make

# 运行阶段 - 使用非Alpine镜像以兼容judger二进制
FROM eclipse-temurin:17-jdk-noble

WORKDIR /app

# 安装编译工具和依赖（judger需要）
# 使用清华大学镜像加速 apt-get，同时兼容新旧两种配置格式
RUN (sed -i 's/archive.ubuntu.com/mirrors.tuna.tsinghua.edu.cn/g' /etc/apt/sources.list /etc/apt/sources.list.d/ubuntu.sources 2>/dev/null || true) && \
    (sed -i 's/security.ubuntu.com/mirrors.tuna.tsinghua.edu.cn/g' /etc/apt/sources.list /etc/apt/sources.list.d/ubuntu.sources 2>/dev/null || true) && \
    apt-get update && apt-get install -y \
    g++ \
    gcc \
    make \
    python3 \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/backend/target/*.jar app.jar
COPY --from=judger-builder /app/judger/build/judger ./judger/judger

EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
