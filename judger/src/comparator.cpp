#include "comparator.h"
#include "utils.h"
#include <algorithm>
#include <cctype>
#include <sstream>
#include <vector>

namespace judger {

    std::string normalizeLineEndings(const std::string &str) {
        std::string result;
        result.reserve(str.size());
        for (size_t i = 0; i < str.size(); ++i) {
            if (str[i] == '\r') {
                if (i + 1 < str.size() && str[i + 1] == '\n') {
                    // Skip \r in \r\n
                    continue;
                } else {
                    // Treat lone \r as \n
                    result += '\n';
                }
            } else {
                result += str[i];
            }
        }
        return result;
    }

    CompareResult compareOutput(const std::string &userOutput,
                                const std::string &expectedOutput,
                                CompareMode mode) {
        // 预处理：统一换行符
        std::string normUser = normalizeLineEndings(userOutput);
        std::string normExpected = normalizeLineEndings(expectedOutput);

        CompareResult result;
        result.accepted = false;

        switch (mode) {
        case CompareMode::EXACT:
            result.accepted = exactCompare(normUser, normExpected);
            break;
        case CompareMode::IGNORE_TRAILING:
            result.accepted = ignoreTrailingCompare(normUser, normExpected);
            break;
        }

        if (!result.accepted) {
            result.message = "Output mismatch: ";
            bool ok = 0;
            for (int i = 0; i < std::max(normUser.size(), normExpected.size()); i++) {
                if (i >= normUser.size()) {
                    result.message += "Position " + std::to_string(i + 1) + ": Expected ASCII " + std::to_string((int)normExpected[i]) + ", Received EOF";
                    ok = 1;
                    break;
                } else if (i >= normExpected.size()) {
                    result.message += "Position " + std::to_string(i + 1) + ": Expected EOF, Received ASCII " + std::to_string((int)normUser[i]);
                    ok = 1;
                    break;
                } else if (normUser[i] != normExpected[i]) {
                    result.message += "Position " + std::to_string(i + 1) + ": Expected ASCII " + std::to_string((int)normExpected[i]) + ", Received ASCII " + std::to_string((int)normUser[i]);
                    ok = 1;
                    break;
                }
            }
            if (!ok)
                result.message += "Unknown Error";
        }
        return result;
    }

    bool exactCompare(const std::string &a, const std::string &b) {
        // 已经在 compareOutput 中进行了 normalizeLineEndings
        return a == b;
    }

    bool ignoreTrailingCompare(const std::string &a, const std::string &b) {
        // 逐行忽略末尾空白
        std::vector<std::string> linesA, linesB;
        std::string line;

        std::stringstream ssA(a);
        while (std::getline(ssA, line)) {
            linesA.push_back(trimTrailingWhitespace(line));
        }

        std::stringstream ssB(b);
        while (std::getline(ssB, line)) {
            linesB.push_back(trimTrailingWhitespace(line));
        }

        // 忽略末尾的空行
        while (!linesA.empty() && linesA.back().empty())
            linesA.pop_back();
        while (!linesB.empty() && linesB.back().empty())
            linesB.pop_back();

        if (linesA.size() != linesB.size())
            return false;
        for (size_t i = 0; i < linesA.size(); ++i) {
            if (linesA[i] != linesB[i])
                return false;
        }
        return true;
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
