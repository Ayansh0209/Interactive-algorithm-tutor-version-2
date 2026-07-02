/**
 * C++ language route.
 *
 * Proxies to the warm C++ trace worker (backend/cpp-worker, FastAPI :8002),
 * which compiles the user's code with g++ -g and single-steps it under gdb to
 * emit the SAME normalized Trace envelope every other language produces. Because
 * the envelope is identical, the entire frontend works unchanged for C++.
 */

const express = require("express");
const axios = require("axios");

const router = express.Router();
const CPP_WORKER_URL = process.env.CPP_WORKER_URL || "http://127.0.0.1:8002";

router.post("/run", async (req, res) => {
  const { code, max_steps, stdin } = req.body || {};
  if (!code || !code.trim()) {
    return res.status(400).json({ error: "No code provided." });
  }

  try {
    const { data } = await axios.post(
      `${CPP_WORKER_URL}/trace`,
      { code, max_steps: max_steps || 4000, stdin: stdin || "" },
      { timeout: 45000 }
    );
    return res.json(data);
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "C++ worker is not running.",
        details: `Start it: uvicorn app:app --port 8002 (in backend/cpp-worker; needs g++ + gdb on PATH). Expected ${CPP_WORKER_URL}`,
      });
    }
    return res.status(500).json({
      error: "C++ trace request failed.",
      details: (err.response && err.response.data) || err.message,
    });
  }
});

module.exports = router;
