#include <bits/stdc++.h>
using namespace std;
#define int long long
mt19937_64 rnd(time(0));
int rndint(int l, int r) {
    return rnd() % (r - l + 1) + l;
}
signed main() {
    int t = rndint(1, 100000);
    cout << t << '\n';
    int sum = 0;
    for (int i = 0; i < t; i++) {
        int n = rndint(1, 100000 - sum - (t - i - 1));
        sum += n;
        cout << n << '\n';
        int c = rndint(1, 10);
        if (c == 1) {
            for (int i = 0; i < n; i++) {
                cout << "1 ";
            }
        } else {
            for (int i = 0; i < n; i++) {
                int t = rndint(1, 2);
                if (t == 1) {
                    cout << 1 << ' ';
                } else {
                    cout << rndint(1, 1000000) << ' ';
                }
            }
        }
        cout << '\n';
    }
    return 0;
}
