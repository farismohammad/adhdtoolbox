# ADHDToolbox Phase 5: Simple Time Tracker

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

Build a lightweight time tracker that helps users understand where time went.

## Tool Purpose

This is not meant to be a corporate analytics dashboard. It should feel simple and low-pressure.

## Features

Build:

- Start tracking button
- Optional label input
- Quick label suggestions:
  - studying
  - cleaning
  - admin
  - break
- Stop tracking button
- Current active tracking session display
- Today’s session list
- Total tracked time today
- Clear/reset local tracker data option

## Persistence

Use localStorage.

Suggested key:

```text
adhdtoolbox.timeSessions
```

Suggested data shape:

```ts
type TimeSession = {
  id: string;
  label?: string;
  startedAt: string;
  endedAt?: string;
};
```

## Logic Requirements

- Only one active session at a time.
- If a session is active and user refreshes, show it as still active.
- Total time today should include:
  - completed sessions from today
  - active session elapsed time if currently running
- Keep date handling simple but correct for local time.

## UX Requirements

- Use calm wording:
  - Start tracking
  - Stop
  - Today
  - Total today
- Avoid language like:
  - productivity score
  - wasted time
  - efficiency
- Use Catppuccin:
  - active tracking: `teal` or `sky`
  - session cards: `surface0`
  - total today: `mauve` or `lavender`
  - clear/reset: subtle `red`

## Constraints

- Do not add charts.
- Do not add analytics-heavy views.
- Do not add backend sync.
- Do not add accounts.

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
- Start tracking without label
- Start tracking with custom label
- Start tracking with quick label
- Stop tracking
- Today’s sessions show correctly
- Total today updates correctly
- Refresh during active session and confirm it continues showing elapsed time
- Clear/reset tracker data works
- Only one active session can run at a time
- No console errors

Skip validation only if scripts are not available. If skipped, explain why.
