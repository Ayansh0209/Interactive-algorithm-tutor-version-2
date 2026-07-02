/**
 * API Gateway (public surface).
 *
 * Responsibilities:
 *   - route language trace requests to the warm Python worker (no cold spawn)
 *   - host the AI layer (explanations, approaches, bug-diff)
 *   - future: auth, payments (Stripe), rate limiting
 *
 * The Python worker is INTERNAL and reached over localhost. Multi-language
 * support is just more routes (./routes/cpp, ./routes/java) that proxy to their
 * own workers -- the frontend contract (the Trace envelope) stays identical.
 */

const express = require("express");
const cors = require("cors");

const pythonRoutes = require("./routes/python");
const aiRoutes = require("./routes/ai");
const javaRoutes = require("./routes/java");
const cppRoutes = require("./routes/cpp");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "gateway" }));

app.use("/api/python", pythonRoutes);
app.use("/api/java", javaRoutes);
app.use("/api/cpp", cppRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Gateway running at http://localhost:${PORT}`);
  console.log(`Trace worker expected at ${process.env.WORKER_URL || "http://127.0.0.1:8000"}`);
});
