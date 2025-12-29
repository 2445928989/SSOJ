# SSOJ 判题核心 (Judger)

SSOJ 判题核心是一个基于 C++ 实现的高性能判题模块，负责在受限的环境中编译、运行用户提交的代码，并对比输出结果。

## 项目结构

- `src/`: 源代码目录
  - `main.cpp`: 程序入口，处理命令行参数
  - `compiler.cpp/h`: 编译模块，支持 C/C++ 和 Python
  - `runner.cpp/h`: 运行模块，负责 fork 子进程并监控
  - `resource.cpp/h`: 资源限制模块，使用 setrlimit 控制 CPU 和内存
  - `security.cpp/h`: 安全沙箱模块（基于系统调用监控）
  - `comparator.cpp/h`: 结果比对模块，支持忽略行尾空格
  - `utils.cpp/h`: 通用工具函数
- `config/`: 配置文件目录
  - `syscall_whitelist.json`: 系统调用白名单配置
  - `language_config.json`: 编程语言的编译与运行命令配置

## 编译与运行

### 编译要求

- GCC/G++ 9.0+
- CMake 3.10+
- Linux 操作系统 (利用 Linux 内核特性进行资源限制)

### 编译步骤

```bash
mkdir build && cd build
cmake ..
make
```

### 运行示例

```bash
./judger \
  --src /path/to/solution.cpp \
  --lang cpp \
  --input /path/to/input.txt \
  --output /path/to/expected.txt \
  --time 1 \
  --mem 256
```

## 判题流程

1. **初始化**：解析命令行参数，准备临时工作目录。
2. **编译**：根据语言配置调用编译器。如果编译失败，返回 `CE` 状态。
3. **运行**：
   - 创建子进程。
   - 在子进程中设置 `rlimit` 限制资源使用。
   - 重定向标准输入输出。
   - 使用 `execvp` 执行程序。
   - 父进程通过 `wait4` 监控子进程状态并统计资源消耗。
4. **比对**：将程序输出与期望输出进行比对。
5. **清理**：删除临时文件，输出 JSON 格式的判题结果。

## 输出格式

判题结果以标准 JSON 格式输出到 stdout：

```json
{
  "status": "AC",
  "time_ms": 125,
  "memory_kb": 2048,
  "compiler_message": "",
  "error_message": ""
}
```

状态码说明：
- `AC`: Accepted (通过)
- `WA`: Wrong Answer (答案错误)
- `TLE`: Time Limit Exceeded (时间超限)
- `MLE`: Memory Limit Exceeded (内存超限)
- `RE`: Runtime Error (运行错误)
- `CE`: Compile Error (编译错误)
- `SE`: System Error (系统错误)

## 测试

```bash
cd tests

# 编译测试
make test_utils && ./test_utils
make test_compiler && ./test_compiler
make test_comparator && ./test_comparator
make test_runner_simple && ./test_runner_simple
make test_runner_comprehensive && ./test_runner_comprehensive
make test_resource_limits && ./test_resource_limits

# 完整流程测试
make test_complete && ./test_complete

# 性能测试
make benchmark_cpu && ./benchmark_cpu
```

## 性能参考

基于实测数据（简单循环）：
- 1e8 次操作：约 100ms
- 2e8 次操作：约 200ms
- 1e9 次操作：约 1 秒

考虑到实际算法的数据结构和条件判断开销，建议 1 秒时限对应 1e8~2e8 的数据量。

## 安全说明

当前实现适用于开发和测试环境。生产环境需要额外的安全措施：
- 容器化部署（Docker）
- 使用 cgroup v2 进行精确资源控制
- 实现 seccomp 系统调用过滤
- 网络隔离
- 低权限用户运行

## 后端集成

Java 调用示例：

```java
ProcessBuilder pb = new ProcessBuilder(
    "/path/to/judger",
    "--src", sourcePath,
    "--lang", "cpp",
    "--input", inputPath,
    "--output", expectedOutputPath,
    "--time", "1",
    "--mem", "256"
);

Process process = pb.start();
BufferedReader reader = new BufferedReader(
    new InputStreamReader(process.getInputStream())
);
String jsonResult = reader.readLine();
JSONObject result = new JSONObject(jsonResult);
```
