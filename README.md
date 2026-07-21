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

Copy env and set keys first:

```bash
cd backend
# Windows:  copy .env.example .env
# macOS/Linux:  cp .env.example .env
```

Edit `.env` and set `GEMINI_API_KEY` (and preferably `JWT_SECRET`).

**Windows (PowerShell or Command Prompt)** — do **not** use `./run.sh`:

```powershell
cd backend
.\run.ps1
# or:
.\run.bat
```

If PowerShell blocks scripts:

```powershell
powershell -ExecutionPolicy Bypass -File .\run.ps1
```

**macOS / Linux / Git Bash / WSL:**

```bash
cd backend
./run.sh
```

**Manual (any OS):**

```bash
cd backend
python -m venv .venv

# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Also install [ffmpeg](https://ffmpeg.org/) and ensure it is on your `PATH` (on Windows, restart the terminal after install).

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

## Vercel Deployment

You can host **Meetingly** on Vercel via two primary architectures:

### Option A: Host Entire Project on Vercel (All-in-One)
This hosts both the React frontend and the Python FastAPI backend directly on Vercel as serverless functions.

1. **Import to Vercel**: Connect your GitHub repository to Vercel. Keep the **Root Directory** as the root of the repository (`/`).
2. **Set Environment Variables**: In Vercel, add the following variables:
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
   - `JWT_SECRET`: A long random string for auth tokens.
3. **Key Considerations on Vercel**:
   - **Database Persistence**: SQLite database writes are directed to `/tmp/meetingly.db` which is ephemeral. User accounts will reset periodically.
   - **Video Uploads**: Vercel Serverless Functions do not support the system binary `ffmpeg`. Uploading video files will gracefully notify users to upload audio files instead. Audio uploads (MP3, WAV, M4A, etc.) work perfectly because they bypass `ffmpeg` and are sent directly to Gemini.

---

### Option B: Frontend on Vercel + Backend on Render/Railway (Full Feature Support)
This allows full database persistence and video processing with `ffmpeg`.

1. **Deploy Backend**: Deploy the `backend` directory to Render, Railway, or Fly.io (which have `ffmpeg` and disk persistence).
   - Set env variables: `GEMINI_API_KEY`, `JWT_SECRET`.
   - Set `CORS_ALLOWED_ORIGINS` to your Vercel frontend URL (e.g., `https://meetingly.vercel.app`).
2. **Deploy Frontend on Vercel**: Import the repository and set the **Root Directory** to `frontend`.
   - Set env variable: `VITE_API_URL` to your deployed backend URL (e.g., `https://meetingly-api.railway.app`).

## Notes

- Max upload size: **100 MB** (adjust `MAX_UPLOAD_BYTES` in `main.py` if needed).
- Video audio is extracted as mono 16 kHz MP3 to keep speech payloads small.
- Remote Gemini files are deleted after generation; local temp dirs are always cleaned in a `finally` block.
