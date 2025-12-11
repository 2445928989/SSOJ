#ifndef RUNNER_H
#define RUNNER_H

#include "resource.h"
#include <string>

namespace judger {

    /**
     * @brief 运行结果状态
     */
    enum class RunStatus {
        OK,  // 正常运行
        RE,  // Runtime Error (运行时错误)
        TLE, // Time Limit Exceeded (超时)
        MLE, // Memory Limit Exceeded (内存超限)
        OLE, // Output Limit Exceeded (输出超限)
        SE   // System Error (系统错误)
    };

    /**
     * @brief 运行结果
     */
    struct RunResult {
        RunStatus status;          // 运行状态
        ResourceUsage usage;       // 资源使用情况
        std::string stdoutContent; // 标准输出内容
        std::string stderrContent; // 标准错误内容
        std::string errorMessage;  // 错误信息
    };

    /**
     * @brief 运行程序
     * @param executablePath 可执行文件路径（或解释器路径+源文件）
     * @param language 编程语言
     * @param stdinPath 标准输入文件路径
     * @param stdoutPath 标准输出文件路径
     * @param stderrPath 标准错误文件路径
     * @param limits 资源限制
     * @return 运行结果
     */
    RunResult runProgram(const std::string &executablePath,
                         const std::string &language,
                         const std::string &stdinPath,
                         const std::string &stdoutPath,
                         const std::string &stderrPath,
                         const ResourceLimit &limits);

    /**
     * @brief 在子进程中执行程序（fork后调用）
     * @param executablePath 可执行文件路径
     * @param language 语言类型
     * @param stdinPath stdin重定向路径
     * @param stdoutPath stdout重定向路径
     * @param stderrPath stderr重定向路径
     * @param limits 资源限制
     */
    void executeInChild(const std::string &executablePath,
                        const std::string &language,
                        const std::string &stdinPath,
                        const std::string &stdoutPath,
                        const std::string &stderrPath,
                        const ResourceLimit &limits);

    /**
     * @brief 父进程监控子进程执行
     * @param pid 子进程ID
     * @param limits 资源限制
     * @return 运行结果
     */
    RunResult monitorChild(pid_t pid, const ResourceLimit &limits);

    /**
     * @brief 获取运行命令（用于解释型语言）
     * @param language 语言类型
     * @param sourcePath 源文件路径
     * @return 运行命令（例如 python3 xxx.py）
     */
    std::string getRunCommand(const std::string &language, const std::string &sourcePath);

} // namespace judger

#endif // RUNNER_H
