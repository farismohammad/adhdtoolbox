# ADHDToolbox TTS Service

FastAPI service for the Read Aloud local moss-tts path.

The service shells out to the installed `moss-tts-nano` CLI with the ONNX backend and local model assets. By default it uses the repo root `voice.wav` sample as the reference clip, or `TTS_PROMPT_AUDIO_PATH` if you override it.

See `../../docs/tts-backend.md` for setup, environment variables, and validation commands.
