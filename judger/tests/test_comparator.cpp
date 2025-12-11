/**
 * @file test_comparator.cpp
 * @brief comparator 模块的单元测试
 *
 * 编译方法：
 * g++ -std=c++17 -I../src test_comparator.cpp ../src/comparator.cpp ../src/utils.cpp -o test_comparator
 *
 * 运行：
 * ./test_comparator
 */

#include "../src/comparator.h"
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

TEST(exactCompare) {
    assert(exactCompare("hello", "hello") == true);
    assert(exactCompare("hello", "world") == false);
    assert(exactCompare("hello\n", "hello") == false);
}

TEST(ignoreTrailingCompare) {
    assert(ignoreTrailingCompare("hello", "hello") == true);
    assert(ignoreTrailingCompare("hello\n", "hello") == true);
    assert(ignoreTrailingCompare("hello\r\n", "hello") == true);
    assert(ignoreTrailingCompare("hello  \n", "hello") == true);
    assert(ignoreTrailingCompare("hello\n", "world\n") == false);
}

TEST(compareOutput_exact) {
    CompareResult result = compareOutput("hello", "hello", CompareMode::EXACT);
    assert(result.accepted == true);

    result = compareOutput("hello\n", "hello", CompareMode::EXACT);
    assert(result.accepted == false);
}

TEST(compareOutput_ignoreTrailing) {
    CompareResult result = compareOutput("3\n", "3", CompareMode::IGNORE_TRAILING);
    assert(result.accepted == true);

    result = compareOutput("wrong\n", "correct\n", CompareMode::IGNORE_TRAILING);
    assert(result.accepted == false);

    // 测试错误信息
    cout << "\n  Error message example: " << result.message.substr(0, 50) << "... ";
}

// ========== 主函数 ==========

int main() {
    cout << "==================================" << endl;
    cout << "  Comparator Module Unit Tests" << endl;
    cout << "==================================" << endl;

    try {
        RUN_TEST(exactCompare);
        RUN_TEST(ignoreTrailingCompare);
        RUN_TEST(compareOutput_exact);
        RUN_TEST(compareOutput_ignoreTrailing);

        cout << "\n==================================" << endl;
        cout << "  All tests PASSED! ✓" << endl;
        cout << "==================================" << endl;
        return 0;
    } catch (const exception &e) {
        cout << "\n✗ FAILED: " << e.what() << endl;
        return 1;
    }
}
