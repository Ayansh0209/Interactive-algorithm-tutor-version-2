import json
import traceback
from tracer import runCode

codes = [
    """
# 1. Median of Two Sorted Arrays
def findMedianSortedArrays(nums1, nums2):
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
    m, n = len(nums1), len(nums2)
    lo, hi = 0, m
    half = (m + n + 1) // 2
    while lo <= hi:
        i = (lo + hi) // 2
        j = half - i
        left1 = nums1[i - 1] if i > 0 else float('-inf')
        right1 = nums1[i] if i < m else float('inf')
        left2 = nums2[j - 1] if j > 0 else float('-inf')
        right2 = nums2[j] if j < n else float('inf')
        if left1 <= right2 and left2 <= right1:
            if (m + n) % 2 == 0:
                return (max(left1, left2) + min(right1, right2)) / 2
            return max(left1, left2)
        elif left1 > right2:
            hi = i - 1
        else:
            lo = i + 1

nums1 = [1, 3, 8]
nums2 = [7, 9, 10, 11, 15]
result = findMedianSortedArrays(nums1, nums2)
print(result)
""",
    """
# 2. Trapping Rain Water
def trap(height):
    left, right = 0, len(height) - 1
    left_max, right_max = 0, 0
    water = 0
    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1
    return water

height = [4, 2, 0, 3, 2, 5]
result = trap(height)
print(result)
""",
    """
# 3. Merge K Sorted Lists
import heapq

class ListNode:
    def __init__(self, val=0):
        self.val = val
        self.next = None

def build(vals):
    head = None
    tail = None
    for v in vals:
        node = ListNode(v)
        if head is None:
            head = node
        else:
            tail.next = node
        tail = node
    return head

def mergeKLists(lists):
    heap = []
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, i, node))
    dummy = ListNode()
    curr = dummy
    while heap:
        val, i, node = heapq.heappop(heap)
        curr.next = node
        curr = curr.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next

l1 = build([1, 4, 5])
l2 = build([1, 3, 4])
l3 = build([2, 6])
merged = mergeKLists([l1, l2, l3])
out = []
cur = merged
while cur:
    out.append(cur.val)
    cur = cur.next
print(out)
""",
    """
# 4. Longest Valid Parentheses
def longestValidParens(s):
    stack = [-1]
    best = 0
    for i, ch in enumerate(s):
        if ch == '(':
            stack.append(i)
        else:
            stack.pop()
            if not stack:
                stack.append(i)
            else:
                best = max(best, i - stack[-1])
    return best

s = ")()())"
result = longestValidParens(s)
print(result)
""",
    """
# 5. N-Queens (n=5)
def solve(n):
    res = []
    board = []
    def place(row, cols, diag, anti):
        if row == n:
            res.append(list(board))
            return
        for c in range(n):
            if c in cols or (row - c) in diag or (row + c) in anti:
                continue
            board.append(c); cols.add(c); diag.add(row - c); anti.add(row + c)
            place(row + 1, cols, diag, anti)
            board.pop(); cols.discard(c); diag.discard(row - c); anti.discard(row + c)
    place(0, set(), set(), set())
    return res

out = solve(5)
print(len(out))
""",
    """
# 6. Word Search II
class TrieNode:
    def __init__(self):
        self.children = {}
        self.word = None

def buildTrie(words):
    root = TrieNode()
    for w in words:
        node = root
        for ch in w:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.word = w
    return root

def findWords(board, words):
    root = buildTrie(words)
    rows, cols = len(board), len(board[0])
    found = []

    def dfs(r, c, node):
        ch = board[r][c]
        if ch not in node.children:
            return
        nxt = node.children[ch]
        if nxt.word:
            found.append(nxt.word)
            nxt.word = None
        board[r][c] = '#'
        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
            nr, nc = r+dr, c+dc
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != '#':
                dfs(nr, nc, nxt)
        board[r][c] = ch

    for r in range(rows):
        for c in range(cols):
            dfs(r, c, root)
    return found

board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]]
words = ["oath", "pea", "eat", "rain"]
result = findWords(board, words)
print(result)
""",
    """
# 7. Serialize/Deserialize Binary Tree
class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def build(v, l=None, r=None):
    n = TreeNode(v); n.left = l; n.right = r
    return n

root = build(1, build(2), build(3, build(4), build(5)))

def serialize(node, out):
    if node is None:
        out.append("#")
        return
    out.append(str(node.val))
    serialize(node.left, out)
    serialize(node.right, out)

def deserialize(vals):
    val = vals.pop(0)
    if val == "#":
        return None
    node = TreeNode(int(val))
    node.left = deserialize(vals)
    node.right = deserialize(vals)
    return node

tokens = []
serialize(root, tokens)
data = ",".join(tokens)
rebuilt = deserialize(data.split(","))
print(data)
""",
    """
# 8. Redundant Connection
parent = list(range(8))
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

edges = [[1,2],[1,3],[2,3],[4,5],[5,6],[6,4]]
answer = None
for a, b in edges:
    ra, rb = find(a), find(b)
    if ra == rb:
        answer = [a, b]
        break
    parent[ra] = rb
print(answer)
""",
    """
# 9. LRU Cache
class Node:
    def __init__(self, k=0, v=0):
        self.key = k
        self.val = v
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add(self, node):
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._add(node)
        return node.val

    def put(self, key, value):
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, value)
        self.cache[key] = node
        self._add(node)
        if len(self.cache) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]

cache = LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
r1 = cache.get(1)
cache.put(3, 3)
r2 = cache.get(2)
cache.put(4, 4)
r3 = cache.get(1)
r4 = cache.get(3)
r5 = cache.get(4)
print(r1, r2, r3, r4, r5)
""",
    """
# 10. Sliding Window Maximum
from collections import deque

nums = [1, 3, -1, -3, 5, 3, 6, 7]
k = 3
window = deque()
result = []
for i, num in enumerate(nums):
    while window and nums[window[-1]] < num:
        window.pop()
    window.append(i)
    if window[0] <= i - k:
        window.popleft()
    if i >= k - 1:
        result.append(nums[window[0]])
print(result)
""",
    """
# 11. Regular Expression Matching
def isMatch(s, p):
    n, m = len(s), len(p)
    dp = [[False] * (m + 1) for _ in range(n + 1)]
    dp[0][0] = True
    for j in range(1, m + 1):
        if p[j - 1] == '*':
            dp[0][j] = dp[0][j - 2]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if p[j - 1] == s[i - 1] or p[j - 1] == '.':
                dp[i][j] = dp[i - 1][j - 1]
            elif p[j - 1] == '*':
                dp[i][j] = dp[i][j - 2]
                if p[j - 2] == s[i - 1] or p[j - 2] == '.':
                    dp[i][j] = dp[i][j] or dp[i - 1][j]
    return dp[n][m]

s = "aab"
p = "c*a*b"
result = isMatch(s, p)
print(result)
""",
    """
# 12. Kth Largest Element
import heapq

def findKthLargest(nums, k):
    heap = []
    for n in nums:
        heapq.heappush(heap, n)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]

nums = [3, 2, 1, 5, 6, 4]
k = 2
result = findKthLargest(nums, k)
print(result)
"""
]

results = []
for idx, code in enumerate(codes):
    print(f"Running problem {idx+1}...")
    try:
        trace = runCode(code)
        if isinstance(trace, list) and len(trace) > 0:
            last_step = trace[-1]
            if last_step.get("event") == "print":
                last_step = trace[-2] if len(trace) > 1 else {}
            results.append({"problem": idx+1, "status": "Success", "steps": len(trace), "last_vars": last_step.get("locals", {})})
        elif isinstance(trace, dict) and "error" in trace:
            results.append({"problem": idx+1, "status": f"Error: {trace['error']}"})
        else:
            results.append({"problem": idx+1, "status": "Success but no trace output"})
    except Exception as e:
        results.append({"problem": idx+1, "status": f"Exception: {str(e)}\n{traceback.format_exc()}"})

with open("python_test_results.json", "w") as f:
    json.dump(results, f, indent=2)
print("Done. Saved to python_test_results.json")
