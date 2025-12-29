#include <bits/stdc++.h>
using namespace std;
#define int long long

void solve() {
    int n;
    cin >> n;
    int f0 = 1, f1 = 1;
    if (n <= 2) {
        cout << 1;
        return;
    }
    for (int i = 3; i <= n; i++) {
        int t = f1;
        f1 = f1 + f0;
        f0 = t;
    }
    cout << f1;
}

signed main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T = 1;
    // cin >> T;
    while (T--) {
        solve();
    }
    return 0;
}