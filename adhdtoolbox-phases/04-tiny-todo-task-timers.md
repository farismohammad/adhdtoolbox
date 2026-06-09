# ADHDToolbox Phase 4: Tiny Todo with Task Timers

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

Build the Tiny Todo tool with a timer attached to each task.

## Tool Purpose

Tiny Todo is not a full project management app. It is a small local task list that helps users externalize tasks and start them with a small time anchor.

Core idea:

```text
What am I willing to try for 2, 5, 10, 15, or 25 minutes?
```

## Features

Build:

### Add Task

- Text input for task name
- Optional duration
- Quick duration buttons:
  - 2 min
  - 5 min
  - 10 min
  - 15 min
  - 25 min
- Add task button
- Pressing Enter should add the task if input is valid

### Task Row

Each task row should show:

- Checkbox
- Task name
- Duration if set
- Start button
- Delete button

If task has no duration, show:

```text
Start with 2 min
```

### Focused Task Timer

When starting a task, show/highlight a focused timer view with:

- Current task name
- Countdown
- Pause
- Done
- Add 5 min
- Stop

Use the reusable timer logic from Phase 3 if possible.

### Completed Tasks

- Completed tasks should be visually distinct
- Add “Clear completed”
- Do not shame users for incomplete tasks
- Keep wording neutral and calm

### Persistence

Save tasks to localStorage.

Suggested localStorage key:

```text
adhdtoolbox.tasks
```

Suggested task shape:

```ts
type Task = {
  id: string;
  title: string;
  durationMinutes?: number;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
};
```

## UX Requirements

- Keep the tool compact.
- Avoid tags, projects, priorities, and due dates.
- This should remain a tiny list.
- Make starting a task very easy.
- Default fallback timer should be 2 minutes.
- Use Catppuccin:
  - task card: `surface0`
  - active task: subtle `mauve` or `teal` border
  - completed task: `green` accent
  - delete/destructive: `red`, but not too loud

## Constraints

- Do not build a full todo app.
- Do not add accounts.
- Do not add backend persistence.
- Do not add cloud sync.

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
- Add task with duration
- Add task without duration
- Start task with set duration
- Start task with “Start with 2 min”
- Pause/resume focused task timer
- Add 5 min to focused task timer
- Mark task done
- Delete task
- Clear completed tasks
- Refresh page and confirm tasks persist
- Confirm completed state persists
- Confirm no console errors

Skip validation only if scripts are not available. If skipped, explain why.
