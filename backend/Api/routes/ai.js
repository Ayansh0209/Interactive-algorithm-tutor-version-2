/**
 * AI layer.
 *
 * Sits ON TOP of deterministic execution. It is fed the real trace and never
 * asked to execute anything. If ANTHROPIC_API_KEY is set, an LLM produces rich
 * prose grounded in that trace; otherwise a rule-based fallback is used so the
 * feature always works.
 *
 * Modes: "explain" (overview) | "step" | "approaches" | "bug"
 */

const express = require("express");
const { explain: fallbackExplain } = require("../lib/explainFallback");

const router = express.Router();

const SYSTEM = [
  "You are a DSA tutor. You are given a JSON execution trace produced by",
  "actually running the student's code (ground truth -- trust it over guesses).",
  "Explain clearly and concisely for a beginner. Never invent variable values;",
  "cite the trace. When suggesting better approaches, contrast with what they did.",
].join(" ");

async function llmExplain({ code, trace, mode, step, question }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  let Anthropic;
  try {
    Anthropic = require("@anthropic-ai/sdk");
  } catch (e) {
    return null; // SDK not installed; use fallback
  }
  const client = new Anthropic({ apiKey: key });

  const steps = trace.steps || [];
  const window =
    mode === "step" && step != null
      ? steps.slice(Math.max(0, step - 3), step + 3)
      : steps.filter((s) => (s.semantic || []).length).slice(0, 60);

  const userMsg = JSON.stringify({
    mode,
    question: question || null,
    focusStep: step == null ? null : step,
    code,
    meta: trace.meta,
    steps: window,
  });

  const resp = await client.messages.create({
    model: process.env.AI_MODEL || "claude-sonnet-4-6",
    max_tokens: 900,
    system: SYSTEM,
    messages: [{ role: "user", content: userMsg }],
  });
  const text = (resp.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return { source: "llm", text };
}

router.post("/explain", async (req, res) => {
  const { code, trace, mode = "explain", step = null, question = null } = req.body || {};
  if (!trace) return res.status(400).json({ error: "No trace provided." });

  try {
    const llm = await llmExplain({ code, trace, mode, step, question });
    if (llm) return res.json(llm);
  } catch (err) {
    console.error("LLM explain failed, using fallback:", err.message);
  }
  return res.json(fallbackExplain({ trace, mode, step }));
});

module.exports = router;
