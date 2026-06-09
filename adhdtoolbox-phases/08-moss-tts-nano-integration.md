# ADHDToolbox Phase 8: MOSS-TTS-Nano Integration

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

Integrate the local FastAPI backend with MOSS-TTS-Nano.

## Tool Purpose

Enable local higher-quality TTS generation through MOSS-TTS-Nano while keeping Browser TTS as a fallback.

## Required Repo

Use:

```text
https://github.com/OpenMOSS/MOSS-TTS-Nano
```

## Preferred Direction

Use the MOSS-TTS-Nano ONNX CPU path if practical.

Preferred approach:
- Do not vendor the MOSS-TTS-Nano repository into this repo unless necessary.
- Do not commit model weights.
- Do not commit generated audio.
- Keep model setup documented and external.
- Use the existing MOSS-TTS-Nano CLI/server/runtime if practical.
- Wrap it cleanly from FastAPI.

## Tasks

1. Inspect the MOSS-TTS-Nano README and local usage instructions.
2. Identify the best local inference path:
   - ONNX CPU inference
   - CLI generate
   - existing server endpoint
   - Python runtime import
3. Choose the least fragile integration approach.
4. Document the choice in `/docs/tts-backend.md`.
5. Implement real `/tts` generation.
6. Return generated audio to the frontend.
7. Keep Browser TTS fallback intact.
8. Keep mock mode available for development.

## Backend Requirements

- Add config for:
  - model directory
  - output directory
  - backend mode
  - execution provider, default CPU
  - prompt/reference audio path if needed
- Validate text length.
- Use safe temporary filenames.
- Avoid shell injection if invoking CLI.
- Do not expose arbitrary file paths.
- Return a playable audio response.
- Add clear errors when:
  - model files missing
  - MOSS-TTS-Nano dependency missing
  - generation fails
  - prompt/reference audio missing

## Frontend Requirements

- Local MOSS mode should:
  - Generate audio
  - Show loading state while generating
  - Play generated audio
  - Allow replay
  - Show useful errors
- Browser TTS should remain available.
- The user should understand that Local MOSS requires running the local backend.

## Documentation Requirements

Create/update:

```text
/docs/tts-backend.md
```

Include:
- MOSS-TTS-Nano setup
- ONNX CPU setup if used
- model download notes
- backend env variables
- how to run backend
- how to test `/health`
- how to test `/tts`
- known limitations

## Constraints

- Do not add cloud TTS APIs.
- Do not send text to third-party services.
- Do not commit models.
- Do not commit generated audio.
- Do not break app if MOSS backend is offline.

## Validation Steps

Backend dependency check:

```bash
cd services/tts
source .venv/bin/activate
pip install -r requirements.txt
python -m compileall .
```

Run backend:

```bash
uvicorn app.main:app --reload
```

Check health:

```bash
curl http://127.0.0.1:8000/health
```

Test TTS:

```bash
curl -X POST http://127.0.0.1:8000/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"This is a local ADHDToolbox TTS test.","speed":1.0,"language":"en"}' \
  --output /tmp/adhdtoolbox-tts-test.wav
```

Frontend:

```bash
cd apps/web
npm run build
```

Manual validation:
- Local MOSS generation works
- Generated audio plays in browser
- Loading state appears
- Backend errors are user-friendly
- Browser TTS fallback still works
- Backend offline state still works
- `git status` does not show generated audio or model files

Skip validation only where model setup is unavailable. If skipped, explain exactly what remains TODO.
