#include <bits/stdc++.h>
using namespace std;
#define int long long

void solve() {
    int n;
    cin >> n;
    bool ok = 0;
    int cnt = 0;
    for (int i = 0; i < n; i++) {
        int t;
        cin >> t;
        if (t == 1) {
            if (!ok) {
                cnt++;
            }
        } else {
            ok = 1;
        }
    }
    if (cnt == n) {
        if (cnt % 2) {
            cout << "CandidateMaster\n";
        } else {
            cout << "LegendaryGrandmaster\n";
        }
    } else {
        if (cnt % 2) {
            cout << "LegendaryGrandmaster\n";
        } else {
            cout << "CandidateMaster\n";
        }
    }
}

signed main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T = 1;
    cin >> T;
    while (T--) {
        solve();
    }
    return 0;
}