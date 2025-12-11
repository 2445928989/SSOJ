/**
 * @file test_compiler.cpp
 * @brief compiler 模块的单元测试
 *
 * 编译方法：
 * g++ -std=c++17 -I../src test_compiler.cpp ../src/compiler.cpp ../src/utils.cpp -o test_compiler
 *
 * 运行：
 * ./test_compiler
 */

#include "../src/compiler.h"
#include "../src/utils.h"
#include <cassert>
#include <iostream>

using namespace std;
using namespace judger;

#define TEST(name) void test_##name()
#define RUN_TEST(name)                                \
    do {                                              \
        cout << "Running test: " << #name << " ... "; \
        test_##name();                                \
        cout << "PASSED" << endl;                     \
    } while (0)

// ========== 测试用例 ==========

TEST(getCompileCommand) {
    string cmd_cpp = getCompileCommand("cpp", "test.cpp", "test");
    cout << "\n  C++ command: " << cmd_cpp << " ";
    assert(cmd_cpp.find("g++") != string::npos);
    assert(cmd_cpp.find("test.cpp") != string::npos);

    string cmd_c = getCompileCommand("c", "test.c", "test");
    cout << "\n  C command: " << cmd_c << " ";
    assert(cmd_c.find("gcc") != string::npos);
}

TEST(compile_cpp_success) {
    // 创建一个正确的 C++ 程序
    string source = R"(
        #include <iostream>
        int main() {
            std::cout << "Hello" << std::endl;
            return 0;
        }
    )";

    writeFile("/tmp/test_success.cpp", source);

    CompileResult result = compile("/tmp/test_success.cpp", "cpp", "/tmp/test_success");

    cout << "\n  Compiler message: " << result.message << " ";
    assert(result.success == true);
    assert(result.executablePath == "/tmp/test_success");
}

TEST(compile_cpp_error) {
    // 创建一个有语法错误的程序
    string source = R"(
        #include <iostream>
        int main() {
            std::cout << "Missing semicolon"
            return 0;
        }
    )";

    writeFile("/tmp/test_error.cpp", source);

    CompileResult result = compile("/tmp/test_error.cpp", "cpp", "/tmp/test_error");

    cout << "\n  Compiler error: " << result.message.substr(0, 50) << "... ";
    assert(result.success == false);
    assert(!result.message.empty()); // 应该有错误信息
}

TEST(compile_c_success) {
    string source = R"(
        #include <stdio.h>
        int main() {
            printf("Hello\n");
            return 0;
        }
    )";

    writeFile("/tmp/test_c.c", source);

    CompileResult result = compile("/tmp/test_c.c", "c", "/tmp/test_c");

    assert(result.success == true);
}

// ========== 主函数 ==========

int main() {
    cout << "==================================" << endl;
    cout << "  Compiler Module Unit Tests" << endl;
    cout << "==================================" << endl;

    try {
        RUN_TEST(getCompileCommand);
        RUN_TEST(compile_cpp_success);
        RUN_TEST(compile_cpp_error);
        RUN_TEST(compile_c_success);

        cout << "\n==================================" << endl;
        cout << "  All tests PASSED! ✓" << endl;
        cout << "==================================" << endl;
        return 0;
    } catch (const exception &e) {
        cout << "\n✗ FAILED: " << e.what() << endl;
        return 1;
    }
}
