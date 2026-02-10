// server.js
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage
let clipboardContent = "";
let clipboardType = "text"; // "text" or "image"
let updatedAt = null;

app.use(express.json({ limit: "20mb" }));

// API: get clipboard content
app.get("/api/clipboard", (req, res) => {
  res.json({
    content: clipboardContent,
    type: clipboardType,
    updatedAt,
  });
});

// API: save clipboard content
app.post("/api/clipboard", (req, res) => {
  const { content, type } = req.body;
  if (typeof content !== "string") {
    return res.status(400).json({ ok: false, error: "Invalid content" });
  }
  if (type !== undefined && type !== "text" && type !== "image") {
    return res.status(400).json({ ok: false, error: "Invalid type" });
  }
  clipboardContent = content;
  clipboardType = type || "text";
  updatedAt = new Date().toISOString();
  res.json({ ok: true });
});

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
