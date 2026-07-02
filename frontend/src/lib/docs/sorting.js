// Docs topics: sorting. Two demos use Java to show the engine is language-agnostic.

export const sortingTopics = [
  {
    slug: "bubble-sort", category: "sorting", title: "Bubble Sort", premade: "sort-bubble",
    summary: "Repeatedly compare adjacent pairs and swap them if out of order; the largest value bubbles to the end each pass. Simple but O(n²).",
    sections: [
      { heading: "How it works", body: "Each pass walks the array swapping out-of-order neighbours, so after pass k the k largest elements are parked at the end. Stop early if a pass makes no swaps." },
      { heading: "Why it's slow", body: "Up to n passes of n comparisons gives O(n²). It's mainly a teaching tool — but a great one for seeing comparisons and swaps." },
    ],
    complexity: [["Time (worst/avg)", "O(n²)"], ["Best", "O(n)"], ["Space", "O(1)"]],
    demo: { language: "java", code: `public class Main {\n  public static void main(String[] args) {\n    int[] arr = {5, 2, 9, 1, 6};\n    int n = arr.length;\n    for (int i = 0; i < n - 1; i++) {\n      for (int j = 0; j < n - 1 - i; j++) {\n        if (arr[j] > arr[j + 1]) {\n          int t = arr[j];\n          arr[j] = arr[j + 1];\n          arr[j + 1] = t;\n        }\n      }\n    }\n    System.out.println(arr[0]);\n  }\n}\n` },
  },
  {
    slug: "selection-sort", category: "sorting", title: "Selection Sort", premade: "sort-selection",
    summary: "Each pass scans the unsorted part for the minimum and swaps it to the front. O(n²) comparisons but at most n swaps.",
    sections: [
      { heading: "Find min, place it", body: "Select the smallest remaining element and move it just after the sorted prefix. The prefix grows by one each pass." },
      { heading: "Few writes", body: "Unlike bubble/insertion, selection sort does only O(n) swaps — handy when writes are expensive — though it always does O(n²) comparisons." },
    ],
    complexity: [["Time", "O(n²)"], ["Swaps", "O(n)"], ["Space", "O(1)"]],
    demo: { language: "python", code: `a = [5, 2, 9, 1, 6]\nn = len(a)\nfor i in range(n):\n    m = i\n    for j in range(i + 1, n):\n        if a[j] < a[m]:\n            m = j\n    a[i], a[m] = a[m], a[i]\nprint(a)\n` },
  },
  {
    slug: "insertion-sort", category: "sorting", title: "Insertion Sort", premade: "sort-insertion",
    summary: "Grow a sorted prefix by inserting each next element into its correct place. Fast on small or nearly-sorted data.",
    sections: [
      { heading: "Insert into place", body: "Take the next element and shift larger sorted elements right until it slots in. Like sorting a hand of cards." },
      { heading: "Adaptive", body: "On nearly-sorted input it runs in nearly O(n), which is why hybrid sorts switch to insertion sort for small subarrays." },
    ],
    complexity: [["Time (worst)", "O(n²)"], ["Best", "O(n)"], ["Space", "O(1)"]],
    demo: { language: "java", code: `public class Main {\n  public static void main(String[] args) {\n    int[] a = {5, 2, 9, 1, 6};\n    for (int i = 1; i < a.length; i++) {\n      int key = a[i];\n      int j = i - 1;\n      while (j >= 0 && a[j] > key) {\n        a[j + 1] = a[j];\n        j--;\n      }\n      a[j + 1] = key;\n    }\n    System.out.println(a[0]);\n  }\n}\n` },
  },
  {
    slug: "merge-sort", category: "sorting", title: "Merge Sort", premade: "sort-merge",
    summary: "Divide the array in half, sort each half, then merge the two sorted halves. Stable, guaranteed O(n log n).",
    sections: [
      { heading: "Divide and conquer", body: "Recurse until subarrays have one element (trivially sorted), then merge pairs of sorted runs back up. The merge is the workhorse." },
      { heading: "Trade-offs", body: "Always O(n log n) and stable, but needs O(n) extra space for merging. The basis of external sorting for huge datasets." },
    ],
    complexity: [["Time", "O(n log n)"], ["Space", "O(n)"], ["Stable", "yes"]],
    demo: { language: "python", code: `def merge_sort(a):\n    if len(a) <= 1:\n        return a\n    mid = len(a) // 2\n    left = merge_sort(a[:mid])\n    right = merge_sort(a[mid:])\n    res = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            res.append(left[i]); i += 1\n        else:\n            res.append(right[j]); j += 1\n    res.extend(left[i:]); res.extend(right[j:])\n    return res\n\nprint(merge_sort([5, 2, 9, 1, 6]))\n` },
  },
  {
    slug: "quick-sort", category: "sorting", title: "Quick Sort", premade: "sort-quick",
    summary: "Pick a pivot, partition elements smaller/larger around it, then recurse on each side. Fast in practice — O(n log n) average.",
    sections: [
      { heading: "Partition around a pivot", body: "Rearrange so everything left of the pivot is smaller and everything right is larger; the pivot is now in its final spot. Recurse on the two sides." },
      { heading: "Average vs worst", body: "Good pivots give O(n log n); already-sorted input with a naive pivot degrades to O(n²). Randomized or median-of-three pivots avoid that in practice." },
    ],
    complexity: [["Time (avg)", "O(n log n)"], ["Worst", "O(n²)"], ["Space", "O(log n)"]],
    demo: { language: "python", code: `def quick(a, lo, hi):\n    if lo >= hi:\n        return\n    pivot = a[hi]\n    i = lo\n    for j in range(lo, hi):\n        if a[j] < pivot:\n            a[i], a[j] = a[j], a[i]\n            i += 1\n    a[i], a[hi] = a[hi], a[i]\n    quick(a, lo, i - 1)\n    quick(a, i + 1, hi)\n\narr = [5, 2, 9, 1, 6]\nquick(arr, 0, len(arr) - 1)\nprint(arr)\n` },
  },
  {
    slug: "heap-sort", category: "sorting", title: "Heap Sort", premade: "sort-heap",
    summary: "Build a max-heap, then repeatedly swap the root to the end and re-heapify. In-place O(n log n).",
    sections: [
      { heading: "Heap then extract", body: "Heapify the array so the max is at the root, swap it with the last element, shrink the heap, and sift the new root down. Repeat." },
      { heading: "In-place but unstable", body: "Heap sort sorts within the array (O(1) extra) with guaranteed O(n log n), but it isn't stable and has poor cache behaviour versus quicksort." },
    ],
    complexity: [["Time", "O(n log n)"], ["Space", "O(1)"], ["Stable", "no"]],
    demo: { language: "python", code: `import heapq\na = [5, 2, 9, 1, 6]\nheapq.heapify(a)\nout = [heapq.heappop(a) for _ in range(len(a))]\nprint(out)\n` },
  },
  {
    slug: "counting-sort", category: "sorting", title: "Counting Sort",
    summary: "Sort small-range integers by counting occurrences, not comparing. Linear O(n + k) when the value range k is modest.",
    sections: [
      { heading: "Count then place", body: "Tally how many times each value appears, take a prefix sum of counts to find positions, then place each element directly. No comparisons." },
      { heading: "Range-bound", body: "Only practical when the value range k is comparable to n — it uses O(k) space. It's the building block of radix sort." },
    ],
    complexity: [["Time", "O(n + k)"], ["Space", "O(k)"]],
    demo: { language: "python", code: `a = [3, 1, 4, 1, 5, 2, 0, 3]\nk = max(a) + 1\ncount = [0] * k\nfor x in a:\n    count[x] += 1\nout = []\nfor v in range(k):\n    out.extend([v] * count[v])\nprint(out)\n` },
  },
  {
    slug: "radix-sort", category: "sorting", title: "Radix Sort",
    summary: "Sort integers digit by digit (least-significant first) using a stable counting sort on each digit. Linear for fixed-width keys.",
    sections: [
      { heading: "Digit by digit", body: "Stably sort by the ones digit, then the tens, then the hundreds. After the most-significant digit pass, the whole array is sorted." },
      { heading: "Why stable matters", body: "Each pass must preserve the order established by previous digits — that's why the per-digit sort must be stable (counting sort)." },
    ],
    complexity: [["Time", "O(d·(n + b))"], ["Space", "O(n + b)"]],
    demo: { language: "python", code: `a = [170, 45, 75, 90, 2, 802, 24, 66]\ndef counting_by_digit(a, exp):\n    out = [0] * len(a)\n    count = [0] * 10\n    for x in a:\n        count[(x // exp) % 10] += 1\n    for i in range(1, 10):\n        count[i] += count[i - 1]\n    for x in reversed(a):\n        d = (x // exp) % 10\n        count[d] -= 1\n        out[count[d]] = x\n    return out\nexp = 1\nwhile max(a) // exp > 0:\n    a = counting_by_digit(a, exp)\n    exp *= 10\nprint(a)\n` },
  },
];
