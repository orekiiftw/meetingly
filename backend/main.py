"""
Meetingly — Minutes of Meeting (MoM) Generator
FastAPI backend: auth (SQLite users) + ephemeral media → Gemini multimodal → MoM JSON.
Meeting audio/video is never retained; only user accounts are stored.
"""

from __future__ import annotations

import json
import logging
import mimetypes
import os
import tempfile
import time
import uuid
from contextlib import asynccontextmanager
from enum import Enum
from pathlib import Path
from typing import Any

import ffmpeg
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

load_dotenv()

from auth import (  # noqa: E402
    AuthResponse,
    CurrentUser,
    LoginRequest,
    MeResponse,
    SignupRequest,
    create_access_token,
    hash_password,
    user_to_public,
    verify_password,
)
from database import create_user, get_user_by_email, init_db  # noqa: E402

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("meetingly")

# ── Config ──────────────────────────────────────────────────────────────────

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

MAX_UPLOAD_BYTES = 100 * 1024 * 1024  # 100 MB

VIDEO_EXTENSIONS = {".mp4", ".mkv", ".webm", ".mov", ".avi"}
AUDIO_EXTENSIONS = {".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac", ".webm"}
ALLOWED_EXTENSIONS = VIDEO_EXTENSIONS | AUDIO_EXTENSIONS

AUDIO_MIME_MAP = {
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
    ".aac": "audio/aac",
    ".ogg": "audio/ogg",
    ".flac": "audio/flac",
    ".webm": "audio/webm",
}

# ── Schemas (strict structured output for Gemini) ───────────────────────────


class Priority(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class ActionItem(BaseModel):
    task: str = Field(description="Clear description of the action to be taken")
    owner: str = Field(description="Person or team responsible; 'Unassigned' if unclear")
    due_date: str = Field(
        description="Due date if mentioned, otherwise 'Not specified'"
    )
    priority: Priority = Field(description="Inferred priority of the action item")


class KeyDecision(BaseModel):
    decision: str = Field(description="What was decided")
    rationale: str = Field(
        description="Why it was decided, or 'Not stated' if not discussed"
    )
    stakeholders: list[str] = Field(
        description="People involved in or affected by the decision"
    )


class MeetingMoM(BaseModel):
    title: str = Field(description="Concise meeting title inferred from content")
    date_context: str = Field(
        description="Date/time references from the meeting, or 'Not mentioned'"
    )
    participants: list[str] = Field(
        description="Identified speakers/participants; empty list if unknown"
    )
    executive_summary: str = Field(
        description=(
            "2–4 paragraph executive summary covering purpose, main discussion "
            "themes, and outcomes. Written in professional prose."
        )
    )
    key_decisions: list[KeyDecision] = Field(
        description="Decisions made during the meeting; empty if none"
    )
    action_items: list[ActionItem] = Field(
        description="Concrete follow-ups with owners; empty if none"
    )
    topics_discussed: list[str] = Field(
        description="Bullet-style list of major topics covered"
    )
    next_steps: list[str] = Field(
        description="High-level next steps or follow-up meetings mentioned"
    )


# ── Prompt ──────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert executive assistant specializing in Minutes of Meeting (MoM).

You will receive an audio recording of a meeting. Listen carefully and produce accurate, professional minutes.

Rules:
1. Base ALL content strictly on what is said in the audio. Do not invent facts.
2. If something is unclear or inaudible, note it briefly rather than guessing.
3. Identify speakers by name when they introduce themselves or are addressed; otherwise use neutral labels like "Speaker 1".
4. Executive summary should be polished prose suitable for senior leadership.
5. Action items must be specific and actionable. Assign owners only when clearly stated.
6. Key decisions should capture the decision AND any rationale discussed.
7. Prefer precision over verbosity.
8. Output MUST conform exactly to the provided JSON schema.
"""


# ── App lifecycle ───────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    logger.info("User database ready")
    if not GEMINI_API_KEY:
        logger.warning(
            "GEMINI_API_KEY is not set. /api/generate-mom will fail until it is configured."
        )
    else:
        logger.info("Gemini client ready (model=%s)", GEMINI_MODEL)
    yield


app = FastAPI(
    title="Meetingly",
    description="Minutes of Meeting generator powered by Gemini (auth + ephemeral media)",
    version="1.1.0",
    lifespan=lifespan,
)

# CORS origins
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
env_origins = os.getenv("CORS_ALLOWED_ORIGINS")
if env_origins:
    CORS_ORIGINS.extend([origin.strip() for origin in env_origins.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ─────────────────────────────────────────────────────────────────


def _extension(filename: str | None) -> str:
    if not filename:
        return ""
    return Path(filename).suffix.lower()


def _is_video(ext: str) -> bool:
    return ext in VIDEO_EXTENSIONS


def _guess_audio_mime(path: Path) -> str:
    ext = path.suffix.lower()
    if ext in AUDIO_MIME_MAP:
        return AUDIO_MIME_MAP[ext]
    guessed, _ = mimetypes.guess_type(str(path))
    return guessed or "audio/mpeg"


def extract_audio_to_temp(video_path: Path, work_dir: Path) -> Path:
    """
    Strip audio from video via ffmpeg into a temporary MP3.
    Runs as a transient subprocess; no persistent storage.
    """
    out_path = work_dir / f"{uuid.uuid4().hex}.mp3"
    try:
        (
            ffmpeg.input(str(video_path))
            .output(
                str(out_path),
                acodec="libmp3lame",
                audio_bitrate="128k",
                ac=1,  # mono — enough for speech, smaller payload
                ar="16000",
                vn=None,  # drop video
            )
            .overwrite_output()
            .run(capture_stdout=True, capture_stderr=True, quiet=True)
        )
    except FileNotFoundError as exc:
        logger.error("ffmpeg executable not found: %s", exc)
        raise HTTPException(
            status_code=422,
            detail=(
                "Video processing requires ffmpeg, which is not available on this server environment. "
                "Please upload an audio file (MP3, WAV, M4A, etc.) directly."
            ),
        ) from exc
    except ffmpeg.Error as exc:
        stderr = exc.stderr.decode("utf-8", errors="replace") if exc.stderr else str(exc)
        logger.error("ffmpeg failed: %s", stderr)
        raise HTTPException(
            status_code=422,
            detail=f"Failed to extract audio from video: {stderr[:500]}",
        ) from exc

    if not out_path.exists() or out_path.stat().st_size == 0:
        raise HTTPException(
            status_code=422,
            detail="No audio stream found in the uploaded video.",
        )
    return out_path


def _wait_until_file_active(
    client: genai.Client,
    uploaded: types.File,
    *,
    timeout_s: float = 45.0,
    poll_s: float = 1.0,
) -> types.File:
    """Poll Gemini File API until the upload is ACTIVE (or fail)."""
    name = uploaded.name
    if not name:
        return uploaded

    deadline = time.monotonic() + timeout_s
    current = uploaded
    while True:
        state = getattr(current.state, "name", None) or str(current.state or "")
        # Handles both enum-style (.name == "ACTIVE") and string values
        if "ACTIVE" in state.upper() and "PROCESSING" not in state.upper():
            return current
        if "FAILED" in state.upper():
            raise HTTPException(
                status_code=502,
                detail="Gemini failed to process the uploaded audio file.",
            )
        if time.monotonic() >= deadline:
            raise HTTPException(
                status_code=504,
                detail="Timed out waiting for Gemini to process the audio upload.",
            )
        time.sleep(poll_s)
        current = client.files.get(name=name)


INLINE_DATA_LIMIT = 20 * 1024 * 1024  # 20 MB — Gemini inline-data ceiling


def _generate_mom_inline(client: genai.Client, audio_path: Path, mime: str) -> dict[str, Any]:
    """Send audio bytes inline in the generate_content call (no File API round-trips)."""
    audio_bytes = audio_path.read_bytes()
    logger.info(
        "Sending audio inline to Gemini (%s, %s bytes, model=%s)",
        mime, len(audio_bytes), GEMINI_MODEL,
    )

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=[
            types.Content(
                role="user",
                parts=[
                    types.Part.from_bytes(
                        data=audio_bytes,
                        mime_type=mime,
                    ),
                    types.Part.from_text(
                        text=(
                            "Analyze this meeting recording and produce complete "
                            "Minutes of Meeting according to the schema."
                        )
                    ),
                ],
            )
        ],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=MeetingMoM,
            temperature=0.2,
        ),
    )
    return response


def _generate_mom_file_api(client: genai.Client, audio_path: Path, mime: str) -> dict[str, Any]:
    """Upload via Gemini File API, poll until ACTIVE, then generate. Used for large files."""
    uploaded = None
    try:
        logger.info("Uploading audio to Gemini File API (%s, %s bytes)", mime, audio_path.stat().st_size)
        uploaded = client.files.upload(
            file=str(audio_path),
            config=types.UploadFileConfig(mime_type=mime),
        )

        # Wait until the File API finishes processing (ACTIVE) before generation
        uploaded = _wait_until_file_active(client, uploaded)

        logger.info("Generating MoM with model=%s", GEMINI_MODEL)
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_uri(
                            file_uri=uploaded.uri,
                            mime_type=uploaded.mime_type or mime,
                        ),
                        types.Part.from_text(
                            text=(
                                "Analyze this meeting recording and produce complete "
                                "Minutes of Meeting according to the schema."
                            )
                        ),
                    ],
                )
            ],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=MeetingMoM,
                temperature=0.2,
            ),
        )
        return response
    finally:
        # Stateless: always remove the remote file when possible
        if uploaded is not None:
            try:
                client.files.delete(name=uploaded.name)
                logger.info("Deleted remote Gemini file %s", uploaded.name)
            except Exception:
                logger.warning("Could not delete remote Gemini file", exc_info=True)


def generate_mom_from_audio(audio_path: Path) -> dict[str, Any]:
    """Generate structured MoM from an audio file via Gemini.

    Uses inline data for files ≤ 20 MB (single round-trip, ideal for serverless)
    and falls back to the File API for larger files.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not configured on the server.",
        )

    client = genai.Client(api_key=GEMINI_API_KEY)
    mime = _guess_audio_mime(audio_path)
    file_size = audio_path.stat().st_size

    try:
        if file_size <= INLINE_DATA_LIMIT:
            response = _generate_mom_inline(client, audio_path, mime)
        else:
            response = _generate_mom_file_api(client, audio_path, mime)

        raw = response.text
        if not raw:
            raise HTTPException(
                status_code=502,
                detail="Gemini returned an empty response.",
            )

        # Validate / normalize via Pydantic
        mom = MeetingMoM.model_validate_json(raw)
        return mom.model_dump()

    except HTTPException:
        raise
    except json.JSONDecodeError as exc:
        logger.exception("Invalid JSON from Gemini")
        raise HTTPException(
            status_code=502,
            detail=f"Gemini returned invalid JSON: {exc}",
        ) from exc
    except Exception as exc:
        logger.exception("Gemini generation failed")
        message = str(exc)
        status = 502
        if "API key" in message or "PERMISSION" in message.upper() or "401" in message:
            status = 401
        raise HTTPException(
            status_code=status,
            detail=f"Gemini processing failed: {message}",
        ) from exc



# ── Routes ──────────────────────────────────────────────────────────────────


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {
        "status": "ok",
        "model": GEMINI_MODEL,
        "gemini_configured": str(bool(GEMINI_API_KEY)).lower(),
    }


@app.post("/api/auth/signup", response_model=AuthResponse)
async def signup(body: SignupRequest) -> AuthResponse:
    email = str(body.email).strip().lower()
    name = body.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required.")
    if get_user_by_email(email) is not None:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    try:
        user = create_user(
            email=email,
            name=name,
            password_hash=hash_password(body.password),
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    token = create_access_token(user_id=user.id, email=user.email)
    logger.info("User signed up: %s", user.email)
    return AuthResponse(access_token=token, user=user_to_public(user))


@app.post("/api/auth/login", response_model=AuthResponse)
async def login(body: LoginRequest) -> AuthResponse:
    email = str(body.email).strip().lower()
    user = get_user_by_email(email)
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token(user_id=user.id, email=user.email)
    logger.info("User logged in: %s", user.email)
    return AuthResponse(access_token=token, user=user_to_public(user))


@app.get("/api/auth/me", response_model=MeResponse)
async def me(user: CurrentUser) -> MeResponse:
    return user_to_public(user)


@app.post("/api/generate-mom")
async def generate_mom(
    user: CurrentUser,
    file: UploadFile = File(...),
) -> dict[str, Any]:
    """
    Accept a video or audio upload (authenticated), extract audio if needed, and return
    structured Minutes of Meeting. Media is not persisted beyond the request.
    """
    ext = _extension(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type '{ext or 'unknown'}'. "
                f"Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            ),
        )

    # Read into a temp workspace — deleted after the request
    work_dir = Path(tempfile.mkdtemp(prefix="meetingly_"))
    source_path = work_dir / f"source{ext}"
    audio_path: Path | None = None

    try:
        # Stream upload to disk in chunks (still ephemeral)
        total = 0
        with open(source_path, "wb") as out:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                total += len(chunk)
                if total > MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File exceeds maximum size of {MAX_UPLOAD_BYTES // (1024 * 1024)} MB.",
                    )
                out.write(chunk)

        if total == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded.")

        logger.info("User %s uploaded %s (%d bytes)", user.email, file.filename, total)

        if _is_video(ext):
            logger.info("Video detected — extracting audio with ffmpeg")
            audio_path = extract_audio_to_temp(source_path, work_dir)
        else:
            audio_path = source_path

        mom = generate_mom_from_audio(audio_path)
        return {
            "success": True,
            "filename": file.filename,
            "mom": mom,
        }
    finally:
        # Ephemeral media: wipe the entire temp workspace
        try:
            for p in work_dir.glob("**/*"):
                if p.is_file():
                    p.unlink(missing_ok=True)
            work_dir.rmdir()
        except Exception:
            logger.warning("Temp cleanup incomplete for %s", work_dir, exc_info=True)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
