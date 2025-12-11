#ifndef COMPARATOR_H
#define COMPARATOR_H

#include <string>

namespace judger {

    /**
     * @brief 比对模式
     */
    enum class CompareMode {
        EXACT,           // 精确匹配
        IGNORE_TRAILING, // 忽略末尾空白
    };

    /**
     * @brief 比对结果
     */
    struct CompareResult {
        bool accepted;       // 是否通过
        std::string message; // 差异信息（如果不通过）
    };

    /**
     * @brief 比对输出
     * @param userOutput 用户程序输出
     * @param expectedOutput 期望输出
     * @param mode 比对模式
     * @return 比对结果
     */
    CompareResult compareOutput(const std::string &userOutput,
                                const std::string &expectedOutput,
                                CompareMode mode = CompareMode::IGNORE_TRAILING);

    /**
     * @brief 精确比对（逐字符）
     */
    bool exactCompare(const std::string &a, const std::string &b);

    /**
     * @brief 忽略末尾空白比对
     */
    bool ignoreTrailingCompare(const std::string &a, const std::string &b);

    /**
     * @brief 使用 Special Judge（可选高级功能）
     * @param userOutputPath 用户输出文件路径
     * @param expectedOutputPath 期望输出文件路径
     * @param inputPath 输入文件路径
     * @param spjExecutable Special Judge 程序路径
     * @return 是否通过
     */
    bool runSpecialJudge(const std::string &userOutputPath,
                         const std::string &expectedOutputPath,
                         const std::string &inputPath,
                         const std::string &spjExecutable);

} // namespace judger

#endif // COMPARATOR_H
