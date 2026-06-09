# ADHDToolbox

ADHDToolbox is a local-first monorepo with quick tools for reading support, focus timers, starter tasks, and lightweight time tracking.

- `apps/web`: Vite + React + TypeScript frontend
- `services/tts`: FastAPI backend for local MOSS-TTS-Nano WAV generation
- `docs`: project notes and backend setup details

## Requirements

- Node.js with `npm`
- Python 3.11+
- [`uv`](https://docs.astral.sh/uv/)

## Frontend

Install workspace dependencies from the repo root:

```bash
npm install
```

Run the web app from the repo root:

```bash
npm run dev
```

This starts the Vite frontend and exits cleanly when you press `Ctrl+C`.

Run the web app with the local TTS backend too:

```bash
npm run dev:stack
```

`npm run dev:stack` starts both services and proxies Read Aloud requests through the Vite frontend at `/api`, so forwarded-browser sessions only need the web port. Read Aloud uses the local `moss-tts-nano` backend path and the repo sample voice at `voice.wav` by default.

Build or lint the web app:

```bash
npm run build:web
npm run lint:web
```

Frontend environment variables live in `apps/web/.env.example`. Read Aloud calls `VITE_TTS_API_URL` directly when set. `npm run dev:stack` instead sets `VITE_TTS_API_URL=/api` and proxies those requests to the local backend automatically.

## Backend

From `services/tts`, install the Python dependencies with `uv`:

```bash
cd services/tts
uv sync
```

Run the backend locally:

```bash
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Compile the backend package as a quick sanity check:

```bash
uv run python -m compileall app
```

Check the health endpoint:

```bash
curl http://127.0.0.1:8000/health
```

Expected response when the local backend is ready:

```json
{"status":"ok","engine":"moss-tts-nano","mode":"moss-cli","reference_audio":"voice.wav","detail":null}
```

Generate a WAV with the local sample voice:

```bash
curl -sS -X POST http://127.0.0.1:8000/tts \
  -H 'Content-Type: application/json' \
  -d '{"text":"Try a short local read aloud test."}' \
  --output /tmp/adhdtoolbox-tts-test.wav
```

Backend environment variables live in `services/tts/.env.example`. The service auto-loads `services/tts/.env` when present and defaults to the repo sample voice at `voice.wav`. Local moss-tts setup is documented in `docs/tts-backend.md`.
