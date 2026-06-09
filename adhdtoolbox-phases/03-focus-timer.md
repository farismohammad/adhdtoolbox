# ADHDToolbox Phase 3: Focus Timer

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

Implement a fully working calm Focus Timer.

## Tool Purpose

The Focus Timer helps users start, continue, pause, and extend focus sessions, breaks, or transition periods.

## Features

Build the Focus Timer tool with:

- Preset buttons:
  - 2 min
  - 5 min
  - 10 min
  - 15 min
  - 25 min
- Custom minutes input
- Start
- Pause
- Resume
- Stop
- Add 5 minutes
- Large readable countdown
- Gentle completion state:
  ```text
  Session complete. What next?
  ```
- Optional localStorage preference for last selected timer duration

## Timer Logic Requirements

Use timestamp-based timer logic.

Do not rely only on `setInterval` decrementing a number every second.

Use an approach like:
- Store target end timestamp when timer starts
- Calculate remaining time from `endTime - Date.now()`
- On pause, store remaining milliseconds
- On resume, create a new end timestamp
- Clear intervals properly
- Avoid multiple intervals running at the same time

## Suggested Hook

Create a reusable hook:

```text
useCountdownTimer
```

Suggested timer states:

```text
idle
running
paused
complete
```

## UX Requirements

- Avoid harsh wording like:
  - failed
  - expired
  - missed
- Use calm wording:
  - Start
  - Pause
  - Continue
  - Stop
  - Add 5 min
  - Session complete
- The countdown should be the visual focus.
- Buttons should be large enough for mobile.
- Use Catppuccin accents:
  - timer/progress: `teal`, `sky`, or `lavender`
  - primary action: `mauve`
  - complete: `green`

## Constraints

- Do not implement Tiny Todo timer integration yet.
- Keep the Focus Timer standalone for now.
- Do not add notifications unless they are simple and browser-safe.
- If adding audio or alerts, keep them optional and gentle.

## Validation Steps

Run:

```bash
cd apps/web
npm run build
```

If lint exists:

```bash
npm run lint
```

Manual validation:
- 2 min preset starts correctly
- 5/10/15/25 min presets set correctly
- Custom duration works
- Pause freezes remaining time
- Resume continues from paused time
- Stop returns to idle
- Add 5 minutes works while running
- Completion state appears
- Timer remains accurate after switching tabs for a short time
- No duplicate intervals or accelerated countdown behavior

Skip validation only if scripts are not available. If skipped, explain why.
