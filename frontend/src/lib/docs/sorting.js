// Docs topics: sorting. Two demos use Java to show the engine is language-agnostic.
// Rich fields render via DocArticle.

export const sortingTopics = [
  {
    slug: "bubble-sort", category: "sorting", title: "Bubble Sort", premade: "sort-bubble",
    summary: "Repeatedly compare adjacent pairs and swap them if out of order; on each pass the largest remaining value 'bubbles' to the end. Simple to picture, but O(n²).",
    keyIdea: "Fixing every out-of-order *neighbour* eventually sorts the whole array — the biggest element floats to the top of each pass like a bubble.",
    howItWorks: {
      intro: "Each pass sweeps left to right swapping bad neighbours:",
      steps: [
        "Compare `a[j]` and `a[j+1]`; if they're out of order, **swap** them.",
        "By the end of a pass, the largest unsorted element has been carried to its final position at the end.",
        "The next pass can stop one element earlier — the tail is already sorted.",
        "**Early exit:** if a whole pass makes no swaps, the array is sorted — best case `O(n)`.",
      ],
    },
    sections: [
      { heading: "How it works", body: "Each pass walks the array swapping out-of-order neighbours, so after pass `k` the `k` largest elements are parked at the end. Adding an 'any swaps this pass?' flag lets it **stop early** on already-sorted input." },
      { heading: "Why it's slow", body: "Up to `n` passes of `n` comparisons gives `O(n²)`, and it moves elements one position at a time — the most swaps of any elementary sort. It's mainly a **teaching tool**, but a great one for *seeing* comparisons and swaps step by step." },
    ],
    complexity: [["Time (worst / avg)", "O(n²)"], ["Best (sorted, with flag)", "O(n)"], ["Swaps (worst)", "O(n²)"], ["Space", "O(1)"], ["Stable", "yes"]],
    pitfalls: [
      "Without the early-exit flag it's `O(n²)` even on already-sorted input.",
      "It does the **most swaps** of the elementary sorts — avoid when writes are costly.",
      "Never use it in production; it's a pedagogical sort.",
    ],
    whenToUse: {
      use: ["Teaching / visualizing sorting", "Tiny arrays where simplicity trumps speed"],
      avoid: ["Anything performance-sensitive (use the language's built-in sort)"],
    },
    realWorld: ["Almost never in practice — it's a teaching sort", "Detecting 'is this already sorted?' (one flagged pass)"],
    references: [{ book: "Knuth, TAOCP Vol. 3", where: "§5.2.2, Sorting by Exchanging" }, { book: "CLRS", where: "Problem 2-2, Bubblesort" }],
    demo: { language: "java", code: `public class Main {\n  public static void main(String[] args) {\n    int[] arr = {5, 2, 9, 1, 6};\n    int n = arr.length;\n    for (int i = 0; i < n - 1; i++) {\n      for (int j = 0; j < n - 1 - i; j++) {\n        if (arr[j] > arr[j + 1]) {\n          int t = arr[j];\n          arr[j] = arr[j + 1];\n          arr[j + 1] = t;\n        }\n      }\n    }\n    System.out.println(arr[0]);\n  }\n}\n` },
  },
  {
    slug: "selection-sort", category: "sorting", title: "Selection Sort", premade: "sort-selection",
    summary: "Each pass scans the unsorted part for the minimum and swaps it to the front. Always O(n²) comparisons, but at most n swaps — the fewest writes of the elementary sorts.",
    keyIdea: "Repeatedly pick the smallest remaining element and place it — the sorted prefix grows by one each pass, and each element is written at most once.",
    howItWorks: {
      intro: "Grow a sorted prefix from the left:",
      steps: [
        "Scan the unsorted suffix `a[i…n-1]` to find the index of the **minimum**.",
        "**Swap** that minimum into position `i` (the front of the unsorted part).",
        "The sorted prefix `a[0…i]` is now correct and final.",
        "Advance `i`. Exactly one swap per pass → at most `n` swaps total.",
      ],
    },
    sections: [
      { heading: "Find min, place it", body: "Select the smallest remaining element and move it just after the sorted prefix, which grows by one each pass. Unlike bubble sort, an element, once placed, is never touched again." },
      { heading: "Few writes, many reads", body: "Selection sort does only `O(n)` swaps — the minimum possible for a comparison sort that moves whole elements — which matters when **writes are expensive** (e.g. flash memory, or sorting records by a heavy payload). But it *always* does `O(n²)` comparisons, even on sorted input, and it isn't stable." },
    ],
    complexity: [["Time (all cases)", "O(n²)"], ["Swaps", "O(n)", "the fewest of the O(n²) sorts"], ["Space", "O(1)"], ["Stable", "no"]],
    pitfalls: [
      "It never adapts — sorted input is still `O(n²)` comparisons.",
      "It isn't **stable** (swapping can jump an equal element past another).",
    ],
    whenToUse: {
      use: ["Writes are far costlier than comparisons", "Very small arrays", "Teaching the 'find-and-place' pattern"],
      avoid: ["Large data, or when stability matters"],
    },
    references: [{ book: "CLRS", where: "Exercise 2.2-2, Selection sort" }, { book: "Sedgewick & Wayne", where: "§2.1, Elementary Sorts" }],
    demo: { language: "python", code: `a = [5, 2, 9, 1, 6]\nn = len(a)\nfor i in range(n):\n    m = i\n    for j in range(i + 1, n):\n        if a[j] < a[m]:\n            m = j\n    a[i], a[m] = a[m], a[i]\nprint(a)\n` },
  },
  {
    slug: "insertion-sort", category: "sorting", title: "Insertion Sort", premade: "sort-insertion",
    summary: "Grow a sorted prefix by inserting each next element into its correct place, like arranging a hand of cards. Genuinely fast on small or nearly-sorted data.",
    keyIdea: "Keep the left part sorted; for each new element, slide it left past everything bigger until it drops into place.",
    howItWorks: {
      intro: "Insert `a[i]` into the already-sorted prefix `a[0…i-1]`:",
      steps: [
        "Hold `key = a[i]` aside.",
        "Shift every prefix element **greater than** `key` one slot to the right.",
        "Drop `key` into the gap that opens up — the prefix is sorted again, now one longer.",
        "On nearly-sorted data each element barely moves, so it approaches **O(n)**.",
      ],
    },
    sections: [
      { heading: "Insert into place", body: "Take the next element and shift larger sorted elements right until it slots in — exactly how most people sort a hand of playing cards. It's **stable** and **in-place**, and it sorts **online** (it can absorb new elements as they arrive)." },
      { heading: "Adaptive — the reason it survives", body: "On nearly-sorted input it runs in nearly `O(n)`, because each element only shifts a little. That's why real hybrid sorts — **Timsort** (Python, Java) and **introsort** (C++) — fall back to insertion sort for small or almost-ordered subarrays, where its tiny constant factor beats the fancy `O(n log n)` sorts." },
    ],
    complexity: [["Time (worst)", "O(n²)"], ["Best (nearly sorted)", "O(n)"], ["Space", "O(1)"], ["Stable", "yes"]],
    pitfalls: [
      "The shifting inner loop must stop at `j < 0` — a missing bound reads before the array.",
      "It's still `O(n²)` on reverse-sorted input; it's 'fast' only when data is nearly ordered.",
    ],
    whenToUse: {
      use: ["Small arrays (n ≲ 16)", "Nearly-sorted / streaming data", "The base case inside Timsort / introsort", "When stability is required and n is small"],
      avoid: ["Large, randomly-ordered arrays"],
    },
    variants: [
      { name: "Binary insertion sort", note: "Binary-search the insertion point — fewer comparisons, same shifts." },
      { name: "Shell sort", note: "Insertion sort over gapped subsequences — breaks the O(n²) barrier." },
    ],
    realWorld: ["Base case of Timsort & introsort", "Sorting small or streaming inputs", "Online sorting as data arrives"],
    references: [{ book: "CLRS", where: "§2.1, Insertion Sort" }, { book: "Sedgewick & Wayne", where: "§2.1" }],
    demo: { language: "java", code: `public class Main {\n  public static void main(String[] args) {\n    int[] a = {5, 2, 9, 1, 6};\n    for (int i = 1; i < a.length; i++) {\n      int key = a[i];\n      int j = i - 1;\n      while (j >= 0 && a[j] > key) {\n        a[j + 1] = a[j];\n        j--;\n      }\n      a[j + 1] = key;\n    }\n    System.out.println(a[0]);\n  }\n}\n` },
  },
  {
    slug: "merge-sort", category: "sorting", title: "Merge Sort", premade: "sort-merge",
    summary: "Divide the array in half, sort each half recursively, then merge the two sorted halves. Stable, with a guaranteed O(n log n) — the divide-and-conquer archetype.",
    keyIdea: "Merging two already-sorted lists is easy and linear; do that all the way up a halving recursion and you've sorted everything in O(n log n), guaranteed.",
    howItWorks: {
      intro: "Divide and conquer:",
      steps: [
        "**Divide:** split the array into two halves.",
        "**Conquer:** recursively merge-sort each half (base case: a single element is already sorted).",
        "**Merge:** walk the two sorted halves with two pointers, repeatedly taking the smaller front element into the output.",
        "The recursion is `log n` deep and each level does `O(n)` merging → `O(n log n)` in *every* case.",
      ],
    },
    sections: [
      { heading: "Divide and conquer", body: "Recurse until subarrays have one element (trivially sorted), then merge pairs of sorted runs back up. The **merge** is the workhorse: two pointers, one comparison per output element, so a merge of `n` elements is `O(n)`. Taking `left[i] <= right[j]` (not `<`) is what makes the sort **stable**." },
      { heading: "Trade-offs & external sorting", body: "Merge sort is always `O(n log n)` and stable, but classically needs `O(n)` scratch space for the merge. Its sequential access pattern makes it the basis of **external sorting** — sorting data far larger than RAM by merging sorted runs streamed from disk — and of parallel sorts." },
    ],
    complexity: [["Time (all cases)", "O(n log n)"], ["Space", "O(n)", "merge buffer"], ["Stable", "yes"]],
    pitfalls: [
      "Allocating a new buffer inside every recursive merge thrashes memory — allocate once and reuse.",
      "Use `<=` in the merge comparison to keep it **stable**.",
      "The `O(n)` extra space rules it out where memory is tight (use heapsort/quicksort).",
    ],
    whenToUse: {
      use: ["Guaranteed `O(n log n)` needed", "**Stable** sort required (Timsort is a merge-sort descendant)", "**External** sorting (data > RAM)", "Linked lists (merge sort needs no random access)"],
      avoid: ["Memory-constrained in-place sorting (use heapsort)", "Small arrays (insertion sort's constant wins)"],
    },
    variants: [
      { name: "Timsort", note: "Merge sort + insertion sort exploiting existing runs — Python/Java's default." },
      { name: "Bottom-up merge sort", note: "Iterative, no recursion — great for linked lists." },
      { name: "In-place merge", note: "Trades time for O(1) space merging (tricky, rarely worth it)." },
    ],
    realWorld: ["Python `sorted` / Java `Arrays.sort` (Timsort)", "External / disk-based sorting", "Sorting linked lists", "Counting inversions"],
    references: [{ book: "CLRS", where: "§2.3, Designing Algorithms (merge sort)" }, { book: "Knuth, TAOCP Vol. 3", where: "§5.2.4, Sorting by Merging" }],
    demo: { language: "python", code: `def merge_sort(a):\n    if len(a) <= 1:\n        return a\n    mid = len(a) // 2\n    left = merge_sort(a[:mid])\n    right = merge_sort(a[mid:])\n    res = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            res.append(left[i]); i += 1\n        else:\n            res.append(right[j]); j += 1\n    res.extend(left[i:]); res.extend(right[j:])\n    return res\n\nprint(merge_sort([5, 2, 9, 1, 6]))\n` },
  },
  {
    slug: "quick-sort", category: "sorting", title: "Quick Sort", premade: "sort-quick",
    summary: "Pick a pivot, partition elements smaller/larger around it, then recurse on each side. The fastest general-purpose sort in practice — O(n log n) average, in place.",
    keyIdea: "Partitioning puts the pivot in its final home with everything smaller to its left and larger to its right, so the two sides can be sorted independently — no merge needed.",
    howItWorks: {
      intro: "Partition around a pivot, then recurse:",
      steps: [
        "Choose a **pivot** (here, the last element).",
        "**Partition:** rearrange so smaller elements come before the pivot and larger after; the pivot lands in its **final** position `p`.",
        "The pivot is done — never moved again.",
        "**Recurse** on `a[lo…p-1]` and `a[p+1…hi]`.",
        "Balanced partitions give `O(n log n)`; consistently lopsided ones give `O(n²)`.",
      ],
    },
    sections: [
      { heading: "Partition around a pivot", body: "Rearrange so everything left of the pivot is smaller and everything right is larger; the pivot is now in its final spot, then recurse on the two sides. Unlike merge sort there's **no merge step** and it works **in place** — a big constant-factor and cache advantage that makes it the fastest sort in practice." },
      { heading: "Average vs worst (and how to tame it)", body: "Good pivots halve the array and give `O(n log n)`; a naive last-element pivot on **already-sorted** input produces maximally unbalanced splits and degrades to `O(n²)`. **Randomized** pivots or **median-of-three** make the worst case astronomically unlikely, and **introsort** switches to heapsort if the recursion goes too deep — guaranteeing `O(n log n)`. Note quicksort is **not stable**." },
    ],
    complexity: [["Time (average)", "O(n log n)"], ["Time (worst)", "O(n²)", "bad pivots"], ["Space", "O(log n)", "recursion stack"], ["Stable", "no"]],
    pitfalls: [
      "A fixed first/last-element pivot is `O(n²)` on sorted or reverse-sorted input — randomize or use median-of-three.",
      "Recursing on the larger side first risks `O(n)` stack depth; recurse on the smaller side, loop on the larger.",
      "It's **not stable** — don't use it when equal-key order must be preserved.",
    ],
    whenToUse: {
      use: ["General-purpose in-memory sorting (fastest in practice)", "When O(1)-ish extra space matters", "As introsort's main engine (C++ `std::sort`)"],
      avoid: ["Stability required (**merge sort / Timsort**)", "Guaranteed worst case required without the introsort guard"],
    },
    variants: [
      { name: "Introsort", note: "Quicksort + heapsort fallback + insertion base — C++ `std::sort`." },
      { name: "3-way (Dutch flag) quicksort", note: "Handles many duplicate keys in linear time." },
      { name: "Quickselect", note: "Partition-based k-th smallest in O(n) average." },
    ],
    realWorld: ["C++ `std::sort` (introsort)", "Many language runtime sorts for primitives", "Quickselect for medians / top-k", "Database sort operators"],
    references: [{ book: "CLRS", where: "Ch. 7, Quicksort" }, { book: "Sedgewick & Wayne", where: "§2.3, Quicksort" }, { book: "Hoare (1962)", where: "Quicksort, Computer Journal" }],
    demo: { language: "python", code: `def quick(a, lo, hi):\n    if lo >= hi:\n        return\n    pivot = a[hi]\n    i = lo\n    for j in range(lo, hi):\n        if a[j] < pivot:\n            a[i], a[j] = a[j], a[i]\n            i += 1\n    a[i], a[hi] = a[hi], a[i]\n    quick(a, lo, i - 1)\n    quick(a, i + 1, hi)\n\narr = [5, 2, 9, 1, 6]\nquick(arr, 0, len(arr) - 1)\nprint(arr)\n` },
  },
  {
    slug: "heap-sort", category: "sorting", title: "Heap Sort", premade: "sort-heap",
    summary: "Build a max-heap in place, then repeatedly swap the root to the end and re-heapify the shrinking front. Guaranteed O(n log n) with O(1) extra space.",
    keyIdea: "A heap hands you the maximum in O(1); park it at the end, shrink the heap, and repeat — sorting the array using only the array itself.",
    howItWorks: {
      intro: "Two phases, both in place:",
      steps: [
        "**Build** a max-heap over the whole array in `O(n)` (sift down from the last parent up).",
        "The maximum is now at index `0`. **Swap** it with the last element of the heap.",
        "**Shrink** the heap by one and **sift down** the new root to restore the heap property.",
        "Repeat until the heap has one element — the array is sorted, using `O(1)` extra space.",
      ],
    },
    sections: [
      { heading: "Heap then extract", body: "Heapify the array so the max is at the root, swap it with the last element, shrink the heap by one, and sift the new root down. Each of the `n` extractions is `O(log n)`, so the sort phase is `O(n log n)` on top of the `O(n)` build." },
      { heading: "In-place but cache-unfriendly", body: "Heap sort's great virtues are a **guaranteed** `O(n log n)` (no bad-pivot worst case) and `O(1)` extra space. Its weaknesses: it isn't **stable**, and its jumpy parent↔child index pattern has **poor cache locality**, so quicksort usually beats it in wall-clock time. It shines as the safety-net fallback inside **introsort**." },
    ],
    complexity: [["Time (all cases)", "O(n log n)"], ["Space", "O(1)", "in place"], ["Stable", "no"]],
    pitfalls: [
      "Sift-down index arithmetic (children at `2i+1`, `2i+2`) is easy to get wrong.",
      "It's **not stable** and has poorer cache behaviour than quicksort/merge sort.",
      "Use a **max**-heap to sort ascending in place (a min-heap sorts descending).",
    ],
    whenToUse: {
      use: ["Guaranteed `O(n log n)` **and** `O(1)` space", "Worst-case-sensitive systems (real-time)", "Introsort's fallback path"],
      avoid: ["Stability required", "Raw speed on typical data (quicksort's locality wins)"],
    },
    references: [{ book: "CLRS", where: "Ch. 6, Heapsort" }, { book: "Williams (1964)", where: "Algorithm 232: Heapsort" }],
    demo: { language: "python", code: `import heapq\na = [5, 2, 9, 1, 6]\nheapq.heapify(a)\nout = [heapq.heappop(a) for _ in range(len(a))]\nprint(out)\n` },
  },
  {
    slug: "counting-sort", category: "sorting", title: "Counting Sort",
    summary: "Sort small-range integers by counting occurrences instead of comparing — beating the O(n log n) comparison lower bound with linear O(n + k) time.",
    keyIdea: "If keys are integers in a small range, you don't have to *compare* them — just tally how many of each there are and lay them out in order.",
    howItWorks: {
      intro: "Count, accumulate, place:",
      steps: [
        "**Count:** tally occurrences of each value into `count[0…k-1]`.",
        "**Accumulate:** take a running (prefix) sum so `count[v]` becomes the final position just past the last `v`.",
        "**Place:** scan the input (right to left, for stability) and drop each element at its computed slot, decrementing the count.",
        "No comparisons happen — the arithmetic *is* the sort → `O(n + k)`.",
      ],
    },
    sections: [
      { heading: "Count then place", body: "Tally how many times each value appears, take a **prefix sum** of the counts to find each value's output position, then place elements directly. Because it never compares two keys, it sidesteps the `Ω(n log n)` comparison-sort lower bound. Scanning the input in reverse during placement keeps it **stable**." },
      { heading: "Range-bound", body: "Counting sort is only practical when the value range `k` is comparable to `n` — it uses `O(k)` space, so sorting 32-bit integers directly would need a 4-billion-entry table. Its real importance is as the **stable, per-digit building block of radix sort**, which lifts that restriction." },
    ],
    complexity: [["Time", "O(n + k)"], ["Space", "O(n + k)"], ["Stable", "yes"], ["Comparisons", "0"]],
    pitfalls: [
      "`k` (the value range) can dwarf `n` — a huge range makes it wildly memory-hungry.",
      "Only works for **integer / discretizable** keys, not arbitrary comparables.",
      "Placing left-to-right instead of right-to-left breaks **stability** (which radix sort relies on).",
    ],
    whenToUse: {
      use: ["Integers in a small, known range", "Sorting by a bounded key (age, grade, byte)", "As the digit-sort inside radix sort"],
      avoid: ["Large or unknown value ranges", "Floating-point / arbitrary comparable keys"],
    },
    references: [{ book: "CLRS", where: "§8.2, Counting Sort (and the §8.1 lower bound)" }, { book: "Knuth, TAOCP Vol. 3", where: "§5.2, Distribution sorting" }],
    demo: { language: "python", code: `a = [3, 1, 4, 1, 5, 2, 0, 3]\nk = max(a) + 1\ncount = [0] * k\nfor x in a:\n    count[x] += 1\nout = []\nfor v in range(k):\n    out.extend([v] * count[v])\nprint(out)\n` },
  },
  {
    slug: "radix-sort", category: "sorting", title: "Radix Sort",
    summary: "Sort integers digit by digit (least-significant first) using a stable counting sort on each digit — linear time for fixed-width keys.",
    keyIdea: "Sort by one digit at a time, least-significant first; as long as each pass is *stable*, sorting the most-significant digit last leaves the whole array sorted.",
    howItWorks: {
      intro: "LSD (least-significant-digit) radix sort:",
      steps: [
        "**Stably** sort the array by the ones digit (a counting sort on digits 0–9).",
        "Then stably sort by the tens digit — ties keep their ones-digit order.",
        "Then the hundreds, and so on, up to the most-significant digit.",
        "After the last digit pass the array is fully sorted, in `O(d·(n + b))` for `d` digits and base `b`.",
      ],
    },
    sections: [
      { heading: "Digit by digit", body: "Stably sort by the ones digit, then the tens, then the hundreds. After the most-significant-digit pass the whole array is sorted — a surprising and beautiful consequence of stability. For `d`-digit numbers in base `b`, it's `O(d·(n + b))`; when `d` is a small constant (fixed-width keys), that's effectively **linear**." },
      { heading: "Why stability matters", body: "Each pass must **preserve** the order established by earlier (less-significant) digits — that's the whole trick, and it's precisely why the per-digit sort must be **stable** (counting sort). Choosing a larger base `b` (e.g. bytes, base 256) does fewer passes at the cost of a bigger count array — a classic time/space tuning knob." },
    ],
    complexity: [["Time", "O(d · (n + b))"], ["Space", "O(n + b)"], ["Stable", "yes"]],
    pitfalls: [
      "The per-digit sort **must be stable**, or earlier digits' order is destroyed.",
      "Negative numbers and floats need special key encoding (bias / bit tricks).",
      "It only beats comparison sorts when `d` (key width) is small relative to `log n`.",
    ],
    whenToUse: {
      use: ["Fixed-width integer / string keys", "Very large datasets of bounded-width keys", "When you need to beat `O(n log n)`"],
      avoid: ["Arbitrary comparable objects", "Wide or variable-length keys where `d` is large"],
    },
    variants: [
      { name: "MSD radix sort", note: "Most-significant digit first — natural for strings, sorts by prefix." },
      { name: "Bucket sort", note: "Distribute into buckets by value range, sort each — cousin of counting/radix." },
    ],
    realWorld: ["Sorting large integer / fixed-key datasets", "Suffix-array construction", "GPU / parallel sorts", "Sorting IP addresses, timestamps"],
    references: [{ book: "CLRS", where: "§8.3, Radix Sort" }, { book: "Knuth, TAOCP Vol. 3", where: "§5.2.5, Sorting by Distribution" }],
    demo: { language: "python", code: `a = [170, 45, 75, 90, 2, 802, 24, 66]\ndef counting_by_digit(a, exp):\n    out = [0] * len(a)\n    count = [0] * 10\n    for x in a:\n        count[(x // exp) % 10] += 1\n    for i in range(1, 10):\n        count[i] += count[i - 1]\n    for x in reversed(a):\n        d = (x // exp) % 10\n        count[d] -= 1\n        out[count[d]] = x\n    return out\nexp = 1\nwhile max(a) // exp > 0:\n    a = counting_by_digit(a, exp)\n    exp *= 10\nprint(a)\n` },
  },
];
