# ADHDToolbox Phased Implementation Overview

Use these files one at a time with Codex. Do not ask Codex to implement all phases at once.

Recommended order:

1. `01-scaffold.md`
2. `02-ui-shell-catppuccin.md`
3. `03-focus-timer.md`
4. `04-tiny-todo-task-timers.md`
5. `05-time-tracker.md`
6. `06-browser-tts.md`
7. `07-tts-backend-skeleton.md`
8. `08-moss-tts-nano-integration.md`
9. `09-polish-accessibility.md`
10. `10-final-validation-docs.md`

Main build strategy:
- Build a useful frontend first.
- Add browser TTS before local model TTS.
- Add the FastAPI/MOSS-TTS-Nano backend after the local tools work.
- Keep every phase small and independently testable.

Non-negotiables:
- No sign-in
- No database
- No user accounts
- localStorage only for tasks, timers, tracker sessions, and preferences
- Local backend only for MOSS-TTS-Nano
- Catppuccin Mocha as the main theme
- Calm, accessible, mobile-first UI
