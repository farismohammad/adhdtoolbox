# ADHDToolbox Phase 9: Polish, Accessibility, and UX Pass

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

Make ADHDToolbox feel calm, usable, and polished.

## Tasks

Perform a full UI/UX and accessibility pass across:

- Homepage
- Read Aloud
- Focus Timer
- Tiny Todo
- Time Tracker
- Backend status/error states

## Accessibility Checklist

Implement/fix:

- Semantic landmarks:
  - header
  - main
  - section
  - nav if applicable
- Accessible button labels
- Inputs have labels
- Textareas have labels
- Visible focus states
- Keyboard navigation
- No keyboard traps
- Proper disabled states
- Good contrast on Catppuccin Mocha
- Respect `prefers-reduced-motion`
- Avoid tiny tap targets
- Error messages are readable and clear
- Loading states are announced where practical
- Timer status should be understandable without relying only on color

## UX Copy Guidelines

Use friendly, low-pressure wording.

Good:
```text
Start with 2 min
Session complete. What next?
Add 5 min
Clear completed
Local TTS is offline
```

Avoid:
```text
Failed
Expired
Productivity score
Wasted time
You missed this
```

## Visual Polish

- Make spacing consistent
- Make cards consistent
- Make buttons consistent
- Improve mobile layout
- Use Catppuccin Mocha consistently
- Avoid too many accent colors on one screen
- Keep primary actions visually clear
- Make destructive actions subtle but recognizable

## Empty States

Add friendly empty states for:

- No tasks
- No completed tasks
- No time sessions today
- TTS text empty
- Backend offline

## Error States

Add clear errors for:

- Browser TTS unsupported
- Local backend offline
- Local TTS generation failed
- localStorage unavailable, if detected

## Constraints

- Do not add major new features.
- Do not add accounts.
- Do not add database.
- Do not make the UI busier.

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
- Navigate the whole app with keyboard
- Check mobile width
- Check desktop width
- Check empty states
- Check error states
- Check disabled button states
- Check focus outlines
- Check reduced motion behavior if animations exist
- Confirm Catppuccin Mocha is consistent
- Confirm no console errors

Skip validation only if scripts are not available. If skipped, explain why.
