#include "runner.h"
#include "resource.h"
#include "security.h"
#include "utils.h"
#include <cstring> // for memset
#include <fcntl.h>
#include <signal.h>
#include <sys/resource.h> // for rusage
#include <sys/wait.h>
#include <unistd.h>

namespace judger {

    RunResult runProgram(const std::string &executablePath,
                         const std::string &language,
                         const std::string &stdinPath,
                         const std::string &stdoutPath,
                         const std::string &stderrPath,
                         const ResourceLimit &limits) {
        // TODO: 实现运行逻辑
        // 1. fork 子进程
        // 2. 子进程中设置资源限制、安全策略、重定向IO
        // 3. 父进程监控子进程运行
        // 4. 收集结果并返回

        RunResult result;
        result.status = RunStatus::SE;

        pid_t pid = fork();

        if (pid < 0) {
            // fork失败
            result.errorMessage = "Fork failed";
            return result;
        } else if (pid == 0) {
            // 子进程
            executeInChild(executablePath, language, stdinPath, stdoutPath, stderrPath, limits);
            // 如果执行到这里说明 exec 失败
            exit(127);
        } else {
            // 父进程
            result = monitorChild(pid, limits);

            // 读取输出
            result.stdoutContent = readFile(stdoutPath);
            result.stderrContent = readFile(stderrPath);
        }

        return result;
    }

    void executeInChild(const std::string &executablePath,
                        const std::string &language,
                        const std::string &stdinPath,
                        const std::string &stdoutPath,
                        const std::string &stderrPath,
                        const ResourceLimit &limits) {
        // 子进程执行逻辑
        // 1. 设置资源限制
        // 2. 应用安全策略
        // 3. 重定向 stdin/stdout/stderr
        // 4. execve 执行程序

        // 设置资源限制
        if (!setResourceLimits(limits)) {
            log("ERROR", "Failed to set resource limits");
            exit(126); // 资源限制设置失败
        }

        // 应用安全策略（可选，暂时可能返回true）
        applySeccompFilter(language);

        // 重定向 stdin
        if (!stdinPath.empty()) {
            int fd_in = open(stdinPath.c_str(), O_RDONLY);
            if (fd_in < 0) {
                perror("open stdin");
                exit(126);
            }
            dup2(fd_in, STDIN_FILENO);
            close(fd_in);
        }

        // 重定向 stdout
        int fd_out = open(stdoutPath.c_str(), O_WRONLY | O_CREAT | O_TRUNC, 0644);
        if (fd_out < 0) {
            perror("open stdout");
            exit(126);
        }
        dup2(fd_out, STDOUT_FILENO);
        close(fd_out);

        // 重定向 stderr
        int fd_err = open(stderrPath.c_str(), O_WRONLY | O_CREAT | O_TRUNC, 0644);
        if (fd_err < 0) {
            perror("open stderr");
            exit(126);
        }
        dup2(fd_err, STDERR_FILENO);
        close(fd_err);

        // 执行程序
        // 对于编译型语言（C/C++），直接执行二进制文件
        if (language == "c" || language == "c++" || language == "cpp") {
            char *args[] = {const_cast<char *>(executablePath.c_str()), nullptr};
            execv(executablePath.c_str(), args);

            // 如果 execv 返回，说明执行失败
            perror("execv");
            exit(127);
        }
        // 对于 Python，使用解释器运行
        else if (language == "python" || language == "python3" || language == "py") {
            char *args[] = {
                const_cast<char *>("/usr/bin/python3"),
                const_cast<char *>(executablePath.c_str()),
                nullptr};
            execv("/usr/bin/python3", args);

            perror("execv python");
            exit(127);
        }
        // 其他语言
        else {
            log("ERROR", "Unsupported language in child process: " + language);
            exit(127);
        }
    }

    RunResult monitorChild(pid_t pid, const ResourceLimit &limits) {
        // 监控子进程
        // 1. 使用 wait4() 等待子进程结束
        // 2. 实现超时控制（wallclock time）
        // 3. 获取资源使用情况
        // 4. 判断运行状态（OK/TLE/MLE/RE）

        RunResult result;
        result.status = RunStatus::SE;

        int status = 0;
        struct rusage usage;
        memset(&usage, 0, sizeof(usage));

        // 实现超时控制：轮询方式
        // realTimeLimitSec 是墙钟时间限制（防止死循环等）
        int pollIntervalMs = 10; // 每10ms检查一次
        int maxWaitMs = limits.realTimeLimitSec * 1000;
        int waitedMs = 0;

        while (true) {
            // WNOHANG: 非阻塞等待
            pid_t ret = wait4(pid, &status, WNOHANG, &usage);

            if (ret == pid) {
                // 子进程结束了
                break;
            } else if (ret == 0) {
                // 子进程还在运行
                usleep(pollIntervalMs * 1000); // 睡眠 10ms
                waitedMs += pollIntervalMs;

                // 超过墙钟时间限制，强制杀死子进程
                if (waitedMs >= maxWaitMs) {
                    kill(pid, SIGKILL);
                    wait4(pid, &status, 0, &usage); // 回收子进程
                    result.status = RunStatus::TLE;
                    result.errorMessage = "Real time limit exceeded";
                    log("WARN", "Process killed due to real time limit");
                    break;
                }
            } else {
                // wait4 出错
                result.status = RunStatus::SE;
                result.errorMessage = "wait4 failed";
                log("ERROR", "wait4 failed");
                return result;
            }
        }

        // 计算资源使用
        // CPU 时间 = 用户态时间 + 系统态时间
        long cpuTimeMs = (usage.ru_utime.tv_sec + usage.ru_stime.tv_sec) * 1000 +
                         (usage.ru_utime.tv_usec + usage.ru_stime.tv_usec) / 1000;

        // 内存使用（Linux 上 ru_maxrss 单位是 KB）
        long memoryKB = usage.ru_maxrss;

        // 填充 ResourceUsage
        result.usage.cpuTimeMs = cpuTimeMs;
        result.usage.realTimeMs = waitedMs;
        result.usage.memoryKB = memoryKB;
        result.usage.exitCode = WIFEXITED(status) ? WEXITSTATUS(status) : -1;
        result.usage.signal = WIFSIGNALED(status) ? WTERMSIG(status) : 0;

        // 判断运行状态
        if (result.status == RunStatus::TLE) {
            // 已经在超时检查中设置了
            return result;
        }

        // 检查是否被信号终止
        if (WIFSIGNALED(status)) {
            int sig = WTERMSIG(status);
            if (sig == SIGXCPU) {
                // CPU 时间超限（由 setrlimit 触发）
                result.status = RunStatus::TLE;
                result.errorMessage = "CPU time limit exceeded (SIGXCPU)";
            } else if (sig == SIGKILL) {
                // 可能是内存超限或被我们杀死
                result.status = RunStatus::TLE; // 通常是 TLE
                result.errorMessage = "Killed by SIGKILL";
            } else if (sig == SIGSEGV) {
                result.status = RunStatus::RE;
                result.errorMessage = "Segmentation fault";
            } else if (sig == SIGFPE) {
                result.status = RunStatus::RE;
                result.errorMessage = "Floating point exception";
            } else if (sig == SIGABRT) {
                result.status = RunStatus::RE;
                result.errorMessage = "Aborted";
            } else {
                result.status = RunStatus::RE;
                result.errorMessage = "Terminated by signal " + std::to_string(sig);
            }
            return result;
        }

        // 检查退出码
        if (WIFEXITED(status)) {
            int exitCode = WEXITSTATUS(status);
            if (exitCode != 0) {
                result.status = RunStatus::RE;
                result.errorMessage = "Non-zero exit code: " + std::to_string(exitCode);
                return result;
            }
        }

        // 检查内存限制
        if (memoryKB > limits.memoryLimitKB) {
            result.status = RunStatus::MLE;
            result.errorMessage = "Memory limit exceeded";
            return result;
        }

        // 检查 CPU 时间限制（加一点容差）
        if (cpuTimeMs > limits.cpuTimeLimitSec * 1000 + 100) {
            result.status = RunStatus::TLE;
            result.errorMessage = "CPU time limit exceeded";
            return result;
        }

        // 一切正常
        result.status = RunStatus::OK;
        log("INFO", "Process completed successfully");

        return result;
    }

    std::string getRunCommand(const std::string &language, const std::string &sourcePath) {
        // 返回解释型语言的运行命令
        if (language == "python" || language == "python3" || language == "py") {
            return "/usr/bin/python3 " + sourcePath;
        } else if (language == "java") {
            // Java 需要特殊处理，运行 .class 文件
            // 这里简化处理，实际使用需要解析类名和路径
            log("WARN", "Java execution not fully implemented");
            return "/usr/bin/java -cp . Main";
        }

        // 编译型语言（C/C++）直接返回可执行文件路径
        return sourcePath;
    }

} // namespace judger
