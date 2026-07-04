import json
import subprocess
import os
import tempfile
import re

codes = [
    """
public class Main {
  public static void main(String[] args) {
    int[] nums1 = {1, 3, 8};
    int[] nums2 = {7, 9, 10, 11, 15};
    double result = findMedianSortedArrays(nums1, nums2);
    System.out.println(result);
  }
  static double findMedianSortedArrays(int[] a, int[] b) {
    if (a.length > b.length) { int[] t = a; a = b; b = t; }
    int m = a.length, n = b.length;
    int lo = 0, hi = m;
    int half = (m + n + 1) / 2;
    while (lo <= hi) {
      int i = (lo + hi) / 2;
      int j = half - i;
      int left1 = i > 0 ? a[i - 1] : Integer.MIN_VALUE;
      int right1 = i < m ? a[i] : Integer.MAX_VALUE;
      int left2 = j > 0 ? b[j - 1] : Integer.MIN_VALUE;
      int right2 = j < n ? b[j] : Integer.MAX_VALUE;
      if (left1 <= right2 && left2 <= right1) {
        if ((m + n) % 2 == 0) return (Math.max(left1, left2) + Math.min(right1, right2)) / 2.0;
        return Math.max(left1, left2);
      } else if (left1 > right2) {
        hi = i - 1;
      } else {
        lo = i + 1;
      }
    }
    return -1;
  }
}
""",
    """
public class Main {
  public static void main(String[] args) {
    int[] height = {4, 2, 0, 3, 2, 5};
    int left = 0, right = height.length - 1;
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
    System.out.println(water);
  }
}
""",
    """
import java.util.*;
public class Main {
  static class ListNode {
    int val; ListNode next;
    ListNode(int v) { val = v; }
  }
  public static void main(String[] args) {
    ListNode l1 = build(new int[]{1,4,5});
    ListNode l2 = build(new int[]{1,3,4});
    ListNode l3 = build(new int[]{2,6});
    ListNode merged = mergeKLists(new ListNode[]{l1, l2, l3});
    StringBuilder sb = new StringBuilder();
    while (merged != null) { sb.append(merged.val).append(" "); merged = merged.next; }
    System.out.println(sb.toString().trim());
  }
  static ListNode build(int[] vals) {
    ListNode head = null, tail = null;
    for (int v : vals) {
      ListNode node = new ListNode(v);
      if (head == null) head = node; else tail.next = node;
      tail = node;
    }
    return head;
  }
  static ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue<ListNode> heap = new PriorityQueue<>((x, y) -> x.val - y.val);
    for (ListNode node : lists) if (node != null) heap.offer(node);
    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;
    while (!heap.isEmpty()) {
      ListNode node = heap.poll();
      curr.next = node;
      curr = curr.next;
      if (node.next != null) heap.offer(node.next);
    }
    return dummy.next;
  }
}
""",
    """
import java.util.*;
public class Main {
  public static void main(String[] args) {
    String s = ")()())";
    Stack<Integer> stack = new Stack<>();
    stack.push(-1);
    int best = 0;
    for (int i = 0; i < s.length(); i++) {
      char ch = s.charAt(i);
      if (ch == '(') {
        stack.push(i);
      } else {
        stack.pop();
        if (stack.isEmpty()) {
          stack.push(i);
        } else {
          best = Math.max(best, i - stack.peek());
        }
      }
    }
    System.out.println(best);
  }
}
""",
    """
import java.util.*;
public class Main {
  public static void main(String[] args) {
    int n = 5;
    int total = place(0, n, new int[n], new HashSet<>(), new HashSet<>(), new HashSet<>());
    System.out.println(total);
  }
  static int place(int row, int n, int[] board, Set<Integer> cols, Set<Integer> diag, Set<Integer> anti) {
    if (row == n) return 1;
    int count = 0;
    for (int c = 0; c < n; c++) {
      if (cols.contains(c) || diag.contains(row - c) || anti.contains(row + c)) continue;
      board[row] = c; cols.add(c); diag.add(row - c); anti.add(row + c);
      count += place(row + 1, n, board, cols, diag, anti);
      cols.remove(c); diag.remove(row - c); anti.remove(row + c);
    }
    return count;
  }
}
""",
    """
import java.util.*;
public class Main {
  static class TrieNode {
    Map<Character, TrieNode> children = new HashMap<>();
    String word = null;
  }
  public static void main(String[] args) {
    char[][] board = {
      {'o','a','a','n'},
      {'e','t','a','e'},
      {'i','h','k','r'},
      {'i','f','l','v'}
    };
    String[] words = {"oath", "pea", "eat", "rain"};
    TrieNode root = buildTrie(words);
    List<String> found = new ArrayList<>();
    for (int r = 0; r < board.length; r++)
      for (int c = 0; c < board[0].length; c++)
        dfs(board, r, c, root, found);
    System.out.println(found);
  }
  static TrieNode buildTrie(String[] words) {
    TrieNode root = new TrieNode();
    for (String w : words) {
      TrieNode node = root;
      for (char ch : w.toCharArray()) {
        node.children.putIfAbsent(ch, new TrieNode());
        node = node.children.get(ch);
      }
      node.word = w;
    }
    return root;
  }
  static void dfs(char[][] board, int r, int c, TrieNode node, List<String> found) {
    if (r < 0 || r >= board.length || c < 0 || c >= board[0].length) return;
    char ch = board[r][c];
    if (ch == '#' || !node.children.containsKey(ch)) return;
    TrieNode nxt = node.children.get(ch);
    if (nxt.word != null) { found.add(nxt.word); nxt.word = null; }
    board[r][c] = '#';
    dfs(board, r+1, c, nxt, found);
    dfs(board, r-1, c, nxt, found);
    dfs(board, r, c+1, nxt, found);
    dfs(board, r, c-1, nxt, found);
    board[r][c] = ch;
  }
}
""",
    """
import java.util.*;
public class Main {
  static class TreeNode {
    int val; TreeNode left, right;
    TreeNode(int v) { val = v; }
  }
  public static void main(String[] args) {
    TreeNode root = new TreeNode(1);
    root.left = new TreeNode(2);
    root.right = new TreeNode(3);
    root.right.left = new TreeNode(4);
    root.right.right = new TreeNode(5);
    List<String> tokens = new ArrayList<>();
    serialize(root, tokens);
    String data = String.join(",", tokens);
    Deque<String> q = new ArrayDeque<>(Arrays.asList(data.split(",")));
    TreeNode rebuilt = deserialize(q);
    System.out.println(data);
  }
  static void serialize(TreeNode node, List<String> out) {
    if (node == null) { out.add("#"); return; }
    out.add(String.valueOf(node.val));
    serialize(node.left, out);
    serialize(node.right, out);
  }
  static TreeNode deserialize(Deque<String> q) {
    String val = q.poll();
    if (val.equals("#")) return null;
    TreeNode node = new TreeNode(Integer.parseInt(val));
    node.left = deserialize(q);
    node.right = deserialize(q);
    return node;
  }
}
""",
    """
public class Main {
  public static void main(String[] args) {
    int[] parent = new int[8];
    for (int i = 0; i < 8; i++) parent[i] = i;
    int[][] edges = {{1,2},{1,3},{2,3},{4,5},{5,6},{6,4}};
    int[] answer = null;
    for (int[] e : edges) {
      int a = e[0], b = e[1];
      int ra = find(parent, a), rb = find(parent, b);
      if (ra == rb) { answer = e; break; }
      parent[ra] = rb;
    }
    System.out.println(answer[0] + " " + answer[1]);
  }
  static int find(int[] parent, int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  }
}
""",
    """
import java.util.*;
public class Main {
  static class Node {
    int key, val;
    Node prev, next;
    Node(int k, int v) { key = k; val = v; }
  }
  public static void main(String[] args) {
    int capacity = 2;
    Map<Integer, Node> cache = new HashMap<>();
    Node head = new Node(0, 0), tail = new Node(0, 0);
    head.next = tail; tail.prev = head;

    put(cache, head, tail, capacity, 1, 1);
    put(cache, head, tail, capacity, 2, 2);
    int r1 = get(cache, head, 1);
    put(cache, head, tail, capacity, 3, 3);
    int r2 = get(cache, head, 2);
    put(cache, head, tail, capacity, 4, 4);
    int r3 = get(cache, head, 1);
    int r4 = get(cache, head, 3);
    int r5 = get(cache, head, 4);
    System.out.println(r1 + " " + r2 + " " + r3 + " " + r4 + " " + r5);
  }
  static void removeNode(Node node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  static void addFront(Node head, Node node) {
    node.prev = head;
    node.next = head.next;
    head.next.prev = node;
    head.next = node;
  }
  static int get(Map<Integer, Node> cache, Node head, int key) {
    if (!cache.containsKey(key)) return -1;
    Node node = cache.get(key);
    removeNode(node);
    addFront(head, node);
    return node.val;
  }
  static void put(Map<Integer, Node> cache, Node head, Node tail, int capacity, int key, int value) {
    if (cache.containsKey(key)) removeNode(cache.get(key));
    Node node = new Node(key, value);
    cache.put(key, node);
    addFront(head, node);
    if (cache.size() > capacity) {
      Node lru = tail.prev;
      removeNode(lru);
      cache.remove(lru.key);
    }
  }
}
""",
    """
import java.util.*;
public class Main {
  public static void main(String[] args) {
    int[] nums = {1, 3, -1, -3, 5, 3, 6, 7};
    int k = 3;
    Deque<Integer> window = new ArrayDeque<>();
    List<Integer> result = new ArrayList<>();
    for (int i = 0; i < nums.length; i++) {
      while (!window.isEmpty() && nums[window.peekLast()] < nums[i]) window.pollLast();
      window.offerLast(i);
      if (window.peekFirst() <= i - k) window.pollFirst();
      if (i >= k - 1) result.add(nums[window.peekFirst()]);
    }
    System.out.println(result);
  }
}
""",
    """
public class Main {
  public static void main(String[] args) {
    String s = "aab";
    String p = "c*a*b";
    boolean result = isMatch(s, p);
    System.out.println(result);
  }
  static boolean isMatch(String s, String p) {
    int n = s.length(), m = p.length();
    boolean[][] dp = new boolean[n + 1][m + 1];
    dp[0][0] = true;
    for (int j = 1; j <= m; j++) {
      if (p.charAt(j - 1) == '*') dp[0][j] = dp[0][j - 2];
    }
    for (int i = 1; i <= n; i++) {
      for (int j = 1; j <= m; j++) {
        char pc = p.charAt(j - 1);
        if (pc == s.charAt(i - 1) || pc == '.') {
          dp[i][j] = dp[i - 1][j - 1];
        } else if (pc == '*') {
          dp[i][j] = dp[i][j - 2];
          char prev = p.charAt(j - 2);
          if (prev == s.charAt(i - 1) || prev == '.') {
            dp[i][j] = dp[i][j] || dp[i - 1][j];
          }
        }
      }
    }
    return dp[n][m];
  }
}
""",
    """
import java.util.*;
public class Main {
  public static void main(String[] args) {
    int[] nums = {3, 2, 1, 5, 6, 4};
    int k = 2;
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int num : nums) {
      heap.offer(num);
      if (heap.size() > k) heap.poll();
    }
    System.out.println(heap.peek());
  }
}
"""
]

results = []
worker_script = "c:/All code/tutor/backend/java-worker/JavaWorker.java"

with tempfile.TemporaryDirectory() as td:
    for idx, code in enumerate(codes):
        print(f"Running problem {idx+1}...")
        src_file = os.path.join(td, "Main.java")
        with open(src_file, "w") as f:
            f.write(code)
            
        try:
            # java JavaWorker.java <srcFile>
            proc = subprocess.run(["java", worker_script, src_file], capture_output=True, text=True, timeout=15)
            if proc.returncode != 0:
                results.append({"problem": idx+1, "status": f"Process error: {proc.stderr}"})
                continue
                
            out = json.loads(proc.stdout)
            meta = out.get("meta", {})
            if meta.get("error"):
                results.append({"problem": idx+1, "status": f"Error: {meta['error']}"})
            else:
                steps = out.get("steps", [])
                last_vars = steps[-1].get("locals", {}) if steps else {}
                if steps and steps[-1].get("event") == "print" and len(steps) > 1:
                    last_vars = steps[-2].get("locals", {})
                results.append({"problem": idx+1, "status": "Success", "steps": len(steps), "last_vars": last_vars})
        except subprocess.TimeoutExpired:
            results.append({"problem": idx+1, "status": "Timeout"})
        except Exception as e:
            results.append({"problem": idx+1, "status": f"Exception: {str(e)}"})

with open("c:/All code/tutor/backend/java_test_results.json", "w") as f:
    json.dump(results, f, indent=2)
print("Done. Saved to java_test_results.json")
