# TTS Backend

The TTS service lives in `services/tts` and exposes two endpoints:

- `GET /health` reports whether the local `moss-tts-nano` runtime is ready and which reference clip it will use.
- `POST /tts` accepts JSON with `text` and returns `audio/wav`.

The service calls:

```bash
moss-tts-nano generate --backend onnx
```

The service passes `--onnx-model-dir`, `--output`, `--text`, `--voice`, `--execution-provider`, `--cpu-threads`, and `--prompt-speech` with `subprocess.run([...], shell=False)`.

## Environment

The service auto-loads `services/tts/.env` at startup without overriding shell-exported variables. Copy `services/tts/.env.example` if you want a local file-based setup:

```bash
TTS_MODEL_DIR=./models
TTS_OUTPUT_DIR=./generated_audio
TTS_PROMPT_AUDIO_PATH=../../voice.wav
TTS_EXECUTION_PROVIDER=cpu
TTS_CPU_THREADS=4
TTS_TIMEOUT_SECONDS=120
TTS_HOST=127.0.0.1
TTS_PORT=8000
```

- Install `moss-tts-nano` so it is on `PATH`.
- Keep the ONNX model files under `services/tts/models` or point `TTS_MODEL_DIR` elsewhere.
- The backend defaults to the repo root `voice.wav` sample. Set `TTS_PROMPT_AUDIO_PATH` only when you want to override that reference clip.
- Keep `TTS_EXECUTION_PROVIDER=cpu` unless CUDA ONNX Runtime is installed.

If the CLI, model directory, reference audio, or numeric settings are invalid, `/tts` returns a 503 JSON error and `/health` reports the failure detail.

## Validation

From `services/tts`:

```bash
uv sync
uv run python -m compileall app
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

In another terminal:

```bash
curl http://127.0.0.1:8000/health
curl -sS -X POST http://127.0.0.1:8000/tts \
  -H 'Content-Type: application/json' \
  -d '{"text":"Try a short local read aloud test."}' \
  --output /tmp/adhdtoolbox-tts-test.wav
```

This should be validated only on machines where `moss-tts-nano`, the local ONNX models, and the sample reference clip are present.

## Frontend Dev Proxy

When you start the full app with:

```bash
npm run dev:stack
```

the Vite frontend proxies `/api/*` to the local TTS backend. That avoids browser CORS issues and means remote or forwarded browser sessions only need access to the frontend port.

## Upstream References

The MOSS-TTS-Nano README documents ONNX CPU inference, local demos, and the packaged CLI with `--backend onnx`: https://github.com/OpenMOSS/MOSS-TTS-Nano

The current CLI source exposes the generate command and ONNX options used here, including `--onnx-model-dir`, `--execution-provider`, `--cpu-threads`, and `--voice`: https://raw.githubusercontent.com/OpenMOSS/MOSS-TTS-Nano/main/moss_tts_nano/cli.py
