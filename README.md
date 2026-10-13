# ADHDToolbox

ADHDToolbox is a lightweight frontend with practical tools for reading support, focus timers, starter tasks, and time tracking.

- `apps/web`: Vite + React + TypeScript frontend
- `docs`: project notes and design-system documentation

## Requirements

- Node.js with `npm`

## Run locally

Install workspace dependencies from the repository root:

```bash
npm install
```

Start the web app:

```bash
npm run dev
```

Build or lint it:

```bash
npm run build:web
npm run lint:web
```

## Read Aloud

Read Aloud uses your browser’s built-in speech engine. The app does not send text to a TTS server and does not create downloadable audio files.

Voice availability varies by browser and operating system. The voice list shows voices in the reader's language and English, with on-device voices first. Some browsers also offer online voices (for example Chrome's "Google" voices); these are marked "online" in the list because the browser sends the text to its provider to speak it. If no voices are reported, playback uses the browser's default voice.
