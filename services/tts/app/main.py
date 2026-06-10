from __future__ import annotations

import os
import logging
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import NamedTuple
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, Field, ValidationError, field_validator
from starlette.background import BackgroundTask


ENGINE_NAME = "moss-tts-nano"
MAX_TEXT_LENGTH = 5_000
SERVICE_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = SERVICE_ROOT.parent.parent
DEFAULT_REFERENCE_AUDIO_PATH = REPO_ROOT / "voice.wav"
DEFAULT_FALLBACK_VOICE = "Junhao"
TTS_MODE = "moss-cli"
DEFAULT_ALLOWED_ORIGIN_REGEX = r"^https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$"
logger = logging.getLogger(__name__)

load_dotenv(SERVICE_ROOT / ".env")


class MossRuntimeConfig(NamedTuple):
    python_executable: str
    model_dir: Path
    prompt_audio_path: Path
    execution_provider: str
    cpu_threads: str
    timeout_seconds: float


def resolve_path(value: str | Path, *, base_dir: Path = SERVICE_ROOT) -> Path:
    path = Path(value).expanduser()
    if not path.is_absolute():
        path = base_dir / path
    return path.resolve()


def resolve_path_from_env(name: str, default: str | Path | None = None) -> Path | None:
    raw_value = os.getenv(name)
    if raw_value is not None and raw_value.strip():
        return resolve_path(raw_value.strip())
    if default is None:
        return None
    return resolve_path(default)


def get_output_dir() -> Path:
    output_dir = resolve_path_from_env("TTS_OUTPUT_DIR", "./generated_audio")
    assert output_dir is not None
    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir


def get_reference_audio_path(prompt_audio_path: Path | None = None) -> Path:
    if prompt_audio_path is not None:
        return prompt_audio_path

    configured_path = resolve_path_from_env("TTS_PROMPT_AUDIO_PATH")
    if configured_path is not None:
        if not configured_path.exists():
            raise HTTPException(
                status_code=503,
                detail=f"Local TTS is offline: TTS_PROMPT_AUDIO_PATH does not exist ({configured_path}).",
            )
        return configured_path

    if DEFAULT_REFERENCE_AUDIO_PATH.exists():
        return DEFAULT_REFERENCE_AUDIO_PATH.resolve()

    raise HTTPException(
        status_code=503,
        detail=(
            "Local TTS is offline: no reference audio was found. "
            "Add voice.wav at the repo root or set TTS_PROMPT_AUDIO_PATH."
        ),
    )


def get_reference_audio_label() -> str | None:
    configured_value = os.getenv("TTS_PROMPT_AUDIO_PATH", "").strip()
    if configured_value:
        return Path(configured_value).name or configured_value
    if DEFAULT_REFERENCE_AUDIO_PATH.exists():
        return DEFAULT_REFERENCE_AUDIO_PATH.name
    return None


def get_moss_runtime_config(prompt_audio_path: Path | None = None) -> MossRuntimeConfig:
    if shutil.which("moss-tts-nano") is None:
        raise HTTPException(
            status_code=503,
            detail="Local TTS is offline: moss-tts-nano is not installed or is not on PATH.",
        )

    model_dir = resolve_path_from_env("TTS_MODEL_DIR", "./models")
    if model_dir is None or not model_dir.exists():
        raise HTTPException(
            status_code=503,
            detail=f"Local TTS is offline: TTS_MODEL_DIR does not exist ({model_dir}).",
        )

    reference_audio_path = get_reference_audio_path(prompt_audio_path)

    execution_provider = os.getenv("TTS_EXECUTION_PROVIDER", "cpu").strip().lower()
    if execution_provider not in {"cpu", "cuda"}:
        raise HTTPException(
            status_code=503,
            detail="Local TTS is offline: TTS_EXECUTION_PROVIDER must be cpu or cuda.",
        )

    cpu_threads = os.getenv("TTS_CPU_THREADS", "4").strip()
    if not cpu_threads.isdigit() or int(cpu_threads) < 1:
        raise HTTPException(
            status_code=503,
            detail="Local TTS is offline: TTS_CPU_THREADS must be a positive integer.",
        )

    return MossRuntimeConfig(
        python_executable=sys.executable,
        model_dir=model_dir,
        prompt_audio_path=reference_audio_path,
        execution_provider=execution_provider,
        cpu_threads=cpu_threads,
        timeout_seconds=parse_timeout_seconds(),
    )


class TTSRequest(BaseModel):
    text: str = Field(..., max_length=MAX_TEXT_LENGTH)
    voice: str | None = Field(default=None, max_length=80)
    speed: float = Field(default=1.0, ge=0.5, le=2.0)
    language: str | None = Field(default=None, max_length=16)

    @field_validator("text")
    @classmethod
    def text_must_not_be_empty(cls, value: str) -> str:
        cleaned_value = value.strip()
        if not cleaned_value:
            raise ValueError("Text is required.")
        return cleaned_value

    @field_validator("voice", "language")
    @classmethod
    def optional_strings_must_not_be_blank(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned_value = value.strip()
        return cleaned_value or None


app = FastAPI(title="ADHDToolbox TTS")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=os.getenv("TTS_ALLOW_ORIGIN_REGEX", DEFAULT_ALLOWED_ORIGIN_REGEX),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str | None]:
    try:
        runtime = get_moss_runtime_config()
    except HTTPException as exc:
        return {
            "status": "offline",
            "engine": ENGINE_NAME,
            "mode": TTS_MODE,
            "reference_audio": get_reference_audio_label(),
            "detail": str(exc.detail),
        }

    return {
        "status": "ok",
        "engine": ENGINE_NAME,
        "mode": TTS_MODE,
        "reference_audio": runtime.prompt_audio_path.name,
        "detail": None,
    }


@app.post("/tts", response_class=Response, responses={200: {"content": {"audio/wav": {}}}})
async def synthesize_speech(request: Request) -> Response:
    tts_request, prompt_audio_path = await parse_tts_request(request)
    output_path = get_output_dir() / f"{uuid4().hex}.wav"

    try:
        runtime = get_moss_runtime_config(prompt_audio_path)
        return synthesize_with_moss_cli(tts_request, output_path, runtime)
    finally:
        if prompt_audio_path is not None:
            cleanup_file(prompt_audio_path)


async def parse_tts_request(request: Request) -> tuple[TTSRequest, Path | None]:
    content_type = request.headers.get("content-type", "").lower()

    if content_type.startswith("multipart/form-data"):
        form = await request.form()
        prompt_audio_path = extract_prompt_audio_path(form.get("prompt_audio"))
        try:
            tts_request = TTSRequest.model_validate(
                {
                    "text": form.get("text"),
                    "voice": form.get("voice"),
                    "speed": form.get("speed"),
                    "language": form.get("language"),
                }
            )
        except ValidationError as exc:
            raise HTTPException(status_code=422, detail=exc.errors()) from exc

        return tts_request, prompt_audio_path

    if content_type.startswith("application/json") or not content_type:
        try:
            payload = await request.json()
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Request body must be valid JSON.") from exc

        try:
            tts_request = TTSRequest.model_validate(payload)
        except ValidationError as exc:
            raise HTTPException(status_code=422, detail=exc.errors()) from exc

        return tts_request, None

    raise HTTPException(
        status_code=415,
        detail="Unsupported content type. Use application/json or multipart/form-data.",
    )


def extract_prompt_audio_path(upload: object | None) -> Path | None:
    if upload is None or upload == "":
        return None

    if not hasattr(upload, "file") or not hasattr(upload, "filename"):
        raise HTTPException(status_code=400, detail="prompt_audio must be an uploaded file.")

    upload_file = upload.file
    suffix = Path(upload.filename or "").suffix or ".wav"
    temp_path: Path | None = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_path = Path(temp_file.name)
            shutil.copyfileobj(upload_file, temp_file)
    except Exception as exc:
        if temp_path is not None:
            cleanup_file(temp_path)
        raise HTTPException(status_code=400, detail="Unable to read the uploaded prompt audio.") from exc
    finally:
        upload_file.close()

    return temp_path


def synthesize_with_moss_cli(
    request: TTSRequest,
    output_path: Path,
    runtime: MossRuntimeConfig,
) -> Response:
    command = [
        runtime.python_executable,
        "-m",
        "app.moss_cli_wrapper",
        "generate",
        "--backend",
        "onnx",
        "--onnx-model-dir",
        str(runtime.model_dir),
        "--output",
        str(output_path),
        "--text",
        request.text,
        "--voice",
        request.voice or DEFAULT_FALLBACK_VOICE,
        "--execution-provider",
        runtime.execution_provider,
        "--cpu-threads",
        runtime.cpu_threads,
        "--prompt-speech",
        str(runtime.prompt_audio_path),
    ]

    try:
        subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
            timeout=runtime.timeout_seconds,
            shell=False,
        )
    except subprocess.TimeoutExpired as exc:
        cleanup_file(output_path)
        raise HTTPException(
            status_code=503,
            detail=f"Local TTS timed out after {runtime.timeout_seconds} seconds.",
        ) from exc
    except subprocess.CalledProcessError as exc:
        cleanup_file(output_path)
        stdout = (exc.stdout or "").strip()
        stderr = (exc.stderr or "").strip()
        message = stderr or stdout or "moss-tts-nano failed."
        logger.error(
            "moss-tts-nano failed returncode=%s stdout=%s stderr=%s",
            exc.returncode,
            stdout or "<empty>",
            stderr or "<empty>",
        )
        raise HTTPException(status_code=503, detail=f"Local TTS failed: {message}") from exc

    if not output_path.exists():
        raise HTTPException(status_code=503, detail="Local TTS failed: no WAV output was created.")

    return FileResponse(
        output_path,
        media_type="audio/wav",
        filename="adhdtoolbox-read-aloud.wav",
        background=BackgroundTask(cleanup_file, output_path),
    )


def parse_timeout_seconds() -> float:
    raw_timeout = os.getenv("TTS_TIMEOUT_SECONDS", "120").strip()
    try:
        timeout_seconds = float(raw_timeout)
    except ValueError as exc:
        raise HTTPException(
            status_code=503,
            detail="Local TTS is offline: TTS_TIMEOUT_SECONDS must be a number.",
        ) from exc

    if timeout_seconds <= 0:
        raise HTTPException(
            status_code=503,
            detail="Local TTS is offline: TTS_TIMEOUT_SECONDS must be greater than zero.",
        )

    return timeout_seconds


def cleanup_file(path: Path) -> None:
    try:
        path.unlink(missing_ok=True)
    except OSError:
        pass
