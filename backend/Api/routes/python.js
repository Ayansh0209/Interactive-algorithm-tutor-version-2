const express = require("express");
const axios = require("axios");

const router = express.Router();
const PYTHON_API_URL = "http://localhost:5001/run-python";

router.post("/run", async (req, res) => {
  const { code } = req.body;

  try {
    const response = await axios.post(PYTHON_API_URL, { code });
    res.json(response.data); // return trace
  } catch (error) {
    res.status(500).json({ error: "Failed to run Python code", details: error.message });
  }
});

module.exports = router;
