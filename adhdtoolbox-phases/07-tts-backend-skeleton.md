# ADHDToolbox Phase 7: FastAPI TTS Backend Skeleton

Use this file as the instruction prompt for Codex for this phase only.

## Project Context

ADHDToolbox is a no-login, privacy-friendly quick tools website for ADHD/neurodivergent users.

Core principles:
- No sign-in
- No database
- No user accounts
- Browser-side data should use `localStorage`
- Backend should exist only for local MOSS-TTS-Nano integration
- Keep the UI calm, fast, accessible, and mobile-friendly
- Avoid medical claims
- Avoid heavy dependencies unless they clearly help
- Use relevant installed Codex skills for implementation, UI/UX, accessibility, testing, documentation, and code quality

## Theme Requirement: Catppuccin Mocha

Use Catppuccin Mocha as the main theme. Define reusable design tokens instead of scattering raw hex values.

Core Mocha tokens:
```css
--ctp-rosewater: #f5e0dc;
--ctp-flamingo: #f2cdcd;
--ctp-pink: #f5c2e7;
--ctp-mauve: #cba6f7;
--ctp-red: #f38ba8;
--ctp-maroon: #eba0ac;
--ctp-peach: #fab387;
--ctp-yellow: #f9e2af;
--ctp-green: #a6e3a1;
--ctp-teal: #94e2d5;
--ctp-sky: #89dceb;
--ctp-sapphire: #74c7ec;
--ctp-blue: #89b4fa;
--ctp-lavender: #b4befe;
--ctp-text: #cdd6f4;
--ctp-subtext1: #bac2de;
--ctp-subtext0: #a6adc8;
--ctp-overlay2: #9399b2;
--ctp-overlay1: #7f849c;
--ctp-overlay0: #6c7086;
--ctp-surface2: #585b70;
--ctp-surface1: #45475a;
--ctp-surface0: #313244;
--ctp-base: #1e1e2e;
--ctp-mantle: #181825;
--ctp-crust: #11111b;
```

Suggested usage:
- App background: `base`
- Deeper background areas: `mantle` / `crust`
- Cards: `surface0`
- Card hover/borders: `surface1` / `surface2`
- Primary text: `text`
- Secondary text: `subtext0` / `subtext1`
- Primary accent: `mauve`
- Secondary accent: `blue`
- Positive/done: `green`
- Warning/gentle attention: `yellow`
- Error: `red`
- Timer/progress accents: `teal`, `sky`, or `lavender`

Keep the theme soft and readable. Do not make the interface overly neon or cyberpunk.

## Goal

Create the local TTS backend API contract before integrating the real MOSS-TTS-Nano model.

## Tool Purpose

The backend will eventually wrap MOSS-TTS-Nano. In this phase, create a clean FastAPI service with mock/dev mode so the frontend can integrate safely.

## Backend Endpoints

### GET `/health`

Return:

```json
{
  "status": "ok",
  "engine": "moss-tts-nano",
  "mode": "mock"
}
```

### POST `/tts`

Input:

```json
{
  "text": "Text to read aloud",
  "voice": "optional voice or preset",
  "speed": 1.0,
  "language": "en"
}
```

For this phase, mock mode may return:
- a simple generated placeholder WAV if practical
- or a clear JSON response saying mock mode is enabled

Prefer returning an audio-compatible response if easy.

## Backend Requirements

- FastAPI app structure should be clean.
- Add CORS for local frontend.
- Add request validation.
- Add useful errors for:
  - empty text
  - text too long
  - backend misconfiguration
- Add env config:
  - `TTS_MODE=mock`
  - `TTS_MODEL_DIR`
  - `TTS_OUTPUT_DIR`
  - `TTS_MAX_CHARS`
- Ensure generated output/cache directories are gitignored.
- Add cleanup notes for temporary audio.

## Frontend Integration

Update Read Aloud tool to support two modes:

```text
Browser TTS
Local MOSS TTS
```

For Local MOSS TTS:
- Use `VITE_TTS_API_URL`
- Check backend health
- Show backend status:
  - Available
  - Offline
  - Error
- Allow user to send text to local backend
- Show a clear error if backend is unavailable
- Do not break Browser TTS mode if backend is offline

## Privacy Copy

Add/update copy:

```text
Local MOSS TTS sends text only to your own local TTS service.
```

## Constraints

- Do not integrate real MOSS-TTS-Nano yet unless trivial.
- Keep mock mode useful for frontend development.
- Do not commit generated audio.
- Do not commit model files.

## Validation Steps

Backend:

```bash
cd services/tts
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Check health:

```bash
curl http://127.0.0.1:8000/health
```

Check mock TTS:

```bash
curl -X POST http://127.0.0.1:8000/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello from ADHDToolbox","speed":1.0,"language":"en"}'
```

Frontend:

```bash
cd apps/web
npm run build
```

Manual validation:
- Browser TTS still works
- Local MOSS mode detects backend online
- Local MOSS mode handles backend offline gracefully
- Empty text is handled gracefully
- Backend rejects invalid request safely
- No generated audio is tracked by git

Skip validation only if scripts/runtimes are unavailable. If skipped, explain why.
