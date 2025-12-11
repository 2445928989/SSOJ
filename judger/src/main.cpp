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
    std::string status;      // AC/WA/TLE/MLE/RE/CE/SE
    long timeMs;             // 运行时间（毫秒）
    long memoryKB;           // 内存使用（KB）
    std::string compilerMsg; // 编译信息
    std::string errorMsg;    // 错误信息
};

/**
 * @brief 输出 JSON 格式结果
 */
void outputJson(const JudgeResult &result) {
    std::cout << "{";
    std::cout << "\"status\":\"" << result.status << "\",";
    std::cout << "\"time_ms\":" << result.timeMs << ",";
    std::cout << "\"memory_kb\":" << result.memoryKB << ",";
    std::cout << "\"compiler_message\":\"" << jsonEscape(result.compilerMsg) << "\",";
    std::cout << "\"error_message\":\"" << jsonEscape(result.errorMsg) << "\"";
    std::cout << "}" << std::endl;
}

/**
 * @brief 主判题流程
 */
JudgeResult judge(const std::string &sourcePath,
                  const std::string &language,
                  const std::string &inputPath,
                  const std::string &expectedOutputPath,
                  const ResourceLimit &limits) {
    JudgeResult result;
    result.status = "SE";
    result.timeMs = 0;
    result.memoryKB = 0;

    // TODO: 实现完整判题流程
    // 1. 创建临时工作目录
    std::string workDir = createTempDir();
    if (workDir.empty()) {
        result.errorMsg = "Failed to create temp directory";
        return result;
    }

    // 2. 编译（如果需要）
    std::string executablePath = workDir + "/executable";
    CompileResult compileResult = compile(sourcePath, language, executablePath);

    if (!compileResult.success) {
        result.status = "CE";
        result.compilerMsg = compileResult.message;
        removeDir(workDir);
        return result;
    }

    // 3. 运行程序
    std::string stdoutPath = workDir + "/stdout.txt";
    std::string stderrPath = workDir + "/stderr.txt";

    RunResult runResult = runProgram(
        compileResult.executablePath,
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

    // 7. 清理临时目录
    removeDir(workDir);

    return result;
}

/**
 * @brief 解析命令行参数
 */
int main(int argc, char *argv[]) {
    // TODO: 解析命令行参数
    // 格式：judger --src source.cpp --lang cpp --input input.txt --output output.txt --time 1 --mem 256

    std::string sourcePath, language, inputPath, outputPath;
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
        }
    }

    // 验证参数
    if (sourcePath.empty() || language.empty() || inputPath.empty() || outputPath.empty()) {
        std::cerr << "Usage: judger --src <source> --lang <language> --input <input> --output <expected_output> [--time <sec>] [--mem <KB>]" << std::endl;
        return 1;
    }

    // 设置资源限制
    ResourceLimit limits;
    limits.cpuTimeLimitSec = timeLimit;
    limits.realTimeLimitSec = timeLimit + 2.0;
    limits.memoryLimitKB = memLimit;
    limits.outputLimitKB = 32768; // 32MB
    limits.stackLimitKB = 131072; // 128MB

    // 执行判题
    JudgeResult result = judge(sourcePath, language, inputPath, outputPath, limits);

    // 输出结果
    outputJson(result);

    return 0;
}
