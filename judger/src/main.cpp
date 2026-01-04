#include "comparator.h"
#include "compiler.h"
#include "runner.h"
#include "utils.h"
#include <cstring>
#include <iostream>
#include <sstream>

using namespace judger;

/**
 * @brief 判题结果
 */
struct JudgeResult {
    std::string status;       // AC/WA/TLE/MLE/RE/CE/SE
    long timeMs;              // 运行时间（毫秒）
    long memoryKB;            // 内存使用（KB）
    std::string compilerMsg;  // 编译信息
    std::string errorMsg;     // 错误信息
    std::string actualOutput; // 实际输出
};

/**
 * @brief 输出 JSON 格式结果
 */
void outputJson(const JudgeResult &result, const std::string &exePath = "") {
    std::cout << "{";
    std::cout << "\"status\":\"" << result.status << "\",";
    std::cout << "\"time_ms\":" << result.timeMs << ",";
    std::cout << "\"memory_kb\":" << result.memoryKB << ",";
    std::cout << "\"compiler_message\":\"" << jsonEscape(result.compilerMsg) << "\",";
    std::cout << "\"error_message\":\"" << jsonEscape(result.errorMsg) << "\",";
    std::cout << "\"actual_output\":\"" << jsonEscape(result.actualOutput) << "\"";
    if (!exePath.empty()) {
        std::cout << ",\"executable_path\":\"" << jsonEscape(exePath) << "\"";
    }
    std::cout << "}" << std::endl;
}

/**
 * @brief 主判题流程
 */
JudgeResult judge(const std::string &sourcePath,
                  const std::string &language,
                  const std::string &inputPath,
                  const std::string &expectedOutputPath,
                  const ResourceLimit &limits,
                  const std::string &providedExePath = "") {
    JudgeResult result;
    result.status = "SE";
    result.timeMs = 0;
    result.memoryKB = 0;

    // 1. 创建临时工作目录
    std::string workDir = createTempDir();
    if (workDir.empty()) {
        result.errorMsg = "Failed to create temp directory";
        return result;
    }

    std::string executablePath;
    if (providedExePath.empty()) {
        // 2. 编译
        executablePath = workDir + "/executable";
        CompileResult compileResult = compile(sourcePath, language, executablePath);

        if (!compileResult.success) {
            result.status = "CE";
            result.compilerMsg = compileResult.message;
            removeDir(workDir);
            return result;
        }
    } else {
        executablePath = providedExePath;
    }

    // 3. 运行程序
    std::string stdoutPath = workDir + "/stdout.txt";
    std::string stderrPath = workDir + "/stderr.txt";

    RunResult runResult = runProgram(
        executablePath,
        language,
        inputPath,
        stdoutPath,
        stderrPath,
        limits);

    // 4. 判断运行状态
    switch (runResult.status) {
    case RunStatus::TLE:
        result.status = "TLE";
        break;
    case RunStatus::MLE:
        result.status = "MLE";
        break;
    case RunStatus::RE:
        result.status = "RE";
        result.errorMsg = runResult.errorMessage;
        break;
    case RunStatus::SE:
        result.status = "SE";
        result.errorMsg = runResult.errorMessage;
        break;
    case RunStatus::OK:
        // 继续比对输出
        break;
    default:
        result.status = "SE";
    }

    // 5. 比对输出（如果运行正常）
    if (runResult.status == RunStatus::OK) {
        std::string expectedOutput = readFile(expectedOutputPath);
        CompareResult cmpResult = compareOutput(
            runResult.stdoutContent,
            expectedOutput,
            CompareMode::IGNORE_TRAILING);

        if (cmpResult.accepted) {
            result.status = "AC";
        } else {
            result.status = "WA";
            result.errorMsg = cmpResult.message;
        }
    }

    // 6. 记录资源使用
    result.timeMs = runResult.usage.cpuTimeMs;
    result.memoryKB = runResult.usage.memoryKB;

    // 记录实际输出（截断前1000字符）
    if (runResult.stdoutContent.length() > 1000) {
        result.actualOutput = runResult.stdoutContent.substr(0, 1000) + "... [truncated]";
    } else {
        result.actualOutput = runResult.stdoutContent;
    }

    // 7. 清理临时目录
    removeDir(workDir);

    return result;
}

/**
 * @brief 解析命令行参数
 */
int main(int argc, char *argv[]) {
    // 格式：judger --src source.cpp --lang cpp --input input.txt --output output.txt --time 1 --mem 256
    // 新增：--exe <path> 跳过编译
    // 新增：--compile-only 只编译

    std::string sourcePath, language, inputPath, outputPath, exePath;
    bool compileOnly = false;
    double timeLimit = 1.0;
    int memLimit = 262144; // 256MB = 262144KB

    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--src") == 0 && i + 1 < argc) {
            sourcePath = argv[++i];
        } else if (strcmp(argv[i], "--lang") == 0 && i + 1 < argc) {
            language = argv[++i];
        } else if (strcmp(argv[i], "--input") == 0 && i + 1 < argc) {
            inputPath = argv[++i];
        } else if (strcmp(argv[i], "--output") == 0 && i + 1 < argc) {
            outputPath = argv[++i];
        } else if (strcmp(argv[i], "--time") == 0 && i + 1 < argc) {
            timeLimit = std::atof(argv[++i]);
        } else if (strcmp(argv[i], "--mem") == 0 && i + 1 < argc) {
            memLimit = std::atoi(argv[++i]);
        } else if (strcmp(argv[i], "--exe") == 0 && i + 1 < argc) {
            exePath = argv[++i];
        } else if (strcmp(argv[i], "--compile-only") == 0) {
            compileOnly = true;
        }
    }

    // 验证参数
    if (language.empty() || (sourcePath.empty() && exePath.empty())) {
        std::cerr << "Usage: judger --src <source> --lang <language> [--input <input> --output <expected_output>] [--time <sec>] [--mem <KB>] [--exe <executable>] [--compile-only]" << std::endl;
        return 1;
    }

    // 设置资源限制
    ResourceLimit limits;
    limits.cpuTimeLimitSec = timeLimit;
    limits.realTimeLimitSec = timeLimit + 2.0;
    limits.memoryLimitKB = memLimit;
    limits.outputLimitKB = 32768; // 32MB
    limits.stackLimitKB = 131072; // 128MB

    if (compileOnly) {
        // 只编译
        std::string workDir = createTempDir();
        std::string targetExe = workDir + "/executable";
        CompileResult cr = compile(sourcePath, language, targetExe);
        JudgeResult jr;
        if (cr.success) {
            jr.status = "OK";
            outputJson(jr, targetExe);
        } else {
            jr.status = "CE";
            jr.compilerMsg = cr.message;
            outputJson(jr);
            removeDir(workDir);
        }
        return 0;
    }

    // 执行判题
    JudgeResult result = judge(sourcePath, language, inputPath, outputPath, limits, exePath);

    // 输出结果
    outputJson(result);

    return 0;
}
