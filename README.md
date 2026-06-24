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

Read Aloud uses your browser’s built-in speech engine. Text and generated audio stay on the device; the app does not send text to a TTS server and does not create downloadable audio files.

Voice availability varies by browser and operating system. The feature provides browser-default voice selection, rate, pitch, and playback controls.
