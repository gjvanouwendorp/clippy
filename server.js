// server.js
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage
let clipboardContent = "";
let clipboardType = "text"; // "text" or "image"
let updatedAt = null;
let clearTimer = null;
const MAX_HISTORY = 5;
let history = []; // { content, type, savedAt }

const CLEAR_DELAY_MS = 5 * 60 * 1000; // 5 minutes

function clearClipboard() {
  clipboardContent = "";
  clipboardType = "text";
  updatedAt = null;
  clearTimer = null;
}

function scheduleClear() {
  if (clearTimer) clearTimeout(clearTimer);
  clearTimer = setTimeout(clearClipboard, CLEAR_DELAY_MS);
}

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
  // Push current content to history before replacing (skip if empty or clearing)
  if (clipboardContent && content) {
    history.unshift({ content: clipboardContent, type: clipboardType, savedAt: updatedAt });
    if (history.length > MAX_HISTORY) history.pop();
  }
  clipboardContent = content;
  clipboardType = type || "text";
  updatedAt = new Date().toISOString();
  scheduleClear();
  res.json({ ok: true });
});

// API: get clipboard history
app.get("/api/clipboard/history", (req, res) => {
  res.json(history.map(({ content, type, savedAt }, i) => ({
    index: i,
    type,
    savedAt,
    preview: type === "image" ? "(image)" : content.slice(0, 100),
  })));
});

// API: delete a single history entry
app.delete("/api/clipboard/history/:index", (req, res) => {
  const idx = parseInt(req.params.index, 10);
  if (isNaN(idx) || idx < 0 || idx >= history.length) {
    return res.status(404).json({ ok: false, error: "Invalid index" });
  }
  history.splice(idx, 1);
  res.json({ ok: true });
});

// API: restore a history entry as the current clipboard
app.post("/api/clipboard/history/:index/restore", (req, res) => {
  const idx = parseInt(req.params.index, 10);
  if (isNaN(idx) || idx < 0 || idx >= history.length) {
    return res.status(404).json({ ok: false, error: "Invalid index" });
  }
  const entry = history[idx];
  // Push current to history, remove the restored entry
  if (clipboardContent) {
    history.splice(idx, 1, { content: clipboardContent, type: clipboardType, savedAt: updatedAt });
  } else {
    history.splice(idx, 1);
  }
  clipboardContent = entry.content;
  clipboardType = entry.type;
  updatedAt = new Date().toISOString();
  scheduleClear();
  res.json({ ok: true });
});

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
