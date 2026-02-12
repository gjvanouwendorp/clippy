# Clippy

A web-based clipboard that lets you copy and paste text and images between devices. Paste on your phone, copy on your laptop — or the other way around.

## How it works

```
Device A (paste)                        Device B (copy)
    │                                       ▲
    ▼                                       │
 POST /api/clipboard ──► Express Server ──► GET /api/clipboard
                         (in-memory store)
                         polls every 2s
```

Clippy runs as a single Node.js/Express server with a zero-build React frontend. Content is stored in memory and auto-cleared after 5 minutes of inactivity. There is no database, no accounts, and no build step.

## Quick start

```bash
npm install
npm start
```

Open `http://localhost:3000` in a browser. Override the port with the `PORT` environment variable.

## Features

- **Text and image support** — auto-detects content type on paste
- **Clipboard history** — stores the last 5 entries with restore and per-entry delete
- **Drag and drop** — drop files or images directly onto the content area
- **Keyboard shortcuts** — `Ctrl+V` to paste to server, `Ctrl+Shift+C` to copy from server
- **Auto-paste** — optional mode that pastes automatically when the tab gains focus
- **Dark mode** — toggle between light and dark themes (persisted in localStorage)
- **Auto-clear** — clipboard content is wiped after 5 minutes

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/clipboard` | Returns `{ content, type, updatedAt }` |
| `POST` | `/api/clipboard` | Accepts `{ content, type }`, returns `{ ok: true }` |
| `GET` | `/api/clipboard/history` | Returns array of `{ index, type, savedAt, preview }` |
| `DELETE` | `/api/clipboard/history/:index` | Removes a single history entry |
| `POST` | `/api/clipboard/history/:index/restore` | Restores a history entry as the current clipboard |

- `type` is `"text"` (default) or `"image"`
- For images, `content` is a base64 data URI
- JSON body limit is 20 MB to support image payloads

## File structure

```
clippy/
├── server.js                        # Express backend
├── public/
│   └── index.html                   # Single-page React/MUI frontend
├── deploy.sh                        # Production deploy script
├── .github/
│   └── workflows/
│       └── deploy.yml               # GitHub Actions CI/CD pipeline
├── package.json
├── CLAUDE.md
└── README.md
```

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express |
| Frontend | React 18, Material-UI 5, Emotion |
| Build | None — CDN-loaded, Babel compiles JSX in the browser |
| CI/CD | GitHub Actions, SSH deploy |

## Deployment

Pushes to `main` trigger automatic deployment via GitHub Actions:

1. The workflow SSHs into the production server
2. Runs `deploy.sh`, which pulls the latest code, installs dependencies, and restarts the `clippy.service` systemd unit

### Required GitHub secrets

| Secret | Value |
|--------|-------|
| `SSH_USER` | SSH username on the production server |
| `SSH_PRIVATE_KEY` | Private key for SSH authentication |

### Server prerequisites

- Node.js installed
- Repo cloned to `/var/www/clippy/`
- `clippy.service` systemd unit configured
- SSH user has passwordless `sudo` for `systemctl restart clippy.service`

## License

MIT
