/**
 * @file test_runner_simple.cpp
 * @brief runner 模块的简单测试
 *
 * 编译方法：
 * g++ -std=c++17 -I../src test_runner_simple.cpp ../src/runner.cpp ../src/resource.cpp ../src/security.cpp ../src/utils.cpp -o test_runner_simple
 *
 * 运行：
 * ./test_runner_simple
 */

#include "../src/compiler.h"
#include "../src/runner.h"
#include "../src/utils.h"
#include <cassert>
#include <iostream>

using namespace std;
using namespace judger;

int main() {
    cout << "==================================" << endl;
    cout << "  Runner Module Simple Test" << endl;
    cout << "==================================" << endl;

    // 测试1：编译并运行一个简单的 C++ 程序
    cout << "\n=== Test 1: Run C++ Program ===" << endl;

    // 创建测试程序
    string source = R"(
        #include <iostream>
        using namespace std;
        int main() {
            int a, b;
            cin >> a >> b;
            cout << a + b << endl;
            return 0;
        }
    )";

    writeFile("/tmp/test_add.cpp", source);
    writeFile("/tmp/test_input.txt", "5 3");

    // 编译
    CompileResult compResult = compile("/tmp/test_add.cpp", "cpp", "/tmp/test_add");
    assert(compResult.success);
    cout << "✓ Compilation successful" << endl;

    // 设置资源限制
    ResourceLimit limits;
    limits.cpuTimeLimitSec = 1;
    limits.realTimeLimitSec = 2;
    limits.memoryLimitMB = 256;
    limits.outputLimitMB = 32;
    limits.stackLimitMB = 128;

    // 运行程序
    RunResult runResult = runProgram(
        "/tmp/test_add",
        "cpp",
        "/tmp/test_input.txt",
        "/tmp/test_output.txt",
        "/tmp/test_error.txt",
        limits);

    cout << "Status: ";
    switch (runResult.status) {
    case RunStatus::OK:
        cout << "OK";
        break;
    case RunStatus::RE:
        cout << "RE";
        break;
    case RunStatus::TLE:
        cout << "TLE";
        break;
    case RunStatus::MLE:
        cout << "MLE";
        break;
    case RunStatus::SE:
        cout << "SE";
        break;
    default:
        cout << "UNKNOWN";
    }
    cout << endl;

    cout << "CPU Time: " << runResult.usage.cpuTimeMs << " ms" << endl;
    cout << "Memory: " << runResult.usage.memoryKB << " KB" << endl;
    cout << "Exit Code: " << runResult.usage.exitCode << endl;
    cout << "Output: " << runResult.stdoutContent << endl;

    // 验证结果
    assert(runResult.status == RunStatus::OK);
    assert(runResult.stdoutContent.find("8") != string::npos); // 5+3=8

    cout << "✓ All tests passed!" << endl;

    return 0;
}
