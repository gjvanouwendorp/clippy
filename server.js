// server.js
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory opslag
let clipboardText = "";
let updatedAt = null;

app.use(express.json());

// API: ophalen van clipboard content
app.get("/api/clipboard", (req, res) => {
  res.json({
    content: clipboardText,
    updatedAt,
  });
});

// API: opslaan van clipboard content
app.post("/api/clipboard", (req, res) => {
  const { content } = req.body;
  if (typeof content !== "string") {
    return res.status(400).json({ ok: false, error: "Invalid content" });
  }
  clipboardText = content;
  updatedAt = new Date().toISOString();
  res.json({ ok: true });
});

// Statische files serveren uit 'public'
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
