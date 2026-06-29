/**
 * Java language route. Proxies to the warm Java trace worker (JDI).
 * Same contract as the Python route -- the frontend can't tell the difference.
 */

const express = require("express");
const axios = require("axios");

const router = express.Router();
const JAVA_WORKER_URL = process.env.JAVA_WORKER_URL || "http://127.0.0.1:8001";

router.post("/run", async (req, res) => {
  const { code, max_steps, stdin } = req.body || {};
  if (!code || !code.trim()) {
    return res.status(400).json({ error: "No code provided." });
  }
  try {
    const { data } = await axios.post(
      `${JAVA_WORKER_URL}/trace`,
      { code, max_steps: max_steps || 5000, stdin: stdin || "" },
      { timeout: 30000 }
    );
    return res.json(data);
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "Java trace worker is not running.",
        details: `Start it: java JavaWorker.java --serve 8001 (expected ${JAVA_WORKER_URL})`,
      });
    }
    return res.status(500).json({
      error: "Java trace request failed.",
      details: (err.response && err.response.data) || err.message,
    });
  }
});

module.exports = router;
