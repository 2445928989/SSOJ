/**
 * @file test_utils.cpp
 * @brief utils 模块的单元测试
 *
 * 编译方法：
 * g++ -std=c++17 -I../src test_utils.cpp ../src/utils.cpp -o test_utils
 *
 * 运行：
 * ./test_utils
 */

#include "../src/utils.h"
#include <cassert>
#include <cstring>
#include <iostream>

using namespace std;
using namespace judger;

// 简单的测试框架宏
#define TEST(name) void test_##name()
#define RUN_TEST(name)                                \
    do {                                              \
        cout << "Running test: " << #name << " ... "; \
        test_##name();                                \
        cout << "PASSED" << endl;                     \
    } while (0)

// ========== 测试用例 ==========

TEST(readFile) {
    // 先创建一个测试文件
    writeFile("/tmp/test_read.txt", "Hello World");

    string content = readFile("/tmp/test_read.txt");
    assert(content == "Hello World");

    // 测试不存在的文件
    string empty = readFile("/tmp/nonexistent_file_xyz.txt");
    assert(empty == "");
}

TEST(writeFile) {
    bool success = writeFile("/tmp/test_write.txt", "Test Content");
    assert(success == true);

    // 验证写入的内容
    string content = readFile("/tmp/test_write.txt");
    assert(content == "Test Content");
}

TEST(jsonEscape) {
    // 测试特殊字符转义
    assert(jsonEscape("hello") == "hello");
    assert(jsonEscape("hello\nworld") == "hello\\nworld");
    assert(jsonEscape("quote\"here") == "quote\\\"here");
    assert(jsonEscape("backslash\\here") == "backslash\\\\here");
    assert(jsonEscape("tab\there") == "tab\\there");
}

TEST(trimTrailingWhitespace) {
    assert(trimTrailingWhitespace("hello") == "hello");
    assert(trimTrailingWhitespace("hello\n") == "hello");
    assert(trimTrailingWhitespace("hello\r\n") == "hello");
    assert(trimTrailingWhitespace("hello   \n\n") == "hello");
    assert(trimTrailingWhitespace("  hello  ") == "  hello"); // 只去除末尾
}

TEST(createTempDir) {
    string dir = createTempDir();
    assert(!dir.empty());
    cout << "\n  Created temp dir: " << dir << " ";

    // 验证目录存在
    // 可以尝试在里面创建文件
    bool success = writeFile(dir + "/test.txt", "content");
    assert(success == true);
}

TEST(removeDir) {
    // 创建临时目录
    string dir = createTempDir();
    writeFile(dir + "/file1.txt", "content1");
    writeFile(dir + "/file2.txt", "content2");

    // 删除目录
    bool success = removeDir(dir);
    assert(success == true);

    // 验证目录不存在
    string content = readFile(dir + "/file1.txt");
    assert(content == ""); // 文件应该读不到
}

// ========== 主函数 ==========

int main() {
    cout << "==================================" << endl;
    cout << "  Utils Module Unit Tests" << endl;
    cout << "==================================" << endl;

    try {
        RUN_TEST(jsonEscape);
        RUN_TEST(trimTrailingWhitespace);
        RUN_TEST(writeFile);
        RUN_TEST(readFile);
        RUN_TEST(createTempDir);
        RUN_TEST(removeDir);

        cout << "\n==================================" << endl;
        cout << "  All tests PASSED! ✓" << endl;
        cout << "==================================" << endl;
        return 0;
    } catch (const exception &e) {
        cout << "\n✗ FAILED: " << e.what() << endl;
        return 1;
    } catch (...) {
        cout << "\n✗ FAILED: Unknown error" << endl;
        return 1;
    }
}
