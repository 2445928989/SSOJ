/**
 * @file test_runner_comprehensive.cpp
 * @brief runner 模块的综合测试（测试各种状态）
 */

#include "../src/compiler.h"
#include "../src/runner.h"
#include "../src/utils.h"
#include <iostream>

using namespace std;
using namespace judger;

void test_normal() {
    cout << "\n=== Test 1: Normal Execution (AC) ===" << endl;

    writeFile("/tmp/normal.cpp", R"(
        #include <iostream>
        int main() {
            std::cout << "Hello World" << std::endl;
            return 0;
        }
    )");

    compile("/tmp/normal.cpp", "cpp", "/tmp/normal");

    ResourceLimit limits = {1, 2, 256, 32, 128};
    RunResult result = runProgram("/tmp/normal", "cpp", "", "/tmp/out.txt", "/tmp/err.txt", limits);

    cout << "Status: " << (result.status == RunStatus::OK ? "OK ✓" : "FAILED ✗") << endl;
    cout << "Time: " << result.usage.cpuTimeMs << " ms" << endl;
    cout << "Output: " << result.stdoutContent << endl;
}

void test_runtime_error() {
    cout << "\n=== Test 2: Runtime Error (Segfault) ===" << endl;

    writeFile("/tmp/segfault.cpp", R"(
        int main() {
            int* p = nullptr;
            *p = 42;  // segfault
            return 0;
        }
    )");

    compile("/tmp/segfault.cpp", "cpp", "/tmp/segfault");

    ResourceLimit limits = {1, 2, 256, 32, 128};
    RunResult result = runProgram("/tmp/segfault", "cpp", "", "/tmp/out.txt", "/tmp/err.txt", limits);

    cout << "Status: " << (result.status == RunStatus::RE ? "RE ✓" : "UNEXPECTED") << endl;
    cout << "Error: " << result.errorMessage << endl;
}

void test_infinite_loop() {
    cout << "\n=== Test 3: Time Limit Exceeded ===" << endl;

    writeFile("/tmp/infinite.cpp", R"(
        int main() {
            while(1) {}  // infinite loop
            return 0;
        }
    )");

    compile("/tmp/infinite.cpp", "cpp", "/tmp/infinite");

    ResourceLimit limits = {1, 2, 256, 32, 128}; // 1秒 CPU 限制
    RunResult result = runProgram("/tmp/infinite", "cpp", "", "/tmp/out.txt", "/tmp/err.txt", limits);

    cout << "Status: " << (result.status == RunStatus::TLE ? "TLE ✓" : "UNEXPECTED") << endl;
    cout << "Time: " << result.usage.cpuTimeMs << " ms" << endl;
    cout << "Error: " << result.errorMessage << endl;
}

void test_nonzero_exit() {
    cout << "\n=== Test 4: Non-zero Exit Code ===" << endl;

    writeFile("/tmp/exit_error.cpp", R"(
        int main() {
            return 1;  // non-zero exit
        }
    )");

    compile("/tmp/exit_error.cpp", "cpp", "/tmp/exit_error");

    ResourceLimit limits = {1, 2, 256, 32, 128};
    RunResult result = runProgram("/tmp/exit_error", "cpp", "", "/tmp/out.txt", "/tmp/err.txt", limits);

    cout << "Status: " << (result.status == RunStatus::RE ? "RE ✓" : "UNEXPECTED") << endl;
    cout << "Exit Code: " << result.usage.exitCode << endl;
    cout << "Error: " << result.errorMessage << endl;
}

int main() {
    cout << "==========================================" << endl;
    cout << "  Runner Comprehensive Tests" << endl;
    cout << "==========================================" << endl;

    test_normal();
    test_runtime_error();
    test_infinite_loop();
    test_nonzero_exit();

    cout << "\n==========================================" << endl;
    cout << "  All tests completed!" << endl;
    cout << "==========================================" << endl;

    return 0;
}
