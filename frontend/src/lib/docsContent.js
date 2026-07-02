// Data-driven docs/blog content. Topics live in lib/docs/*.js by category and
// are aggregated here; the sidebar, hash routes, and article page all build
// themselves from TOPICS + CATEGORIES. Each topic carries an optional client-
// side `premade` visualizer id and a `demo` that runs through the real engine.
//
// SEO note: this text is the crawlable content. For ranking, prerender these
// pages to static HTML at build time (vite-plugin-ssg / prerender) + sitemap.

import { linearTopics } from "./docs/linear";
import { recursionTopics } from "./docs/recursion";
import { treeTopics } from "./docs/trees";
import { graphTopics } from "./docs/graphs";
import { sortingTopics } from "./docs/sorting";
import { dpGreedyTopics } from "./docs/dpGreedy";

export const CATEGORIES = [
  { id: "arrays", label: "Arrays & Strings" },
  { id: "searching", label: "Searching" },
  { id: "linked", label: "Linked Lists" },
  { id: "stacks", label: "Stacks" },
  { id: "queues", label: "Queues" },
  { id: "hashing", label: "Hashing" },
  { id: "recursion", label: "Recursion" },
  { id: "backtracking", label: "Backtracking" },
  { id: "trees", label: "Trees" },
  { id: "graphs", label: "Graphs" },
  { id: "sorting", label: "Sorting" },
  { id: "dp", label: "Dynamic Programming" },
  { id: "greedy", label: "Greedy" },
  { id: "bits", label: "Bit Manipulation" },
];

export const TOPICS = [
  ...linearTopics,
  ...recursionTopics,
  ...treeTopics,
  ...graphTopics,
  ...sortingTopics,
  ...dpGreedyTopics,
];

export function topicBySlug(slug) {
  return TOPICS.find((t) => t.slug === slug) || TOPICS[0];
}
