// Built-in examples per language. Each shows off a different detector/renderer.

export const EXAMPLES = [
  // ---------------------------------------------------------------- Python
  {
    id: "py_bubble", language: "python", title: "Bubble Sort (array + swaps)",
    code: `arr = [5, 2, 9, 1, 6]
n = len(arr)
for i in range(n):
    for j in range(n - i - 1):
        if arr[j] > arr[j + 1]:
            arr[j], arr[j + 1] = arr[j + 1], arr[j]
`,
  },
  {
    id: "py_linkedlist", language: "python", title: "Reverse a Linked List",
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

head = Node(1)
head.next = Node(2)
head.next.next = Node(3)

prev = None
curr = head
while curr:
    nxt = curr.next
    curr.next = prev
    prev = curr
    curr = nxt
`,
  },
  {
    id: "py_fib", language: "python", title: "Fibonacci (recursion + memo)",
    code: `memo = {}
def fib(n):
    if n < 2:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fib(n - 1) + fib(n - 2)
    return memo[n]

result = fib(7)
`,
  },
  {
    id: "py_twoptr", language: "python", title: "Two Pointer (pair sum)",
    code: `arr = [1, 2, 4, 6, 8, 11]
target = 10
left = 0
right = len(arr) - 1
while left < right:
    s = arr[left] + arr[right]
    if s == target:
        break
    elif s < target:
        left += 1
    else:
        right -= 1
`,
  },
  {
    id: "py_nqueens", language: "python", title: "N-Queens (backtracking)",
    code: `def solve(n):
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

out = solve(4)
`,
  },

  // ------------------------------------------------------------------ Java
  {
    id: "java_bubble", language: "java", title: "Bubble Sort (array + swaps)",
    code: `public class Main {
  public static void main(String[] args) {
    int[] arr = {5, 2, 9, 1, 6};
    int n = arr.length;
    for (int i = 0; i < n; i++) {
      for (int j = 0; j < n - 1 - i; j++) {
        if (arr[j] > arr[j + 1]) {
          int t = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = t;
        }
      }
    }
    System.out.println(arr[0]);
  }
}
`,
  },
  {
    id: "java_linkedlist", language: "java", title: "Linked List traversal",
    code: `public class Main {
  static class Node {
    int val; Node next;
    Node(int v) { val = v; }
  }
  public static void main(String[] args) {
    Node head = new Node(1);
    head.next = new Node(2);
    head.next.next = new Node(3);
    int sum = 0;
    Node cur = head;
    while (cur != null) {
      sum += cur.val;
      cur = cur.next;
    }
    System.out.println(sum);
  }
}
`,
  },
  {
    id: "java_fact", language: "java", title: "Factorial (recursion)",
    code: `public class Main {
  static int fact(int n) {
    if (n <= 1) return 1;
    return n * fact(n - 1);
  }
  public static void main(String[] args) {
    System.out.println(fact(5));
  }
}
`,
  },
  {
    id: "java_stdin", language: "java", title: "Sum from input (Scanner)",
    code: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    int total = 0;
    for (int i = 0; i < n; i++) {
      total += sc.nextInt();
    }
    System.out.println(total);
  }
}
`,
  },

  // ------------------------------------------------------------------- C++
  {
    id: "cpp_bubble", language: "cpp", title: "Bubble Sort (vector + swaps)",
    code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<int> arr = {5, 2, 9, 1, 6};
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                int t = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = t;
            }
        }
    }
    for (int x : arr) cout << x << " ";
    cout << endl;
}
`,
  },
  {
    id: "cpp_binsearch", language: "cpp", title: "Binary Search",
    code: `#include <bits/stdc++.h>
using namespace std;

int search(vector<int>& a, int target) {
    int lo = 0, hi = a.size() - 1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (a[mid] == target) return mid;
        else if (a[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

int main() {
    vector<int> a = {1, 3, 5, 7, 9, 11, 13};
    int idx = search(a, 9);
    cout << "found at " << idx << endl;
}
`,
  },
  {
    id: "cpp_fib", language: "cpp", title: "Fibonacci (recursion)",
    code: `#include <bits/stdc++.h>
using namespace std;

int fib(int n) {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}

int main() {
    int result = fib(6);
    cout << result << endl;
}
`,
  },
  {
    id: "cpp_twosum", language: "cpp", title: "Two Sum (hash map)",
    code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); i++) {
        int need = target - nums[i];
        if (seen.count(need)) {
            cout << seen[need] << " " << i << endl;
            break;
        }
        seen[nums[i]] = i;
    }
}
`,
  },
  {
    id: "cpp_dp", language: "cpp", title: "Coin Change (DP grid)",
    code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<int> coins = {1, 2, 5};
    int amount = 6;
    vector<vector<int>> dp(coins.size() + 1, vector<int>(amount + 1, 1e9));
    for (int i = 0; i <= (int)coins.size(); i++) dp[i][0] = 0;
    for (int i = 1; i <= (int)coins.size(); i++) {
        for (int j = 1; j <= amount; j++) {
            dp[i][j] = dp[i - 1][j];
            if (coins[i - 1] <= j)
                dp[i][j] = min(dp[i][j], dp[i][j - coins[i - 1]] + 1);
        }
    }
    cout << dp[coins.size()][amount] << endl;
}
`,
  },
];

export function examplesFor(language) {
  return EXAMPLES.filter((e) => e.language === language);
}
