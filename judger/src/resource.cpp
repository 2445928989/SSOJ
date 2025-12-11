#include "resource.h"
#include "utils.h"
#include <sys/resource.h>
#include <sys/wait.h>
#include <unistd.h>

namespace judger {

    bool setResourceLimits(const ResourceLimit &limits) {
        // 使用 setrlimit 设置资源限制
        // 需要设置的限制：
        // - RLIMIT_CPU: CPU时间（秒）
        // - RLIMIT_AS: 地址空间（内存，字节）
        // - RLIMIT_STACK: 栈大小（字节）
        // - RLIMIT_FSIZE: 文件大小（输出限制，字节）

        struct rlimit rl;

        // 1. CPU时间限制（秒）
        rl.rlim_cur = rl.rlim_max = limits.cpuTimeLimitSec;
        if (setrlimit(RLIMIT_CPU, &rl) != 0) {
            log("ERROR", "Failed to set RLIMIT_CPU");
            return false;
        }

        // 2. 地址空间限制（内存，需要转换 KB -> 字节）
        rl.rlim_cur = rl.rlim_max = (rlim_t)limits.memoryLimitKB * 1024;
        if (setrlimit(RLIMIT_AS, &rl) != 0) {
            log("WARN", "Failed to set RLIMIT_AS (may not be critical)");
            // 某些系统可能失败，不是致命错误
        }

        // 3. 栈大小限制（KB -> 字节）
        rl.rlim_cur = rl.rlim_max = (rlim_t)limits.stackLimitKB * 1024;
        if (setrlimit(RLIMIT_STACK, &rl) != 0) {
            log("WARN", "Failed to set RLIMIT_STACK");
        }

        // 4. 输出文件大小限制（KB -> 字节）
        rl.rlim_cur = rl.rlim_max = (rlim_t)limits.outputLimitKB * 1024;
        if (setrlimit(RLIMIT_FSIZE, &rl) != 0) {
            log("WARN", "Failed to set RLIMIT_FSIZE");
        }

        return true;
    }

    bool setCgroupLimits(pid_t pid, const ResourceLimit &limits) {
        // TODO: 使用 cgroup v2 设置更精确的资源限制
        // 这是可选的高级功能，可以先跳过
        // 提示：需要写入 /sys/fs/cgroup/... 下的文件

        return false;
    }

    ResourceUsage getResourceUsage(pid_t pid) {
        // 获取进程资源使用情况
        // 注意：这个函数通常不需要单独调用
        // 因为 runner.cpp 中的 monitorChild 已经使用 wait4 获取了 rusage

        ResourceUsage usage;
        usage.cpuTimeMs = 0;
        usage.realTimeMs = 0;
        usage.memoryKB = 0;
        usage.exitCode = -1;
        usage.signal = 0;

        int status;
        struct rusage ru;

        // 使用 wait4 等待进程并获取资源使用
        // 注意：这会阻塞直到进程结束
        pid_t result = wait4(pid, &status, 0, &ru);

        if (result == pid) {
            // 计算 CPU 时间（用户态 + 系统态）
            // timeval 的 tv_sec 是秒，tv_usec 是微秒
            long cpuMs = (ru.ru_utime.tv_sec + ru.ru_stime.tv_sec) * 1000 +
                         (ru.ru_utime.tv_usec + ru.ru_stime.tv_usec) / 1000;
            usage.cpuTimeMs = cpuMs;

            // 最大内存使用（ru_maxrss 在 Linux 上单位是 KB）
            usage.memoryKB = ru.ru_maxrss;

            // 退出状态
            if (WIFEXITED(status)) {
                usage.exitCode = WEXITSTATUS(status);
            }
            if (WIFSIGNALED(status)) {
                usage.signal = WTERMSIG(status);
            }
        }

        return usage;
    }

    void cleanupCgroup(pid_t pid) {
        // TODO: 清理 cgroup 资源
        // 如果使用了 cgroup，需要删除创建的 cgroup 目录
    }

} // namespace judger
