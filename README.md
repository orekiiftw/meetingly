# Meetingly

**Stateless Minutes of Meeting (MoM) generator** — upload a video or audio recording, Gemini analyzes it natively, and you get structured minutes to copy as Markdown. Nothing is stored.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18+ (Vite), TypeScript, Tailwind CSS, shadcn-style Radix UI |
| Backend | Python 3.11+, FastAPI |
| Media | `ffmpeg` / `ffmpeg-python` (transient video → audio) |
| AI | Google GenAI SDK · Gemini multimodal (native audio) |

## Architecture

```
Browser ──FormData──▶ FastAPI /api/generate-mom
                           │
                           ├─ video? → ffmpeg extract audio (temp only)
                           │
                           ├─ upload audio → Gemini File API
                           ├─ generate_content + response_schema (JSON MoM)
                           ├─ delete remote file
                           └─ wipe local temp dir
                           │
Browser ◀── JSON MoM ──────┘
```

**No database. No object storage. No retained PDFs or audio.**

## Prerequisites

- Node.js 20+
- Python 3.11+
- [ffmpeg](https://ffmpeg.org/) on `PATH`
- [Gemini API key](https://aistudio.google.com/apikey)

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set GEMINI_API_KEY=...

# Option A — helper script (uses uv if present)
./run.sh

# Option B — manual
# python -m venv .venv && source .venv/bin/activate
# pip install -r requirements.txt
# uvicorn main:app --reload --port 8000
```

Health check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api/*` to the backend.

## Auth

Accounts are stored in a local SQLite DB (`backend/data/meetingly.db`).  
**Meeting media is still ephemeral** — only email/name/password hashes are retained.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | `{ name, email, password }` → JWT + user |
| POST | `/api/auth/login` | `{ email, password }` → JWT + user |
| GET | `/api/auth/me` | Current user (`Authorization: Bearer …`) |

`POST /api/generate-mom` requires a valid Bearer token.

Set `JWT_SECRET` in `backend/.env` (a value was generated if you used the project setup).

## API

### `POST /api/generate-mom`

Requires `Authorization: Bearer <token>`.  
Multipart form field: `file` (video or audio).

**Accepted extensions:** `.mp4`, `.mkv`, `.webm`, `.mov`, `.avi`, `.mp3`, `.wav`, `.m4a`, `.aac`, `.ogg`, `.flac`

**Response:**

```json
{
  "success": true,
  "filename": "standup.mp4",
  "mom": {
    "title": "...",
    "date_context": "...",
    "participants": ["..."],
    "executive_summary": "...",
    "key_decisions": [
      {
        "decision": "...",
        "rationale": "...",
        "stakeholders": ["..."]
      }
    ],
    "action_items": [
      {
        "task": "...",
        "owner": "...",
        "due_date": "...",
        "priority": "high"
      }
    ],
    "topics_discussed": ["..."],
    "next_steps": ["..."]
  }
}
```

### `GET /api/health`

Liveness + whether `GEMINI_API_KEY` is configured.

## UI (multi-page SaaS)

Dark developer-tool aesthetic (Vercel / Linear inspired) with separate marketing site and app shell.

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/features` | Product / pipeline details |
| `/security` | Zero-retention architecture |
| `/signup` | Create account |
| `/signin` | Sign in |
| `/app` | Dashboard (auth required) |
| `/app/generate` | MoM upload workspace (auth required) |
| `/app/settings` | Account + API health (auth required) |

**App shell:** sidebar nav, API status chip, Generate flow with loading copy, tabs (Summary / Decisions / Actions), Copy Markdown.

## Environment

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | yes | — | Google AI Studio API key |
| `GEMINI_MODEL` | no | `gemini-2.5-flash` | Model with audio understanding |

## Project layout

```
meetingly/
├── backend/
│   ├── main.py           # FastAPI app + Gemini + ffmpeg
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── MoMWorkspace.tsx   # Upload · loading · results
│   │   │   └── ui/                # Button, Tabs, Checkbox
│   │   └── ...
│   └── package.json
└── README.md
```

## Notes

- Max upload size: **100 MB** (adjust `MAX_UPLOAD_BYTES` in `main.py` if needed).
- Video audio is extracted as mono 16 kHz MP3 to keep speech payloads small.
- Remote Gemini files are deleted after generation; local temp dirs are always cleaned in a `finally` block.
