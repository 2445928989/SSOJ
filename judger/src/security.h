#ifndef SECURITY_H
#define SECURITY_H

#include <string>
#include <vector>

namespace judger {

    /**
     * @brief 应用 seccomp 沙箱策略
     * @param language 编程语言（不同语言需要不同的系统调用）
     * @return 成功返回true
     */
    bool applySeccompFilter(const std::string &language);

    /**
     * @brief 加载系统调用白名单
     * @param configPath 配置文件路径
     * @return 允许的系统调用列表
     */
    std::vector<int> loadSyscallWhitelist(const std::string &configPath);

    /**
     * @brief 使用 ptrace 监控进程（可选的高级功能）
     * @param pid 要监控的进程ID
     * @return 成功返回true
     */
    bool attachPtrace(int pid);

    /**
     * @brief 设置安全执行环境
     * 包括：chroot、降低权限、禁用网络等
     * @param workDir 工作目录
     * @return 成功返回true
     */
    bool setupSecureEnvironment(const std::string &workDir);

} // namespace judger

#endif // SECURITY_H
