/**
 * @file test_resource_limits.cpp
 * @brief 测试资源限制功能
 */

#include "../src/compiler.h"
#include "../src/runner.h"
#include "../src/utils.h"
#include <iostream>

using namespace std;
using namespace judger;

void test_memory_usage() {
    cout << "\n=== Test: Memory Usage Tracking ===" << endl;

    // 创建一个分配内存的程序
    writeFile("/tmp/mem_test.cpp", R"(
        #include <iostream>
        #include <vector>
        int main() {
            // 分配约 10MB 内存
            std::vector<int> v(2500000);  // 2.5M * 4 bytes = 10MB
            for (int i = 0; i < v.size(); i++) {
                v[i] = i;
            }
            std::cout << "Allocated memory" << std::endl;
            return 0;
        }
    )");

    compile("/tmp/mem_test.cpp", "cpp", "/tmp/mem_test");

    ResourceLimit limits = {2, 3, 256, 32, 128};
    RunResult result = runProgram("/tmp/mem_test", "cpp", "", "/tmp/out.txt", "/tmp/err.txt", limits);

    cout << "Status: " << (result.status == RunStatus::OK ? "OK" : "FAILED") << endl;
    cout << "Memory Used: " << result.usage.memoryKB / 1024.0 << " MB" << endl;
    cout << "CPU Time: " << result.usage.cpuTimeMs << " ms" << endl;
}

void test_cpu_time() {
    cout << "\n=== Test: CPU Time Tracking ===" << endl;

    // 创建一个消耗 CPU 的程序
    writeFile("/tmp/cpu_test.cpp", R"(
        #include <iostream>
        int main() {
            long long sum = 0;
            for (int i = 0; i < 100000000; i++) {  // 1亿次循环
                sum += i;
            }
            std::cout << sum << std::endl;
            return 0;
        }
    )");

    compile("/tmp/cpu_test.cpp", "cpp", "/tmp/cpu_test");

    ResourceLimit limits = {5, 10, 256, 32, 128};
    RunResult result = runProgram("/tmp/cpu_test", "cpp", "", "/tmp/out.txt", "/tmp/err.txt", limits);

    cout << "Status: " << (result.status == RunStatus::OK ? "OK" : "TLE") << endl;
    cout << "CPU Time: " << result.usage.cpuTimeMs << " ms" << endl;
    cout << "Real Time: " << result.usage.realTimeMs << " ms" << endl;
}

void test_cpu_limit_enforcement() {
    cout << "\n=== Test: CPU Limit Enforcement ===" << endl;

    // 创建一个会超过 CPU 限制的程序
    // 使用 volatile 防止编译器优化
    writeFile("/tmp/cpu_heavy.cpp", R"(
        #include <iostream>
        #include <ctime>
        int main() {
            volatile long long sum = 0;  // volatile 防止优化
            std::srand(std::time(0));
            
            // 大量计算，无法被优化掉
            for (long long i = 0; i < 1000000000LL; i++) {  // 10亿次
                sum += (std::rand() % 100);
                
                // 每 1000 万次做一次额外计算，确保消耗足够 CPU
                if (i % 10000000 == 0) {
                    volatile int temp = 0;
                    for (int j = 0; j < 1000; j++) {
                        temp += j * j;
                    }
                }
            }
            
            std::cout << sum << std::endl;
            return 0;
        }
    )");

    compile("/tmp/cpu_heavy.cpp", "cpp", "/tmp/cpu_heavy");

    // 设置很短的 CPU 时间限制
    ResourceLimit limits = {1, 5, 256, 32, 128}; // 1秒 CPU 限制
    RunResult result = runProgram("/tmp/cpu_heavy", "cpp", "", "/tmp/out.txt", "/tmp/err.txt", limits);

    cout << "Status: " << (result.status == RunStatus::TLE ? "TLE ✓" : "UNEXPECTED") << endl;
    cout << "CPU Time: " << result.usage.cpuTimeMs << " ms" << endl;
    cout << "Error: " << result.errorMessage << endl;
}

int main() {
    cout << "==========================================" << endl;
    cout << "  Resource Limits Tests" << endl;
    cout << "==========================================" << endl;

    test_memory_usage();
    test_cpu_time();
    test_cpu_limit_enforcement();

    cout << "\n==========================================" << endl;
    cout << "  Resource tests completed!" << endl;
    cout << "==========================================" << endl;

    return 0;
}
