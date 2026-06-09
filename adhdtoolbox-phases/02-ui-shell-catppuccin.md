# ADHDToolbox Phase 2: Core UI Shell + Catppuccin Mocha Theme

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

Build the main ADHDToolbox interface shell using Catppuccin Mocha.

## Tasks

1. Configure Tailwind and global CSS for Catppuccin Mocha.
2. Create reusable theme tokens.
3. Build the homepage.
4. Add tool cards for:
   - Read Aloud
   - Focus Timer
   - Tiny Todo
   - Time Tracker
5. Add placeholder sections/pages for each tool.
6. Add responsive mobile-first layout.
7. Add a visible privacy note.

## Homepage Copy

Title:

```text
ADHDToolbox
```

Subtitle:

```text
Quick tools for focus, reading, time, and getting started. No account. No setup.
```

Privacy note:

```text
Your tasks, timers, and pasted text stay in your browser. If you enable Local MOSS TTS, text is sent only to your own local TTS service.
```

## UI Requirements

- Background should use Catppuccin Mocha `base`
- Header/nav areas can use `mantle`
- Cards should use `surface0`
- Borders should use `surface1`
- Main text should use `text`
- Muted text should use `subtext0` or `subtext1`
- Main CTA/accent should use `mauve`
- Secondary accents can use `blue`, `lavender`, `teal`, or `sky`
- Completed/success state should use `green`
- Warning/gentle attention should use `yellow`
- Error state should use `red`

## Components To Create

Suggested components:

```text
AppShell
Header
ToolGrid
ToolCard
SectionCard
PrivacyNote
Button
Input
Textarea
```

Keep components simple. Avoid overengineering.

## Accessibility Requirements

- Use semantic HTML
- Ensure buttons are real `<button>` elements
- Ensure visible focus states
- Use readable font sizes
- Use accessible color contrast
- Avoid tiny click targets
- Respect `prefers-reduced-motion`
- Tool cards should be keyboard accessible

## Constraints

- Do not implement tool logic yet.
- Placeholder sections are enough.
- Do not add backend calls in this phase.

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
- Homepage loads
- Theme looks like Catppuccin Mocha
- Cards are readable
- Mobile layout works
- Keyboard tabbing reaches buttons/cards
- No console errors

Skip validation only if scripts are not available. If skipped, explain why.
