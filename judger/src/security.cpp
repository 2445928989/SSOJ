#include "security.h"
#include "utils.h"
// #include <seccomp.h>  // 暂时注释掉，需要安装 libseccomp-dev
#include <sys/ptrace.h>
#include <unistd.h>

namespace judger {

    bool applySeccompFilter(const std::string &language) {
        // TODO: 应用 seccomp 过滤器
        // 这是高级功能，可以先返回 true 跳过
        //
        // 实现提示：
        // 1. 创建 seccomp context: scmp_filter_ctx ctx = seccomp_init(SCMP_ACT_KILL);
        // 2. 添加允许的系统调用：seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(read), 0);
        // 3. 加载过滤器：seccomp_load(ctx);
        //
        // 常见允许的系统调用：
        // - read, write, open, close, fstat, mmap, munmap, brk
        // - exit_group, exit
        //
        // 需要禁止的系统调用：
        // - socket, connect, bind（网络相关）
        // - fork, clone, execve（进程创建）
        // - kill（信号）

        log("INFO", "Seccomp filter not implemented yet");
        return true;
    }

    std::vector<int> loadSyscallWhitelist(const std::string &configPath) {
        // TODO: 从 JSON 配置文件加载系统调用白名单
        // 提示：解析 config/syscall_whitelist.json

        std::vector<int> whitelist;
        return whitelist;
    }

    bool attachPtrace(int pid) {
        // TODO: 使用 ptrace 附加到进程
        // 这是可选的高级功能，用于监控系统调用

        return false;
    }

    bool setupSecureEnvironment(const std::string &workDir) {
        // TODO: 设置安全执行环境
        // 可选操作：
        // 1. chroot(workDir.c_str()) - 限制文件系统访问
        // 2. setuid/setgid - 降低权限到普通用户
        // 3. 禁用网络

        log("INFO", "Secure environment setup not implemented yet");
        return true;
    }

} // namespace judger
