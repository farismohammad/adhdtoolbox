# ADHDToolbox Phase 1: Project Scaffold

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

Scaffold the empty repository into a clean monorepo for ADHDToolbox.

## Tasks

1. Inspect the current directory.
2. Confirm it is empty or nearly empty.
3. Create this structure:

```text
/apps/web
/services/tts
/docs
README.md
.gitignore
```

4. Scaffold the frontend in `/apps/web`:
   - React
   - TypeScript
   - Vite
   - Tailwind CSS
   - ESLint if easy/practical

5. Scaffold the backend in `/services/tts`:
   - Python FastAPI
   - uvicorn
   - `requirements.txt` or `pyproject.toml`
   - Basic app entrypoint
   - Basic `/health` endpoint returning:
     ```json
     {
       "status": "ok",
       "engine": "not-configured"
     }
     ```

6. Add root-level `.gitignore` covering:
   - `node_modules`
   - `.env`
   - `.env.*`
   - Python virtualenvs
   - `__pycache__`
   - generated audio
   - model directories
   - cache directories
   - build outputs

7. Add `.env.example` files:
   - `/apps/web/.env.example`
   - `/services/tts/.env.example`

Frontend `.env.example`:
```env
VITE_TTS_API_URL=http://localhost:8000
```

Backend `.env.example`:
```env
TTS_MODE=mock
TTS_MODEL_DIR=./models
TTS_OUTPUT_DIR=./generated_audio
TTS_HOST=127.0.0.1
TTS_PORT=8000
```

8. Add basic README instructions:
   - install frontend dependencies
   - run frontend
   - create Python venv
   - install backend dependencies
   - run backend

## Constraints

- Do not implement app features yet.
- Do not integrate MOSS-TTS-Nano yet.
- Do not add model weights.
- Do not add generated audio files.
- Keep the scaffold simple and clean.

## Validation Steps

Run frontend checks:

```bash
cd apps/web
npm install
npm run build
```

Run backend checks:

```bash
cd services/tts
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m compileall .
uvicorn app.main:app --reload
```

Verify:

```bash
curl http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "status": "ok",
  "engine": "not-configured"
}
```

Skip validation steps only if the relevant package manager or runtime is not available. If skipped, explain why.
