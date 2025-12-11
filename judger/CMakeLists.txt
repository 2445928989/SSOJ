cmake_minimum_required(VERSION 3.10)
project(SSOJ_Judger VERSION 1.0)

# 设置 C++ 标准
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# 编译选项
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra")
set(CMAKE_CXX_FLAGS_DEBUG "-g -O0")
set(CMAKE_CXX_FLAGS_RELEASE "-O2 -DNDEBUG")

# 源文件
set(SOURCES
    src/main.cpp
    src/utils.cpp
    src/compiler.cpp
    src/runner.cpp
    src/resource.cpp
    src/security.cpp
    src/comparator.cpp
)

# 可执行文件
add_executable(judger ${SOURCES})

# 链接库（seccomp 用于安全沙箱）
# 如果系统没有 libseccomp，可以先注释掉这行
find_library(SECCOMP_LIB seccomp)
if(SECCOMP_LIB)
    target_link_libraries(judger ${SECCOMP_LIB})
    message(STATUS "Found libseccomp: ${SECCOMP_LIB}")
else()
    message(WARNING "libseccomp not found. Security features will be limited.")
endif()

# 安装
install(TARGETS judger DESTINATION bin)

# 测试（可选）
enable_testing()

# 添加测试文件（如果需要）
# add_executable(test_compiler tests/test_compiler.cpp src/compiler.cpp src/utils.cpp)
# add_test(NAME CompilerTest COMMAND test_compiler)

# 输出构建信息
message(STATUS "Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "C++ compiler: ${CMAKE_CXX_COMPILER}")
message(STATUS "C++ flags: ${CMAKE_CXX_FLAGS}")
