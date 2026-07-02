/**
 * AI layer (Gemini).
 *
 * Sits ON TOP of deterministic execution. Fed the REAL trace; never asked to
 * execute anything. Two Gemini paths so you can use Google Cloud credits:
 *   - AI Studio  : set GEMINI_API_KEY            (@google/generative-ai)
 *   - Vertex AI  : set GCP_PROJECT (+ GCP_LOCATION, ADC) -> uses Vertex credit
 * If neither is configured, a rule-based fallback keeps the feature working.
 *
 * Modes: "explain" | "approaches" | "step" | "bug"
 */

const express = require("express");
const { explain: fallbackExplain } = require("../lib/explainFallback");

const router = express.Router();

const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const SYSTEM = [
  "You are a DSA tutor. You are given a JSON execution trace produced by",
  "actually running the student's code (ground truth -- trust it over guesses).",
  "Explain clearly and concisely for a beginner. Never invent variable values;",
  "cite the trace. When suggesting better approaches, contrast with what they did.",
].join(" ");

function buildUserMsg({ code, trace, mode, step, question }) {
  const steps = trace.steps || [];
  const window =
    mode === "step" && step != null
      ? steps.slice(Math.max(0, step - 3), step + 3)
      : steps.filter((s) => (s.semantic || []).length).slice(0, 60);
  return JSON.stringify({
    mode,
    question: question || null,
    focusStep: step == null ? null : step,
    code,
    meta: trace.meta,
    steps: window,
  });
}

// --- AI Studio (simple API key) ---
async function viaAiStudio(userMsg) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  let GoogleGenerativeAI;
  try {
    ({ GoogleGenerativeAI } = require("@google/generative-ai"));
  } catch (e) {
    return null;
  }
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: MODEL, systemInstruction: SYSTEM });
  const result = await model.generateContent(userMsg);
  return { source: "gemini", text: result.response.text() };
}

// --- Vertex AI (uses the GCP project / credit) ---
async function viaVertex(userMsg) {
  const project = process.env.GCP_PROJECT;
  if (!project) return null;
  let VertexAI;
  try {
    ({ VertexAI } = require("@google-cloud/vertexai"));
  } catch (e) {
    return null;
  }
  const vertex = new VertexAI({ project, location: process.env.GCP_LOCATION || "us-central1" });
  const model = vertex.getGenerativeModel({
    model: MODEL,
    systemInstruction: { parts: [{ text: SYSTEM }] },
  });
  const r = await model.generateContent(userMsg);
  const text = (r.response.candidates?.[0]?.content?.parts || [])
    .map((p) => p.text)
    .join("");
  return { source: "gemini-vertex", text };
}

async function llmExplain(args) {
  const userMsg = buildUserMsg(args);
  return (await viaAiStudio(userMsg)) || (await viaVertex(userMsg)) || null;
}

router.post("/explain", async (req, res) => {
  const { code, trace, mode = "explain", step = null, question = null } = req.body || {};
  if (!trace) return res.status(400).json({ error: "No trace provided." });

  try {
    const llm = await llmExplain({ code, trace, mode, step, question });
    if (llm && llm.text) return res.json(llm);
  } catch (err) {
    console.error("Gemini explain failed, using fallback:", err.message);
  }
  return res.json(fallbackExplain({ trace, mode, step }));
});

module.exports = router;
