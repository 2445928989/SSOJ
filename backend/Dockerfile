# Spring Boot 后端 Dockerfile
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline

COPY backend/src ./src
RUN mvn clean package -DskipTests

# 运行阶段 - 使用非Alpine镜像以兼容judger二进制
FROM eclipse-temurin:17-jdk-noble

WORKDIR /app

# 安装编译工具和依赖（judger需要）
RUN apt-get update && apt-get install -y \
    g++ \
    gcc \
    make \
    python3 \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/backend/target/*.jar app.jar
COPY judger/judger ./judger/judger

EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
