# 自动造数据工具 ✅

快速使用：修改 `gen.cpp`（数据生成器）和 `sol.cpp`（标程），然后运行 `maker.sh` 即可自动生成 `.in` 和 `.out` 文件。

## 文件说明

- **`.env`**：配置文件，可设置以下参数：
  - `COUNT`：测试用例组数（默认 5）。
  - `IN_DIR`：输入文件存放目录（默认 `./in`）。
  - `OUT_DIR`：输出文件存放目录（默认 `./out`）。
- **`gen.cpp`**：数据生成器。
  - 编写造数据逻辑，输出到 `stdout`。
  - 脚本会自动循环调用该程序并重定向到 `.in` 文件。
- **`sol.cpp`**：标程（解法程序）。
  - 编写 AC 代码，从 `stdin` 读取输入，输出到 `stdout`。
- **`maker.sh`**：Linux 下的自动化脚本。
  - 自动编译 `gen.cpp` 和 `sol.cpp`。
  - 根据 `COUNT` 循环运行生成器。
  - 自动将所有 `.in` 文件输入标程并生成对应的 `.out` 文件。
- **`maker.bat`**：Windows 下的自动化脚本（逻辑同上）。

## 使用方法

1. **配置参数**（可选）：在 `.env` 中设置 `COUNT=10`。
2. **编写逻辑**：
   - 在 `gen.cpp` 中编写单组数据的生成逻辑。
   - 在 `sol.cpp` 中编写正确解法。
3. **运行脚本**：
   ```bash
   ./maker.sh
   ```
4. **获取结果**：生成的测试数据会保存在 `./in/` 和 `./out/` 目录下。

### 示例

`gen.cpp` 逻辑：
```cpp
#include <iostream>
#include <random>
int main() {
    std::random_device rd;
    std::cout << rd() % 100 << " " << rd() % 100 << std::endl;
    return 0;
}
```

运行：
```bash
./maker.sh
```

完成！✅
