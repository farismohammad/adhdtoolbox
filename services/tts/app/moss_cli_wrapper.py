from __future__ import annotations

import sys
import wave
from pathlib import Path

import torch
import torchaudio
from moss_tts_nano.cli import main as moss_tts_main


def _load_wav_with_stdlib(path: str | Path) -> tuple[torch.Tensor, int]:
    resolved_path = Path(path).expanduser().resolve()
    with wave.open(str(resolved_path), "rb") as wav_file:
        sample_rate = wav_file.getframerate()
        channels = wav_file.getnchannels()
        sample_width = wav_file.getsampwidth()
        frame_count = wav_file.getnframes()
        raw_frames = wav_file.readframes(frame_count)

    if sample_width != 2:
        raise RuntimeError(
            f"Unsupported WAV sample width for local reference audio: {sample_width * 8}-bit."
        )

    # torch.frombuffer warns on immutable bytes; copy into a writable buffer first.
    waveform = torch.frombuffer(bytearray(raw_frames), dtype=torch.int16).clone()
    waveform = waveform.reshape(frame_count, channels).transpose(0, 1)
    waveform = waveform.to(dtype=torch.float32) / 32768.0
    return waveform, sample_rate


def _patch_torchaudio_load() -> None:
    original_load = torchaudio.load

    def patched_load(
        uri: str | Path,
        *args: object,
        **kwargs: object,
    ) -> tuple[torch.Tensor, int]:
        try:
            return original_load(uri, *args, **kwargs)
        except RuntimeError:
            if Path(uri).suffix.lower() != ".wav":
                raise
            return _load_wav_with_stdlib(uri)

    torchaudio.load = patched_load


def main() -> int:
    _patch_torchaudio_load()
    return int(moss_tts_main())


if __name__ == "__main__":
    raise SystemExit(main())
