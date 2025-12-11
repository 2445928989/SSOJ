
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
