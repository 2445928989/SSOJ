#include <bits/stdc++.h>
using namespace std;
#define int long long
mt19937_64 rnd(time(0));
int rndint(int l, int r) {
    return rnd() % (r - l + 1) + l;
}
signed main() {
    cout << rndint(1,30);
    return 0;
}
