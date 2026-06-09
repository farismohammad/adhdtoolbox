# ADHDToolbox Phase 6: Browser TTS

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

Build the Read Aloud tool using browser-native TTS first.

## Tool Purpose

Let users paste text and listen to it immediately, without requiring the local MOSS backend.

## Features

Build:

- Textarea for pasted text
- Browser TTS mode using the Web Speech API
- Play
- Pause
- Resume if supported
- Stop
- Speed control
- Voice selection where available
- Clear text
- Unsupported-browser fallback message
- localStorage preference for speed and selected voice if practical

## Privacy Copy

Show this near the TTS tool:

```text
Browser TTS reads text directly in your browser. Your pasted text is not uploaded.
```

## Technical Requirements

- Use `window.speechSynthesis`
- Use `SpeechSynthesisUtterance`
- Load available voices safely
- Handle browsers where voices load asynchronously
- Guard against unsupported browsers
- Stop speech when leaving/unmounting the component
- Avoid creating overlapping utterances
- Handle empty text gracefully

## UX Requirements

- The textarea should be large and readable.
- Controls should be obvious.
- Disable Play when no text exists.
- Show a gentle unsupported message if needed.
- Use Catppuccin:
  - textarea: `surface0`
  - text: `text`
  - controls: `mauve`, `blue`, `teal`
  - warning/unsupported: `yellow`

## Constraints

- Do not integrate MOSS-TTS-Nano yet.
- Do not add backend calls in this phase.
- Do not send text anywhere.

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
- Paste text and play
- Pause works where browser supports it
- Resume works where browser supports it
- Stop works
- Speed changes apply
- Voice selection appears if voices exist
- Clear text works
- Empty text does not crash
- Component does not continue speaking after navigating away/unmounting
- Unsupported browser case is handled without crashing

Skip validation only if scripts or browser APIs are unavailable. If skipped, explain why.
