FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

WORKDIR /srv/services/tts

RUN apt-get update \
    && apt-get install -y --no-install-recommends git ffmpeg libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

COPY services/tts/pyproject.toml services/tts/README.md ./

RUN pip install .

COPY services/tts/app ./app
COPY voice.wav /srv/voice.wav

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
