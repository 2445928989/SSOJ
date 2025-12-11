# 测试程序 Makefile
# 使用方法：
#   make              - 编译所有测试
#   make test_utils   - 只编译 utils 测试
#   make run          - 运行所有测试
#   make clean        - 清理编译产物

CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -I../src
SRC_DIR = ../src

# 所有测试程序
TESTS = test_utils test_compiler test_comparator

# 默认目标：编译所有测试
all: $(TESTS)

# Utils 测试
test_utils: test_utils.cpp $(SRC_DIR)/utils.cpp
	$(CXX) $(CXXFLAGS) -o $@ $^

# Compiler 测试
test_compiler: test_compiler.cpp $(SRC_DIR)/compiler.cpp $(SRC_DIR)/utils.cpp
	$(CXX) $(CXXFLAGS) -o $@ $^

# Comparator 测试
test_comparator: test_comparator.cpp $(SRC_DIR)/comparator.cpp $(SRC_DIR)/utils.cpp
	$(CXX) $(CXXFLAGS) -o $@ $^

# Runner 测试（依赖更多模块）
test_runner: test_runner.cpp $(SRC_DIR)/runner.cpp $(SRC_DIR)/resource.cpp $(SRC_DIR)/security.cpp $(SRC_DIR)/utils.cpp
	$(CXX) $(CXXFLAGS) -o $@ $^

# 运行所有测试
run: all
	@echo "========================================="
	@echo "Running all tests..."
	@echo "========================================="
	@for test in $(TESTS); do \
		if [ -f ./$$test ]; then \
			echo ""; \
			./$$test; \
			echo ""; \
		fi; \
	done

# 运行单个测试
run_%: %
	./$<

# 清理
clean:
	rm -f $(TESTS)
	rm -f /tmp/test_*.txt /tmp/test_*.cpp /tmp/test_*.c

.PHONY: all run clean
