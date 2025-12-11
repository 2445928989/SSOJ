# 测试说明

## 快速开始

### 方法一：使用 Makefile（推荐）

```bash
cd judger/tests

# 编译所有测试
make

# 运行所有测试
make run

# 运行单个测试
make run_test_utils
make run_test_compiler
make run_test_comparator

# 清理
make clean
```

### 方法二：手动编译单个测试

```bash
cd judger/tests

# 测试 utils 模块
g++ -std=c++17 -I../src test_utils.cpp ../src/utils.cpp -o test_utils
./test_utils

# 测试 compiler 模块
g++ -std=c++17 -I../src test_compiler.cpp ../src/compiler.cpp ../src/utils.cpp -o test_compiler
./test_compiler

# 测试 comparator 模块
g++ -std=c++17 -I../src test_comparator.cpp ../src/comparator.cpp ../src/utils.cpp -o test_comparator
./test_comparator
```

## 测试文件说明

| 文件 | 测试模块 | 依赖 |
|------|---------|------|
| `test_utils.cpp` | utils 模块 | utils.cpp |
| `test_compiler.cpp` | compiler 模块 | compiler.cpp, utils.cpp |
| `test_comparator.cpp` | comparator 模块 | comparator.cpp, utils.cpp |

## 添加新测试

在测试文件中使用以下模式：

```cpp
TEST(your_test_name) {
    // 测试代码
    assert(condition);
}

// 在 main 函数中运行
RUN_TEST(your_test_name);
```

## 调试单个函数

如果只想测试一个函数，可以创建简单的测试文件：

```bash
# 创建测试文件
cat > my_test.cpp << 'EOF'
#include "../src/utils.h"
#include <iostream>
using namespace std;
using namespace judger;

int main() {
    // 测试你的函数
    string result = jsonEscape("hello\nworld");
    cout << "Result: " << result << endl;
    return 0;
}
EOF

# 编译并运行
g++ -std=c++17 -I../src my_test.cpp ../src/utils.cpp -o my_test
./my_test
```

## 预期输出

成功时：
```
==================================
  Utils Module Unit Tests
==================================
Running test: jsonEscape ... PASSED
Running test: trimTrailingWhitespace ... PASSED
Running test: writeFile ... PASSED
Running test: readFile ... PASSED

==================================
  All tests PASSED! ✓
==================================
```

失败时：
```
Running test: readFile ... Assertion failed: ...
✗ FAILED
```
