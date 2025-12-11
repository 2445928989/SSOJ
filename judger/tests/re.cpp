
#include <iostream>
using namespace std;
int main() {
    int *p = nullptr;
    *p = 42;  // 触发段错误
    return 0;
}
