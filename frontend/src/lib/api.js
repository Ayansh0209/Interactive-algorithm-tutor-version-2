// Single API client. Talks to the Node gateway (which proxies to the warm
// Python/Java workers and hosts the AI layer). One base URL, one place to change.

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const client = axios.create({ baseURL: BASE_URL, timeout: 35000 });

// Run user code -> normalized Trace envelope { meta, steps }.
// language: "python" | "java". stdin feeds input()/Scanner/sys.stdin.
export async function runCode(code, stdin = "", language = "python", maxSteps = 5000) {
  const { data } = await client.post(`/api/${language}/run`, {
    code,
    stdin,
    max_steps: maxSteps,
  });
  return data;
}

// Ask the AI layer for an explanation grounded in the trace.
export async function explain({ code, trace, mode = "explain", step = null, question = null }) {
  const { data } = await client.post("/api/ai/explain", { code, trace, mode, step, question });
  return data;
}

export { BASE_URL };
