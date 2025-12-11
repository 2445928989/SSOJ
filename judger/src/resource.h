#ifndef RESOURCE_H
#define RESOURCE_H

#include <sys/types.h>

namespace judger {

    /**
     * @brief 资源限制配置
     */
    struct ResourceLimit {
        int cpuTimeLimitSec;  // CPU时间限制（秒）
        int realTimeLimitSec; // 实际运行时间限制（秒，wallclock）
        int memoryLimitMB;    // 内存限制（MB）
        int outputLimitMB;    // 输出限制（MB）
        int stackLimitMB;     // 栈空间限制（MB）
    };

    /**
     * @brief 资源使用情况
     */
    struct ResourceUsage {
        long cpuTimeMs;  // CPU时间（毫秒）
        long realTimeMs; // 实际运行时间（毫秒）
        long memoryKB;   // 内存使用（KB）
        int exitCode;    // 退出码
        int signal;      // 收到的信号（如果被信号终止）
    };

    /**
     * @brief 为子进程设置资源限制（使用 setrlimit）
     * @param limits 资源限制配置
     * @return 成功返回true
     */
    bool setResourceLimits(const ResourceLimit &limits);

    /**
     * @brief 使用 cgroup 设置资源限制（更精确）
     * @param pid 进程ID
     * @param limits 资源限制配置
     * @return 成功返回true
     */
    bool setCgroupLimits(pid_t pid, const ResourceLimit &limits);

    /**
     * @brief 获取进程资源使用情况
     * @param pid 进程ID
     * @return 资源使用情况
     */
    ResourceUsage getResourceUsage(pid_t pid);

    /**
     * @brief 清理 cgroup（如果使用）
     * @param pid 进程ID
     */
    void cleanupCgroup(pid_t pid);

} // namespace judger

#endif // RESOURCE_H
