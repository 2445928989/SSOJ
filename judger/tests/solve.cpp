#include <bits/stdc++.h>
using namespace std;
#define int long long
void solve() {
    int n;
    cin >> n;
    vector<pair<int, int>> v(n - 1);
    for (int i = 0; i < n; i++) {
        cin >> v[i].first >> v[i].second;
    }
    int ans = 0;
    for (int i = 1; i <= n; i++) {
        ans += i * (n - i + 1);
    }
    for (int i = 0; i < n - 1; i++) {
        int mn = min(v[i].first, v[i].second);
        int mx = max(v[i].first, v[i].second);
        ans -= mn * (n - mx + 1);
    }
    cout << ans << '\n';
}
signed main() {
    ios::sync_with_stdio(0), cin.tie(0);
    int t = 1;
    // cin >> t;
    while (t--) {
        solve();
    }
}