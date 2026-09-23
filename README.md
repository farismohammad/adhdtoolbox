# ADHD Toolbox

A lightweight web application with practical tools for reading support, focus, starter tasks, and time tracking. Built with React, TypeScript, and Vite, with a Docker/Nginx deployment option.

## Tools

- **Read Aloud:** listen to pasted text with voice, rate, pitch, and playback controls.
- **Focus Timer:** keep a focus session in view.
- **Tiny Todo:** capture a task and make it small enough to start.
- **Time Tracker:** track what you are doing.
- **Reading comfort:** switch between standard, comfort, hyperlegible, and dyslexia font options.

## Run locally

Use a Node.js version compatible with the Vite 7 dependency: Node.js 20.19+ or 22.12+. Install from the repository root:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. To build, lint, or preview the production build:

```bash
npm run build:web
npm run lint:web
npm run preview:web
```

## Docker deployment

With Docker and Docker Compose installed, run from the repository root:

```bash
docker compose up --build
```

Open http://localhost:3000. The multi-stage Dockerfile builds the frontend and serves the static output with Nginx. This repository does not require a separate application API for these tools.

## Project structure

- [`apps/web`](apps/web): React + TypeScript frontend, tool panels, and state hooks.
- [`docker/nginx/web.conf`](docker/nginx/web.conf): static-site server configuration.
- [`docs/design-system.md`](docs/design-system.md): design-system notes.

## Read Aloud compatibility

Read Aloud uses the browser's speech-synthesis API rather than an application TTS server and does not create downloadable audio files. Speech-engine behavior depends on the browser and operating system.

The current implementation offers Daniel (en-GB), Samantha (en-US), and Karen (en-AU) when those voices are available. If none are installed or exposed by the browser, playback is unavailable. Rate, pitch, pause, resume, and stop controls are provided.
