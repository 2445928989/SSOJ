/**
 * @file benchmark_cpu.cpp
 * @brief 测试不同数据量的 CPU 时间消耗
 */

#include "../src/compiler.h"
#include "../src/runner.h"
#include "../src/utils.h"
#include <iostream>

using namespace std;
using namespace judger;

void benchmark(long long n, const string &name) {
    cout << "\n=== Benchmark: " << name << " (n=" << n << ") ===" << endl;

    string code = R"(
        #include <iostream>
        int main() {
            volatile long long sum = 0;
            for (long long i = 0; i < )" +
                  to_string(n) + R"(LL; i++) {
                sum += i;
            }
            std::cout << sum << std::endl;
            return 0;
        }
    )";

    writeFile("/tmp/bench.cpp", code);
    compile("/tmp/bench.cpp", "cpp", "/tmp/bench");

    ResourceLimit limits = {10, 15, 256, 32, 128}; // 10秒限制
    RunResult result = runProgram("/tmp/bench", "cpp", "", "/tmp/out.txt", "/tmp/err.txt", limits);

    cout << "Status: " << (result.status == RunStatus::OK ? "OK" : "TLE") << endl;
    cout << "CPU Time: " << result.usage.cpuTimeMs << " ms" << endl;
    cout << "Output: " << result.stdoutContent.substr(0, 50) << endl;
}

int main() {
    cout << "==========================================" << endl;
    cout << "  CPU Time Benchmark" << endl;
    cout << "  Testing: 1 second ≈ how many operations?" << endl;
    cout << "==========================================" << endl;

    // 测试不同数据量
    benchmark(10000000LL, "1e7 (10 million)");
    benchmark(50000000LL, "5e7 (50 million)");
    benchmark(100000000LL, "1e8 (100 million)");
    benchmark(200000000LL, "2e8 (200 million)");
    benchmark(500000000LL, "5e8 (500 million)");
    benchmark(1000000000LL, "1e9 (1 billion)");

    cout << "\n==========================================" << endl;
    cout << "  Benchmark completed!" << endl;
    cout << "==========================================" << endl;

    return 0;
}
