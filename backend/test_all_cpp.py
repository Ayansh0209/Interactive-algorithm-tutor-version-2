import json
import sys
import os

# Add cpp-worker to path to import app
sys.path.insert(0, os.path.abspath('c:/All code/tutor/backend/cpp-worker'))
from app import trace, TraceRequest

codes = [
    """
#include <bits/stdc++.h>
using namespace std;
double findMedianSortedArrays(vector<int> a, vector<int> b) {
    if (a.size() > b.size()) swap(a, b);
    int m = a.size(), n = b.size();
    int lo = 0, hi = m;
    int half = (m + n + 1) / 2;
    while (lo <= hi) {
        int i = (lo + hi) / 2;
        int j = half - i;
        int left1 = i > 0 ? a[i-1] : INT_MIN;
        int right1 = i < m ? a[i] : INT_MAX;
        int left2 = j > 0 ? b[j-1] : INT_MIN;
        int right2 = j < n ? b[j] : INT_MAX;
        if (left1 <= right2 && left2 <= right1) {
            if ((m + n) % 2 == 0) return (max(left1,left2) + min(right1,right2)) / 2.0;
            return max(left1, left2);
        } else if (left1 > right2) {
            hi = i - 1;
        } else {
            lo = i + 1;
        }
    }
    return -1;
}
int main() {
    vector<int> nums1 = {1, 3, 8};
    vector<int> nums2 = {7, 9, 10, 11, 15};
    double result = findMedianSortedArrays(nums1, nums2);
    cout << result << endl;
}
""",
    """
#include <bits/stdc++.h>
using namespace std;
int main() {
    vector<int> height = {4, 2, 0, 3, 2, 5};
    int left = 0, right = height.size() - 1;
    int leftMax = 0, rightMax = 0, water = 0;
    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] >= leftMax) leftMax = height[left];
            else water += leftMax - height[left];
            left++;
        } else {
            if (height[right] >= rightMax) rightMax = height[right];
            else water += rightMax - height[right];
            right--;
        }
    }
    cout << water << endl;
}
""",
    """
#include <bits/stdc++.h>
using namespace std;
struct ListNode {
    int val;
    ListNode* next;
    ListNode(int v) : val(v), next(nullptr) {}
};
ListNode* build(vector<int> vals) {
    ListNode* head = nullptr; ListNode* tail = nullptr;
    for (int v : vals) {
        ListNode* node = new ListNode(v);
        if (!head) head = node; else tail->next = node;
        tail = node;
    }
    return head;
}
ListNode* mergeKLists(vector<ListNode*> lists) {
    auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
    priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> heap(cmp);
    for (ListNode* node : lists) if (node) heap.push(node);
    ListNode dummy(0);
    ListNode* curr = &dummy;
    while (!heap.empty()) {
        ListNode* node = heap.top(); heap.pop();
        curr->next = node;
        curr = curr->next;
        if (node->next) heap.push(node->next);
    }
    return dummy.next;
}
int main() {
    ListNode* l1 = build({1,4,5});
    ListNode* l2 = build({1,3,4});
    ListNode* l3 = build({2,6});
    ListNode* merged = mergeKLists({l1, l2, l3});
    while (merged) { cout << merged->val << " "; merged = merged->next; }
    cout << endl;
}
""",
    """
#include <bits/stdc++.h>
using namespace std;
int main() {
    string s = ")()())";
    stack<int> stk;
    stk.push(-1);
    int best = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        if (s[i] == '(') {
            stk.push(i);
        } else {
            stk.pop();
            if (stk.empty()) {
                stk.push(i);
            } else {
                best = max(best, i - stk.top());
            }
        }
    }
    cout << best << endl;
}
""",
    """
#include <bits/stdc++.h>
using namespace std;
int n = 5;
int total = 0;
vector<int> board;
set<int> cols, diag, anti;
void place(int row) {
    if (row == n) { total++; return; }
    for (int c = 0; c < n; c++) {
        if (cols.count(c) || diag.count(row - c) || anti.count(row + c)) continue;
        board.push_back(c); cols.insert(c); diag.insert(row - c); anti.insert(row + c);
        place(row + 1);
        board.pop_back(); cols.erase(c); diag.erase(row - c); anti.erase(row + c);
    }
}
int main() {
    place(0);
    cout << total << endl;
}
""",
    """
#include <bits/stdc++.h>
using namespace std;
struct TrieNode {
    unordered_map<char, TrieNode*> children;
    string word = "";
};
TrieNode* buildTrie(vector<string>& words) {
    TrieNode* root = new TrieNode();
    for (auto& w : words) {
        TrieNode* node = root;
        for (char ch : w) {
            if (!node->children.count(ch)) node->children[ch] = new TrieNode();
            node = node->children[ch];
        }
        node->word = w;
    }
    return root;
}
void dfs(vector<vector<char>>& board, int r, int c, TrieNode* node, vector<string>& found) {
    if (r < 0 || r >= (int)board.size() || c < 0 || c >= (int)board[0].size()) return;
    char ch = board[r][c];
    if (ch == '#' || !node->children.count(ch)) return;
    TrieNode* nxt = node->children[ch];
    if (!nxt->word.empty()) { found.push_back(nxt->word); nxt->word = ""; }
    board[r][c] = '#';
    dfs(board, r+1, c, nxt, found);
    dfs(board, r-1, c, nxt, found);
    dfs(board, r, c+1, nxt, found);
    dfs(board, r, c-1, nxt, found);
    board[r][c] = ch;
}
int main() {
    vector<vector<char>> board = {
        {'o','a','a','n'},
        {'e','t','a','e'},
        {'i','h','k','r'},
        {'i','f','l','v'}
    };
    vector<string> words = {"oath", "pea", "eat", "rain"};
    TrieNode* root = buildTrie(words);
    vector<string> found;
    for (int r = 0; r < (int)board.size(); r++)
        for (int c = 0; c < (int)board[0].size(); c++)
            dfs(board, r, c, root, found);
    for (auto& w : found) cout << w << " ";
    cout << endl;
}
""",
    """
#include <bits/stdc++.h>
using namespace std;
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};
void serialize(TreeNode* node, vector<string>& out) {
    if (!node) { out.push_back("#"); return; }
    out.push_back(to_string(node->val));
    serialize(node->left, out);
    serialize(node->right, out);
}
TreeNode* deserialize(deque<string>& q) {
    string val = q.front(); q.pop_front();
    if (val == "#") return nullptr;
    TreeNode* node = new TreeNode(stoi(val));
    node->left = deserialize(q);
    node->right = deserialize(q);
    return node;
}
int main() {
    TreeNode* root = new TreeNode(1);
    root->left = new TreeNode(2);
    root->right = new TreeNode(3);
    root->right->left = new TreeNode(4);
    root->right->right = new TreeNode(5);
    vector<string> tokens;
    serialize(root, tokens);
    string data;
    for (int i = 0; i < (int)tokens.size(); i++) { data += tokens[i]; if (i + 1 < (int)tokens.size()) data += ","; }
    deque<string> q(tokens.begin(), tokens.end());
    TreeNode* rebuilt = deserialize(q);
    cout << data << endl;
}
""",
    """
#include <bits/stdc++.h>
using namespace std;
vector<int> parent(8);
int find(int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
}
int main() {
    for (int i = 0; i < 8; i++) parent[i] = i;
    vector<pair<int,int>> edges = {{1,2},{1,3},{2,3},{4,5},{5,6},{6,4}};
    pair<int,int> answer = {-1,-1};
    for (auto& e : edges) {
        int a = e.first, b = e.second;
        int ra = find(a), rb = find(b);
        if (ra == rb) { answer = e; break; }
        parent[ra] = rb;
    }
    cout << answer.first << " " << answer.second << endl;
}
""",
    """
#include <bits/stdc++.h>
using namespace std;
struct Node {
    int key, val;
    Node* prev;
    Node* next;
    Node(int k, int v) : key(k), val(v), prev(nullptr), next(nullptr) {}
};
unordered_map<int, Node*> cache;
Node* head = new Node(0, 0);
Node* tail = new Node(0, 0);
int capacity;
void removeNode(Node* node) {
    node->prev->next = node->next;
    node->next->prev = node->prev;
}
void addFront(Node* node) {
    node->prev = head;
    node->next = head->next;
    head->next->prev = node;
    head->next = node;
}
int get(int key) {
    if (!cache.count(key)) return -1;
    Node* node = cache[key];
    removeNode(node);
    addFront(node);
    return node->val;
}
void put(int key, int value) {
    if (cache.count(key)) removeNode(cache[key]);
    Node* node = new Node(key, value);
    cache[key] = node;
    addFront(node);
    if ((int)cache.size() > capacity) {
        Node* lru = tail->prev;
        removeNode(lru);
        cache.erase(lru->key);
    }
}
int main() {
    capacity = 2;
    head->next = tail; tail->prev = head;
    put(1, 1);
    put(2, 2);
    int r1 = get(1);
    put(3, 3);
    int r2 = get(2);
    put(4, 4);
    int r3 = get(1);
    int r4 = get(3);
    int r5 = get(4);
    cout << r1 << " " << r2 << " " << r3 << " " << r4 << " " << r5 << endl;
}
""",
    """
#include <bits/stdc++.h>
using namespace std;
int main() {
    vector<int> nums = {1, 3, -1, -3, 5, 3, 6, 7};
    int k = 3;
    deque<int> window;
    vector<int> result;
    for (int i = 0; i < (int)nums.size(); i++) {
        while (!window.empty() && nums[window.back()] < nums[i]) window.pop_back();
        window.push_back(i);
        if (window.front() <= i - k) window.pop_front();
        if (i >= k - 1) result.push_back(nums[window.front()]);
    }
    for (int x : result) cout << x << " ";
    cout << endl;
}
""",
    """
#include <bits/stdc++.h>
using namespace std;
bool isMatch(string s, string p) {
    int n = s.size(), m = p.size();
    vector<vector<bool>> dp(n + 1, vector<bool>(m + 1, false));
    dp[0][0] = true;
    for (int j = 1; j <= m; j++)
        if (p[j-1] == '*') dp[0][j] = dp[0][j-2];
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (p[j-1] == s[i-1] || p[j-1] == '.') {
                dp[i][j] = dp[i-1][j-1];
            } else if (p[j-1] == '*') {
                dp[i][j] = dp[i][j-2];
                if (p[j-2] == s[i-1] || p[j-2] == '.') dp[i][j] = dp[i][j] || dp[i-1][j];
            }
        }
    }
    return dp[n][m];
}
int main() {
    string s = "aab";
    string p = "c*a*b";
    bool result = isMatch(s, p);
    cout << (result ? "true" : "false") << endl;
}
""",
    """
#include <bits/stdc++.h>
using namespace std;
int main() {
    vector<int> nums = {3, 2, 1, 5, 6, 4};
    int k = 2;
    priority_queue<int, vector<int>, greater<int>> heap;
    for (int num : nums) {
        heap.push(num);
        if ((int)heap.size() > k) heap.pop();
    }
    cout << heap.top() << endl;
}
"""
]

results = []
for idx, code in enumerate(codes):
    print(f"Running problem {idx+1}...")
    try:
        req = TraceRequest(code=code, max_steps=4000, stdin="")
        out = trace(req)
        meta = out.get("meta", {})
        if meta.get("error"):
            results.append({"problem": idx+1, "status": f"Error: {meta['error']}"})
        else:
            steps = out.get("steps", [])
            last_vars = steps[-1].get("locals", {}) if steps else {}
            if steps and steps[-1].get("event") == "print" and len(steps) > 1:
                last_vars = steps[-2].get("locals", {})
            results.append({"problem": idx+1, "status": "Success", "steps": len(steps), "last_vars": last_vars})
    except Exception as e:
        results.append({"problem": idx+1, "status": f"Exception: {str(e)}"})

with open("c:/All code/tutor/backend/cpp_test_results.json", "w") as f:
    json.dump(results, f, indent=2)
print("Done. Saved to cpp_test_results.json")
