# CLAUDE.md - Clippy Clipboard Sync

## Project Overview

Clippy is a web-based clipboard that allows users to copy and paste text and images between different systems (e.g., phone to laptop). It runs as a lightweight Node.js/Express server with a single-page React frontend. Users on one device paste content via the browser Clipboard API, which is stored server-side, and then copy it on another device. Content type (text or image) is auto-detected on paste.

## Architecture

```
Browser (Device A)                    Browser (Device B)
   PASTE button                          COPY button
       │                                     ▲
       ▼                                     │
  POST /api/clipboard ──► Express Server ──► GET /api/clipboard
                          (in-memory store)
                          Polls every 2s
```

- **Backend**: Single Express server (`server.js`) with two API endpoints and static file serving
- **Frontend**: Single HTML file (`public/index.html`) with inline React/JSX compiled by Babel in the browser
- **Storage**: In-memory (no database) — data is lost on server restart
- **Content types**: Supports both text and images. Images are stored as base64 data URIs

## File Structure

```
clippy/
├── server.js            # Express backend — API routes + static serving
├── public/
│   └── index.html       # Complete SPA (React + MUI, loaded via CDN)
├── package.json         # Only dependency: express
├── .gitignore
└── CLAUDE.md            # This file
```

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Node.js, Express 4.18               |
| Frontend | React 18, Material-UI 5.15, Emotion |
| Build    | None — zero-build, CDN-loaded       |
| Testing  | None currently                       |

All frontend libraries are loaded from `unpkg.com` CDN. Babel Standalone compiles JSX in the browser. There is no bundler, transpiler pipeline, or build step.

## Running the App

```bash
npm install      # Install express
npm start        # Starts server on http://localhost:3000
```

The port can be overridden with the `PORT` environment variable.

## API Endpoints

| Method | Path              | Description                        |
|--------|-------------------|------------------------------------|
| GET    | `/api/clipboard`  | Returns `{ content, type, updatedAt }` |
| POST   | `/api/clipboard`  | Accepts `{ content, type }`, returns `{ ok: true }` |

- `type` is `"text"` (default) or `"image"`
- For images, `content` is a base64 data URI string
- POST returns `400` if `content` is not a string or `type` is invalid
- JSON body limit is 20 MB to accommodate image payloads

## Key Conventions

- **Language**: All code comments and UI strings must be in English
- **No build step**: Do not introduce a build pipeline. Frontend changes go directly in `public/index.html`
- **Minimal dependencies**: The only npm dependency is `express`. Frontend deps are CDN-loaded. Keep it lightweight
- **Single-file frontend**: The entire UI lives in `public/index.html` with inline `<script type="text/babel">`. Do not split into separate JS/CSS files unless explicitly requested
- **In-memory storage**: Clipboard data is stored in a JS variable. There is no database. This is intentional for simplicity
- **Polling**: The frontend polls `GET /api/clipboard` every 2 seconds to stay in sync

## Development Notes

- The Clipboard API (`navigator.clipboard.read()` / `.write()`) requires a secure context (HTTPS) or localhost
- Image paste uses `navigator.clipboard.read()` with auto-detection of `image/*` MIME types
- Image copy writes back to the clipboard as a blob via `ClipboardItem`
- Image previews are constrained to the container width (`max-width: 100%`) and viewport height (`max-height: 60vh`)
- No linter, formatter, or type checking is configured — plain JavaScript throughout
- No tests exist yet. If adding tests, `jest` or `vitest` would be natural choices given the Node.js stack
- The `.gitignore` excludes `node_modules/`, `.env`, `dist/`, `build/`, and editor/OS files
