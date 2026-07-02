// Frame generators for SortingPremade. Each takes items [{id,value}] and returns
// an array of frames: { arr:[{id,value}], compare:[positions]|null, pivot:pos|null,
// sorted:[positions], note, done }. Bars are keyed by position, so transient
// merge writes are fine.

export const SORT_META = {
  bubble: { label: "Bubble", complexity: "O(n²)", blurb: "Repeatedly compares adjacent pairs and swaps them if out of order; the largest value bubbles to the end each pass." },
  selection: { label: "Selection", complexity: "O(n²)", blurb: "Each pass scans the unsorted part for the minimum and moves it to the front." },
  insertion: { label: "Insertion", complexity: "O(n²)", blurb: "Grows a sorted prefix by inserting each next element into its correct place." },
  merge: { label: "Merge", complexity: "O(n log n)", blurb: "Divides the array in half, sorts each half, then merges the two sorted halves." },
  quick: { label: "Quick", complexity: "O(n log n) avg", blurb: "Picks a pivot, partitions smaller/larger around it, then recurses on each side." },
  heap: { label: "Heap", complexity: "O(n log n)", blurb: "Builds a max-heap, then repeatedly moves the max to the end and re-heapifies." },
};

function frameMaker(a) {
  const sorted = new Set();
  const frames = [];
  const snap = (o = {}) => frames.push({
    arr: a.map((x) => ({ ...x })),
    compare: o.compare || null,
    pivot: o.pivot ?? null,
    sorted: [...sorted],
    note: o.note || "",
    done: !!o.done,
  });
  return { frames, sorted, snap };
}

function bubble(items) {
  const a = items.map((x) => ({ ...x }));
  const { frames, sorted, snap } = frameMaker(a);
  const n = a.length;
  snap({ note: "Compare each adjacent pair; swap when the left is larger." });
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      snap({ compare: [j, j + 1], note: `Compare ${a[j].value} and ${a[j + 1].value}.` });
      if (a[j].value > a[j + 1].value) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        snap({ compare: [j, j + 1], note: `Out of order → swap.` });
      }
    }
    sorted.add(n - 1 - i);
  }
  sorted.add(0);
  snap({ done: true, note: "Sorted!" });
  return frames;
}

function selection(items) {
  const a = items.map((x) => ({ ...x }));
  const { frames, sorted, snap } = frameMaker(a);
  const n = a.length;
  snap({ note: "Find the minimum of the unsorted part and place it next." });
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      snap({ compare: [min, j], pivot: i, note: `Is ${a[j].value} smaller than ${a[min].value}?` });
      if (a[j].value < a[min].value) min = j;
    }
    if (min !== i) [a[i], a[min]] = [a[min], a[i]];
    sorted.add(i);
    snap({ note: `Min ${a[i].value} placed at position ${i}.` });
  }
  sorted.add(n - 1);
  snap({ done: true, note: "Sorted!" });
  return frames;
}

function insertion(items) {
  const a = items.map((x) => ({ ...x }));
  const { frames, sorted, snap } = frameMaker(a);
  const n = a.length;
  sorted.add(0);
  snap({ note: "Insert each element into the sorted prefix on its left." });
  for (let i = 1; i < n; i++) {
    const key = { ...a[i] };
    let j = i - 1;
    snap({ pivot: i, note: `Take ${key.value} and slide it left into place.` });
    while (j >= 0 && a[j].value > key.value) {
      snap({ compare: [j, j + 1], pivot: j + 1, note: `${a[j].value} > ${key.value} → shift right.` });
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
    sorted.add(i);
    snap({ note: `${key.value} inserted.` });
  }
  snap({ done: true, note: "Sorted!" });
  return frames;
}

function merge(items) {
  const a = items.map((x) => ({ ...x }));
  const { frames, snap } = frameMaker(a);
  snap({ note: "Divide in half, sort each half, then merge them back together." });
  function msort(lo, hi) {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    msort(lo, mid);
    msort(mid + 1, hi);
    const left = a.slice(lo, mid + 1).map((x) => ({ ...x }));
    const right = a.slice(mid + 1, hi + 1).map((x) => ({ ...x }));
    let i = 0, j = 0, k = lo;
    while (i < left.length && j < right.length) {
      snap({ compare: [lo + i, mid + 1 + j], note: `Merge: compare ${left[i].value} and ${right[j].value}.` });
      a[k++] = left[i].value <= right[j].value ? left[i++] : right[j++];
    }
    while (i < left.length) a[k++] = left[i++];
    while (j < right.length) a[k++] = right[j++];
    snap({ note: `Merged the range [${lo}…${hi}].` });
  }
  msort(0, a.length - 1);
  frames.push({ arr: a.map((x) => ({ ...x })), compare: null, pivot: null, sorted: a.map((_, i) => i), note: "Sorted!", done: true });
  return frames;
}

function quick(items) {
  const a = items.map((x) => ({ ...x }));
  const { frames, sorted, snap } = frameMaker(a);
  snap({ note: "Pick a pivot, partition smaller/larger around it, recurse." });
  function qsort(lo, hi) {
    if (lo >= hi) { if (lo === hi) sorted.add(lo); return; }
    const pivot = a[hi].value;
    let i = lo;
    for (let j = lo; j < hi; j++) {
      snap({ compare: [j, hi], pivot: hi, note: `Pivot ${pivot}: is ${a[j].value} smaller?` });
      if (a[j].value < pivot) { [a[i], a[j]] = [a[j], a[i]]; i++; }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    sorted.add(i);
    snap({ pivot: i, note: `Pivot ${pivot} settled at position ${i}.` });
    qsort(lo, i - 1);
    qsort(i + 1, hi);
  }
  qsort(0, a.length - 1);
  for (let i = 0; i < a.length; i++) sorted.add(i);
  snap({ done: true, note: "Sorted!" });
  return frames;
}

function heap(items) {
  const a = items.map((x) => ({ ...x }));
  const { frames, sorted, snap } = frameMaker(a);
  const n = a.length;
  snap({ note: "Build a max-heap, then pull the max to the end repeatedly." });
  function heapify(size, i) {
    let largest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < size) { snap({ compare: [i, l], pivot: i, note: `Heapify: compare with left child ${a[l].value}.` }); if (a[l].value > a[largest].value) largest = l; }
    if (r < size) { snap({ compare: [largest, r], pivot: i, note: `Heapify: compare with right child ${a[r].value}.` }); if (a[r].value > a[largest].value) largest = r; }
    if (largest !== i) { [a[i], a[largest]] = [a[largest], a[i]]; snap({ compare: [i, largest], note: `Swap to keep parent largest.` }); heapify(size, largest); }
  }
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
  snap({ note: "Max-heap built. Now extract the max each step." });
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    sorted.add(end);
    snap({ note: `Move max ${a[end].value} to position ${end}.` });
    heapify(end, 0);
  }
  sorted.add(0);
  snap({ done: true, note: "Sorted!" });
  return frames;
}

export const SORTERS = { bubble, selection, insertion, merge, quick, heap };
