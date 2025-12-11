#ifndef COMPILER_H
#define COMPILER_H

#include <string>

namespace judger {

    /**
     * @brief 编译结果结构体
     */
    struct CompileResult {
        bool success;               // 是否编译成功
        std::string message;        // 编译器输出信息（错误或警告）
        std::string executablePath; // 生成的可执行文件路径
    };

    /**
     * @brief 编译源代码
     * @param sourcePath 源代码文件路径
     * @param language 编程语言 (cpp, c, python, java)
     * @param outputPath 输出可执行文件路径（对于编译型语言）
     * @return 编译结果
     */
    CompileResult compile(const std::string &sourcePath,
                          const std::string &language,
                          const std::string &outputPath);

    /**
     * @brief 获取编译命令（根据语言配置）
     * @param language 编程语言
     * @param sourcePath 源文件路径
     * @param outputPath 输出文件路径
     * @return 编译命令字符串
     */
    std::string getCompileCommand(const std::string &language,
                                  const std::string &sourcePath,
                                  const std::string &outputPath);

    /**
     * @brief 执行编译命令并捕获输出
     * @param command 编译命令
     * @param compilerOutput 编译器输出（通过引用返回）
     * @return 编译是否成功
     */
    bool executeCompile(const std::string &command, std::string &compilerOutput);

} // namespace judger

#endif // COMPILER_H
