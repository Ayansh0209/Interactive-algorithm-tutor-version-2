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
];

export function examplesFor(language) {
  return EXAMPLES.filter((e) => e.language === language);
}
