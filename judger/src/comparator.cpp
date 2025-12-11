#include "comparator.h"
#include "utils.h"
#include <algorithm>
#include <cctype>

namespace judger {

    CompareResult compareOutput(const std::string &userOutput,
                                const std::string &expectedOutput,
                                CompareMode mode) {
        // TODO: 根据模式选择比对方法

        CompareResult result;
        result.accepted = false;

        switch (mode) {
        case CompareMode::EXACT:
            result.accepted = exactCompare(userOutput, expectedOutput);
            break;
        case CompareMode::IGNORE_TRAILING:
            result.accepted = ignoreTrailingCompare(userOutput, expectedOutput);
            break;
        }

        if (!result.accepted) {
            result.message = "Output mismatch: ";
            bool ok = 0;
            for (int i = 0; i < std::max(userOutput.size(), expectedOutput.size()); i++) {
                if (i >= userOutput.size()) {
                    result.message += "Position " + std::to_string(i + 1) + ": Expected \"" + expectedOutput[i] + "\", Received \"null\"";
                    ok = 1;
                    break;
                } else if (i >= expectedOutput.size()) {
                    result.message += "Position " + std::to_string(i + 1) + ": Expected \"null\", Received \"" + userOutput[i] + "\"";
                    ok = 1;
                    break;
                } else if (userOutput[i] != expectedOutput[i]) {
                    result.message += "Position " + std::to_string(i + 1) + ": Expected \"" + expectedOutput[i] + "\", Received \"" + userOutput[i] + "\"";
                    ok = 1;
                    break;
                }
            }
            if (!ok)
                result.message += "Unkown Error";
        }
        return result;
    }

    bool exactCompare(const std::string &a, const std::string &b) {
        // TODO: 实现精确比对
        return a == b;
    }

    bool ignoreTrailingCompare(const std::string &a, const std::string &b) {
        // TODO: 忽略末尾空白比对
        // 提示：使用 trimTrailingWhitespace 处理后比较

        std::string trimmedA = trimTrailingWhitespace(a);
        std::string trimmedB = trimTrailingWhitespace(b);

        return trimmedA == trimmedB;
    }

    bool runSpecialJudge(const std::string &userOutputPath,
                         const std::string &expectedOutputPath,
                         const std::string &inputPath,
                         const std::string &spjExecutable) {
        // TODO: 运行 Special Judge 程序
        // 这是高级功能，可选实现
        // SPJ 通常接收三个参数：输入文件、用户输出、标准答案
        // 返回 0 表示 AC，非 0 表示 WA

        log("INFO", "Special Judge not implemented yet");
        return false;
    }

} // namespace judger
