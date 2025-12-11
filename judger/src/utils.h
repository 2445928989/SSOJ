#ifndef UTILS_H
#define UTILS_H

#include <string>
#include <vector>

namespace judger {

    /**
     * @brief 从文件读取全部内容
     * @param filepath 文件路径
     * @return 文件内容字符串，失败返回空字符串
     */
    std::string readFile(const std::string &filepath);

    /**
     * @brief 将内容写入文件
     * @param filepath 文件路径
     * @param content 要写入的内容
     * @return 成功返回true，失败返回false
     */
    bool writeFile(const std::string &filepath, const std::string &content);

    /**
     * @brief 创建临时目录
     * @return 临时目录路径，失败返回空字符串
     */
    std::string createTempDir();

    /**
     * @brief 删除目录及其内容
     * @param dirpath 目录路径
     * @return 成功返回true
     */
    bool removeDir(const std::string &dirpath);

    /**
     * @brief JSON字符串转义（用于输出）
     * @param str 原始字符串
     * @return 转义后的字符串
     */
    std::string jsonEscape(const std::string &str);

    /**
     * @brief 记录日志
     * @param level 日志级别 (INFO/WARN/ERROR)
     * @param message 日志消息
     */
    void log(const std::string &level, const std::string &message);

    /**
     * @brief 去除字符串末尾的空白字符
     * @param str 原始字符串
     * @return 处理后的字符串
     */
    std::string trimTrailingWhitespace(const std::string &str);

} // namespace judger

#endif // UTILS_H
