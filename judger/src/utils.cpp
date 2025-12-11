#include "utils.h"
#include <ctime>
#include <fstream>
#include <iostream>
#include <sstream>
#include <sys/stat.h>
#include <unistd.h>

namespace judger {

    std::string readFile(const std::string &filepath) {
        // TODO: 实现文件读取
        // 提示：使用 ifstream，读取全部内容到 string
        std::ifstream ifs(filepath, std::ios::in | std::ios::binary);
        if (!ifs.is_open()) {
            return "";
        }
        std::stringstream ss;
        ss << ifs.rdbuf();
        std::string s = ss.str();
        ifs.close();
        return s;
    }

    bool writeFile(const std::string &filepath, const std::string &content) {
        // TODO: 实现文件写入
        // 提示：使用 ofstream
        std::ofstream ofs(filepath, std::ios::out | std::ios::binary);
        if (!ofs.is_open()) {
            return false;
        }
        ofs << content;
        ofs.close();
        return true;
    }

    std::string createTempDir() {
        // TODO: 创建临时目录
        // 提示：使用 mkdtemp() 或 /tmp/judger_XXXXXX 模板
        char temp[] = "/tmp/judger_XXXXXX";
        char *result = mkdtemp(temp);
        if (result == nullptr) {
            return "";
        }
        return std::string(result);
    }

    bool removeDir(const std::string &dirpath) {
        // TODO: 递归删除目录
        // 提示：可以使用 system("rm -rf " + dirpath) 或遍历删除
        std::string op = "rm -rf " + dirpath;
        return system(op.c_str()) == 0; // system 返回0表示成功
    }

    std::string jsonEscape(const std::string &str) {
        // TODO: 实现JSON转义
        // 提示：转义 \ " \n \r \t 等字符
        std::string result;
        for (char c : str) {
            switch (c) {
            case '\\':
                result += "\\\\";
                break;
            case '\"':
                result += "\\\"";
                break;
            case '\n':
                result += "\\n";
                break;
            case '\r':
                result += "\\r";
                break;
            case '\t':
                result += "\\t";
                break;
            default:
                result += c;
            }
        }
        return result;
    }

    void log(const std::string &level, const std::string &message) {
        // TODO: 实现日志记录
        // 提示：输出格式 [时间] [级别] 消息
        std::time_t now = std::time(nullptr);
        char timeStr[100];
        std::strftime(timeStr, sizeof(timeStr), "%Y-%m-%d %H:%M:%S", std::localtime(&now));
        std::cerr << "[" << timeStr << "] [" << level << "] " << message << std::endl;
    }

    std::string trimTrailingWhitespace(const std::string &str) {
        // TODO: 去除末尾空白
        // 提示：从后往前找到第一个非空白字符
        std::string result = str;
        while (!result.empty() && (result.back() == ' ' || result.back() == '\n' || result.back() == '\r' || result.back() == '\t')) {
            result.pop_back();
        }
        return result;
    }

} // namespace judger
