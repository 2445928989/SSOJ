# SSOJ Judger

在线判题系统的核心判题模块，使用 C++ 实现，负责编译、运行用户代码并进行结果比对。

## 项目结构

```
judger/
├── src/                        # 源代码
│   ├── main.cpp                # 判题程序入口
│   ├── compiler.cpp/h          # 编译模块
│   ├── runner.cpp/h            # 运行模块
│   ├── resource.cpp/h          # 资源限制模块
│   ├── security.cpp/h          # 安全沙箱模块
│   ├── comparator.cpp/h        # 输出比对模块
│   └── utils.cpp/h             # 工具函数
├── config/                     # 配置文件
│   ├── syscall_whitelist.json  # 系统调用白名单
│   └── language_config.json    # 语言编译配置
├── tests/                      # 测试文件
└── docs/                       # 文档
```

## 快速开始

### 编译

```bash
cd judger
g++ -std=c++17 -o judger src/*.cpp
```

### 运行

```bash
./judger \
  --src solution.cpp \
  --lang cpp \
  --input input.txt \
  --output expected_output.txt \
  --time 1 \
  --mem 256
```

### 参数说明

- `--src` - 源代码文件路径
- `--lang` - 编程语言（cpp/c/python）
- `--input` - 测试输入文件
- `--output` - 期望输出文件
- `--time` - 时间限制（秒）
- `--mem` - 内存限制（MB）

### 输出格式

JSON 格式输出判题结果：

```json
{
  "status": "AC",
  "time_ms": 125,
  "memory_kb": 2048,
  "compiler_message": "",
  "error_message": ""
}
```

状态码：`AC`（通过）/ `WA`（答案错误）/ `TLE`（超时）/ `MLE`（内存超限）/ `RE`（运行时错误）/ `CE`（编译错误）/ `SE`（系统错误）

## 模块说明

### utils 模块
基础工具函数，包括文件读写、临时目录管理、JSON 转义、日志记录等。

### compiler 模块
编译源代码，支持 C/C++ 和 Python。C/C++ 使用 g++ 编译，Python 直接返回源文件路径。编译失败时捕获错误信息。

### runner 模块
核心执行模块，使用 fork/exec/wait4 运行用户程序：
- 子进程设置资源限制、重定向 IO、执行程序
- 父进程监控子进程、检测超时、获取资源使用
- 根据退出信号判断状态（SIGXCPU→TLE，SIGSEGV→RE 等）

### resource 模块
资源限制和统计：
- 使用 setrlimit 设置 CPU、内存、栈、输出大小限制
- 解析 rusage 获取实际资源使用（CPU 时间、内存）

### comparator 模块
输出比对，支持精确匹配和忽略行尾空白两种模式。比对失败时返回详细错误信息。

### security 模块
安全沙箱（当前为占位实现，需要 libseccomp-dev 支持）。

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
