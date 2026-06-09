# ADHDToolbox Phase 10: Final Validation and Documentation

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

Clean up the repo, validate the app, and make documentation clear enough to run later.

## Tasks

1. Review the full repository.
2. Remove dead code.
3. Remove unused dependencies.
4. Ensure generated files are ignored.
5. Ensure model files are ignored.
6. Ensure `.env.example` files are accurate.
7. Ensure README is clear.
8. Ensure docs explain the TTS backend.

## README Requirements

Update root `README.md` with:

- Project name: ADHDToolbox
- Short description
- Features:
  - Read Aloud
  - Focus Timer
  - Tiny Todo with task timers
  - Simple Time Tracker
  - Local MOSS-TTS-Nano backend
  - Browser TTS fallback
- Architecture:
  - `/apps/web`
  - `/services/tts`
  - `/docs`
- How to run frontend
- How to run backend
- Environment variables
- Privacy notes
- Known limitations

## Docs Requirements

Ensure `/docs/tts-backend.md` includes:

- MOSS-TTS-Nano setup
- ONNX CPU notes if used
- How to configure model path
- How to run backend
- How to test health
- How to test TTS generation
- Known limitations
- Troubleshooting

Optional docs:

```text
/docs/design-system.md
```

If useful, document:
- Catppuccin Mocha token usage
- Button styles
- Card styles
- Accessibility rules

## Git Hygiene

Ensure `.gitignore` covers:

```text
node_modules
dist
.env
.env.*
.venv
venv
__pycache__
.pytest_cache
.mypy_cache
generated_audio
models
cache
*.wav
*.mp3
*.flac
```

Do not commit:
- model weights
- generated audio
- personal environment files
- cache directories

## Final Validation Steps

Frontend:

```bash
cd apps/web
npm install
npm run build
```

If lint exists:

```bash
npm run lint
```

Backend:

```bash
cd services/tts
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m compileall .
uvicorn app.main:app --reload
```

Backend health:

```bash
curl http://127.0.0.1:8000/health
```

Backend TTS:

```bash
curl -X POST http://127.0.0.1:8000/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Final ADHDToolbox test.","speed":1.0,"language":"en"}'
```

Git check:

```bash
git status --short
```

Manual app validation:
- Homepage loads
- Catppuccin Mocha theme is consistent
- Focus Timer works
- Tiny Todo works and persists
- Task timers work
- Time Tracker works and persists
- Browser TTS works or fails gracefully
- Local MOSS TTS works or clearly explains what is missing
- Backend offline state does not break frontend
- Mobile layout is usable
- Keyboard navigation works
- No obvious console errors

If any validation step cannot be performed, document:
- what was skipped
- why it was skipped
- what the user should run next
