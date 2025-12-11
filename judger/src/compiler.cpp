#include "compiler.h"
#include "utils.h"
#include <cstdlib>
#include <fstream>

namespace judger {

    CompileResult compile(const std::string &sourcePath,
                          const std::string &language,
                          const std::string &outputPath) {
        // TODO: 实现编译逻辑
        // 1. 根据语言获取编译命令
        // 2. 执行编译
        // 3. 返回结果

        CompileResult result;
        result.success = false;
        result.executablePath = outputPath;

        // C/C++ 需要编译
        if (language == "c" || language == "cpp" || language == "c++") {
            std::string command = getCompileCommand(language, sourcePath, outputPath);
            if (command.empty()) {
                result.message = "Failed to generate compile command";
                return result;
            }

            // 执行编译
            std::string compilerOutput;
            bool success = executeCompile(command, compilerOutput);

            result.success = success;
            result.message = compilerOutput;

            if (success) {
                log("INFO", "Compilation successful: " + sourcePath);
            } else {
                log("ERROR", "Compilation failed: " + sourcePath);
            }
        }
        // Python 不需要编译，直接返回源文件路径
        else if (language == "python" || language == "python3" || language == "py") {
            result.success = true;
            result.executablePath = sourcePath; // Python 直接用源文件
            result.message = "Python does not require compilation";
            log("INFO", "Python script, no compilation needed");
        }
        // Java 暂不支持（可以后续添加）
        else if (language == "java") {
            result.success = false;
            result.message = "Java is not supported yet";
            log("WARN", "Java compilation not implemented");
        }
        // 不支持的语言
        else {
            result.success = false;
            result.message = "Unknown language: " + language;
            log("ERROR", "Unknown language: " + language);
        }

        return result;
    }

    std::string getCompileCommand(const std::string &language,
                                  const std::string &sourcePath,
                                  const std::string &outputPath) {
        // TODO: 根据语言返回编译命令
        // 示例：
        // - cpp: "g++ -O2 -std=c++17 -o " + outputPath + " " + sourcePath
        // - c: "gcc -O2 -std=c11 -o " + outputPath + " " + sourcePath
        // - java: "javac " + sourcePath

        if (language == "cpp" || language == "c++") {
            return "g++ -O2 -std=c++17 -o " + outputPath + " " + sourcePath + " 2>&1";
        } else if (language == "c") {
            return "gcc -O2 -std=c11 -o " + outputPath + " " + sourcePath + " 2>&1";
        }

        return "";
    }

    bool executeCompile(const std::string &command, std::string &compilerOutput) {
        // TODO: 执行编译命令并捕获输出
        // 提示：使用 popen() 或重定向 stderr 到文件

        // 使用 popen 执行命令并捕获输出（包括 stderr，因为命令中有 2>&1）
        FILE *pipe = popen(command.c_str(), "r");
        if (!pipe) {
            compilerOutput = "Failed to execute compile command";
            return false;
        }

        // 读取所有输出
        char buffer[256];
        compilerOutput.clear();
        while (fgets(buffer, sizeof(buffer), pipe) != nullptr) {
            compilerOutput += buffer;
        }

        // 获取命令退出状态
        int status = pclose(pipe);

        // status 为 0 表示编译成功
        return (status == 0);
    }

} // namespace judger
