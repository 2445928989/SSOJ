# SSOJ Judger - 判题核心模块

## 📖 简介

SSOJ Judger 是一个 C++ 实现的在线判题核心模块，负责编译、运行用户代码并进行结果比对。

## 🏗️ 项目结构

```
judger/
├── CMakeLists.txt              # CMake 构建配置
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
└── tests/                      # 单元测试
```

## 🚀 快速开始

### 前置依赖

- **编译器**: g++ 7.0+ (支持 C++17)
- **CMake**: 3.10+
- **libseccomp**: 用于系统调用过滤（可选）

在 Ubuntu/Debian 上安装：
```bash
sudo apt update
sudo apt install build-essential cmake libseccomp-dev
```

### 编译

```bash
cd judger
mkdir build && cd build
cmake ..
make
```

编译成功后会生成 `judger` 可执行文件。

### 基本使用

```bash
./judger \
  --src /path/to/source.cpp \
  --lang cpp \
  --input /path/to/input.txt \
  --output /path/to/expected_output.txt \
  --time 1 \
  --mem 256
```

### 参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| `--src` | 源代码文件路径 | `solution.cpp` |
| `--lang` | 编程语言 | `cpp`, `c`, `python`, `java` |
| `--input` | 测试用例输入文件 | `input.txt` |
| `--output` | 期望输出文件 | `output.txt` |
| `--time` | 时间限制（秒） | `1` |
| `--mem` | 内存限制（MB） | `256` |

### 输出格式（JSON）

```json
{
  "status": "AC",
  "time_ms": 125,
  "memory_kb": 2048,
  "compiler_message": "",
  "error_message": ""
}
```

**状态码说明**：
- `AC`: Accepted（通过）
- `WA`: Wrong Answer（答案错误）
- `TLE`: Time Limit Exceeded（超时）
- `MLE`: Memory Limit Exceeded（内存超限）
- `RE`: Runtime Error（运行时错误）
- `CE`: Compile Error（编译错误）
- `SE`: System Error（系统错误）

## 📝 开发指南

### 模块职责

#### 1. **utils 模块** (`utils.cpp/h`)
工具函数集合，提供文件操作、日志记录等基础功能。

**主要函数**：
- `readFile()` - 读取文件内容
- `writeFile()` - 写入文件
- `createTempDir()` - 创建临时目录
- `jsonEscape()` - JSON 字符串转义
- `log()` - 日志记录

#### 2. **compiler 模块** (`compiler.cpp/h`)
负责编译源代码（C/C++/Java）。

**主要函数**：
- `compile()` - 编译源代码
- `getCompileCommand()` - 获取编译命令
- `executeCompile()` - 执行编译并捕获输出

**待实现**：
- 从 `language_config.json` 读取编译配置
- 使用 `popen()` 执行编译命令并捕获 stderr

#### 3. **resource 模块** (`resource.cpp/h`)
使用 `setrlimit` 或 `cgroup` 限制程序资源使用。

**主要函数**：
- `setResourceLimits()` - 设置资源限制（CPU、内存、栈）
- `setCgroupLimits()` - 使用 cgroup 设置限制（高级）
- `getResourceUsage()` - 获取进程资源使用情况

**待实现**：
- 使用 `setrlimit()` 设置 `RLIMIT_CPU`, `RLIMIT_AS`, `RLIMIT_STACK`
- 从 `wait4()` 的 `rusage` 获取资源使用

#### 4. **security 模块** (`security.cpp/h`)
实现安全沙箱，限制危险系统调用。

**主要函数**：
- `applySeccompFilter()` - 应用 seccomp 过滤器
- `loadSyscallWhitelist()` - 加载系统调用白名单
- `setupSecureEnvironment()` - 设置安全环境

**待实现**（可选）：
- 使用 `libseccomp` 设置系统调用白名单
- 禁止 `socket`, `fork`, `execve` 等危险调用

#### 5. **runner 模块** (`runner.cpp/h`)
执行用户程序并监控运行状态。

**主要函数**：
- `runProgram()` - 运行程序主入口
- `executeInChild()` - 子进程中执行程序
- `monitorChild()` - 父进程监控子进程

**待实现**：
- `fork()` 创建子进程
- 子进程中设置资源限制、重定向 IO、执行程序
- 父进程使用 `wait4()` 等待并获取资源使用
- 实现超时控制（wallclock time）

#### 6. **comparator 模块** (`comparator.cpp/h`)
比对用户输出与期望输出。

**主要函数**：
- `compareOutput()` - 比对输出（支持多种模式）
- `ignoreTrailingCompare()` - 忽略末尾空白
- `runSpecialJudge()` - 运行 Special Judge（可选）

**待实现**：
- 实现三种比对模式：精确、忽略末尾空白、忽略所有空白
- （可选）支持 Special Judge

#### 7. **main 模块** (`main.cpp`)
判题流程主控制逻辑。

**流程**：
1. 解析命令行参数
2. 创建临时工作目录
3. 编译源代码
4. 运行程序
5. 比对输出
6. 输出 JSON 结果
7. 清理临时文件

## 🧪 测试示例

### 创建测试文件

```bash
# 1. 创建测试源码
cat > /tmp/test.cpp << 'EOF'
#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
EOF

# 2. 创建输入
echo "1 2" > /tmp/input.txt

# 3. 创建期望输出
echo "3" > /tmp/output.txt

# 4. 运行判题
./judger --src /tmp/test.cpp --lang cpp \
         --input /tmp/input.txt --output /tmp/output.txt \
         --time 1 --mem 64
```

预期输出：
```json
{"status":"AC","time_ms":10,"memory_kb":1024,"compiler_message":"","error_message":""}
```

## 🔒 安全注意事项

**当前实现是教学/原型版本，不应直接用于生产环境！**

### 已知限制

1. **无真正沙箱隔离** - 未使用容器或虚拟机
2. **系统调用未限制** - seccomp 模块待完善
3. **资源限制不够精确** - `setrlimit` 有局限性

### 生产环境建议

1. **容器化部署**：将判题机放在 Docker 容器中运行
2. **使用 cgroup v2**：更精确的资源限制
3. **启用 seccomp**：完善系统调用白名单
4. **网络隔离**：禁用网络访问
5. **用户隔离**：使用低权限用户运行

## 📚 后续扩展

### 阶段一：基础功能（当前）
- [x] 框架搭建
- [ ] 完成 `utils` 模块
- [ ] 完成 `compiler` 模块
- [ ] 完成 `runner` 模块（基于 setrlimit）
- [ ] 完成 `comparator` 模块

### 阶段二：安全加固
- [ ] 实现 seccomp 过滤器
- [ ] 使用 cgroup 限制资源
- [ ] 添加超时保护
- [ ] 文件系统隔离

### 阶段三：功能增强
- [ ] 支持更多语言（Python、Java、Go）
- [ ] Special Judge 支持
- [ ] 交互题支持
- [ ] 性能优化

## 🤝 开发流程

每个模块都已经提供了函数原型和 `TODO` 注释，你可以按照以下顺序逐个实现：

1. **先实现 `utils.cpp`** - 其他模块都会用到
2. **实现 `compiler.cpp`** - 测试编译功能
3. **实现 `runner.cpp`** - 重点模块，涉及进程管理
4. **实现 `comparator.cpp`** - 相对简单
5. **完善 `resource.cpp`** 和 `security.cpp` - 可选高级功能

每个函数上方都有详细注释说明其职责和实现提示。

## 📞 接口说明

### 后端调用方式

```java
// Java 示例
Process process = Runtime.getRuntime().exec(new String[]{
    "/path/to/judger",
    "--src", sourcePath,
    "--lang", "cpp",
    "--input", inputPath,
    "--output", expectedOutputPath,
    "--time", "1",
    "--mem", "256"
});

BufferedReader reader = new BufferedReader(
    new InputStreamReader(process.getInputStream())
);
String jsonResult = reader.readLine();
JSONObject result = new JSONObject(jsonResult);
String status = result.getString("status");
```

## 📄 许可证

MIT License

---

**作者**: SSOJ Team  
**日期**: 2025-12-11
