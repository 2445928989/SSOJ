// 测试完整判题流程
#include <cstdlib>
#include <fstream>
#include <iostream>
#include <string>
#include <sys/stat.h>

// 创建临时文件
void createFile(const std::string &path, const std::string &content) {
    std::ofstream out(path);
    out << content;
    out.close();
}

// 测试 A+B 问题
void testAPlusB() {
    std::cout << "\n=== Test 1: A+B Problem (AC) ===" << std::endl;

    // C++ 源代码
    std::string sourceCode = R"(
#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
)";

    createFile("aplusb.cpp", sourceCode);
    createFile("aplusb_input.txt", "5 3\n");
    createFile("aplusb_output.txt", "8\n");

    std::string cmd = "../judger --src aplusb.cpp --lang cpp --input aplusb_input.txt --output aplusb_output.txt --time 1 --mem 256";
    std::cout << "Command: " << cmd << std::endl;
    int ret = system(cmd.c_str());
    std::cout << "Return code: " << ret << std::endl;
}

// 测试 WA
void testWrongAnswer() {
    std::cout << "\n=== Test 2: Wrong Answer ===" << std::endl;

    std::string sourceCode = R"(
#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a - b << endl;  // 错误：应该是 a+b
    return 0;
}
)";

    createFile("wa.cpp", sourceCode);
    createFile("wa_input.txt", "5 3\n");
    createFile("wa_output.txt", "8\n");

    std::string cmd = "../judger --src wa.cpp --lang cpp --input wa_input.txt --output wa_output.txt --time 1 --mem 256";
    std::cout << "Command: " << cmd << std::endl;
    system(cmd.c_str());
}

// 测试 TLE
void testTimeLimitExceeded() {
    std::cout << "\n=== Test 3: Time Limit Exceeded ===" << std::endl;

    std::string sourceCode = R"(
#include <iostream>
using namespace std;
int main() {
    volatile long long sum = 0;
    for (long long i = 0; i < 5000000000LL; i++) {
        sum += i;
    }
    cout << sum << endl;
    return 0;
}
)";

    createFile("tle.cpp", sourceCode);
    createFile("tle_input.txt", "\n");
    createFile("tle_output.txt", "0\n");

    std::string cmd = "../judger --src tle.cpp --lang cpp --input tle_input.txt --output tle_output.txt --time 1 --mem 256";
    std::cout << "Command: " << cmd << std::endl;
    system(cmd.c_str());
}

// 测试 RE
void testRuntimeError() {
    std::cout << "\n=== Test 4: Runtime Error (Segfault) ===" << std::endl;

    std::string sourceCode = R"(
#include <iostream>
using namespace std;
int main() {
    int *p = nullptr;
    *p = 42;  // 触发段错误
    return 0;
}
)";

    createFile("re.cpp", sourceCode);
    createFile("re_input.txt", "\n");
    createFile("re_output.txt", "0\n");

    std::string cmd = "../judger --src re.cpp --lang cpp --input re_input.txt --output re_output.txt --time 1 --mem 256";
    std::cout << "Command: " << cmd << std::endl;
    system(cmd.c_str());
}

// 测试 CE
void testCompileError() {
    std::cout << "\n=== Test 5: Compile Error ===" << std::endl;

    std::string sourceCode = R"(
#include <iostream>
using namespace std;
int main() {
    cout << "Hello << endl;  // 语法错误：缺少引号
    return 0;
}
)";

    createFile("ce.cpp", sourceCode);
    createFile("ce_input.txt", "\n");
    createFile("ce_output.txt", "Hello\n");

    std::string cmd = "../judger --src ce.cpp --lang cpp --input ce_input.txt --output ce_output.txt --time 1 --mem 256";
    std::cout << "Command: " << cmd << std::endl;
    system(cmd.c_str());
}

// 测试 Python (AC)
void testPython() {
    std::cout << "\n=== Test 6: Python A+B (AC) ===" << std::endl;

    std::string sourceCode = R"(
a, b = map(int, input().split())
print(a + b)
)";

    createFile("aplusb.py", sourceCode);
    createFile("py_input.txt", "10 20\n");
    createFile("py_output.txt", "30\n");

    std::string cmd = "../judger --src aplusb.py --lang python --input py_input.txt --output py_output.txt --time 1 --mem 256";
    std::cout << "Command: " << cmd << std::endl;
    system(cmd.c_str());
}

int main() {
    std::cout << "======================================" << std::endl;
    std::cout << "  Complete Judger Integration Test  " << std::endl;
    std::cout << "======================================" << std::endl;

    testAPlusB();
    testWrongAnswer();
    testTimeLimitExceeded();
    testRuntimeError();
    testCompileError();
    testPython();

    std::cout << "\n=== All tests completed ===" << std::endl;
    return 0;
}
