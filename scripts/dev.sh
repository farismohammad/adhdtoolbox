#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIDS=()
WEB_HOST="${WEB_HOST:-127.0.0.1}"
WEB_PORT="${WEB_PORT:-5173}"
TTS_HOST="${TTS_HOST:-127.0.0.1}"
TTS_PORT="${TTS_PORT:-8000}"
FRONTEND_TTS_API_URL="${VITE_TTS_API_URL:-}"
FRONTEND_TTS_PROXY_TARGET="${VITE_TTS_PROXY_TARGET:-}"

start_in_dir() {
  local name="$1"
  local dir="$2"
  shift 2

  echo "Starting ${name}..."
  pushd "$dir" >/dev/null
  "$@" &
  local pid=$!
  popd >/dev/null
  PIDS+=("$pid")
}

port_is_available() {
  local host="$1"
  local port="$2"

  python3 - "$host" "$port" <<'PY' >/dev/null 2>&1
import socket
import sys

host = sys.argv[1]
port = int(sys.argv[2])

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        sock.bind((host, port))
    except OSError:
        raise SystemExit(1)

raise SystemExit(0)
PY
}

find_available_port() {
  local host="$1"
  local port="$2"

  while ! port_is_available "$host" "$port"; do
    echo "Port ${port} is in use, trying another one..." >&2
    port=$((port + 1))
  done

  printf '%s\n' "$port"
}

stop_repo_dev_processes() {
  local patterns=(
    "$ROOT_DIR/node_modules/.bin/vite"
    "$ROOT_DIR/services/tts.*uvicorn app.main:app"
  )
  local pids=()
  local pattern
  local pid
  local existing_pid
  local duplicate

  for pattern in "${patterns[@]}"; do
    while IFS= read -r pid; do
      [[ -z "$pid" ]] && continue
      duplicate=0
      for existing_pid in "${pids[@]}"; do
        if [[ "$existing_pid" == "$pid" ]]; then
          duplicate=1
          break
        fi
      done
      if [[ "$duplicate" -eq 0 ]]; then
        pids+=("$pid")
      fi
    done < <(pgrep -f "$pattern" || true)
  done

  if [[ "${#pids[@]}" -eq 0 ]]; then
    return
  fi

  echo "Stopping older ADHDToolbox dev processes: ${pids[*]}"
  kill "${pids[@]}" 2>/dev/null || true
  sleep 1

  for pid in "${pids[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi
  done
}

cleanup() {
  local exit_code="${1:-0}"

  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done

  for pid in "${PIDS[@]}"; do
    wait "$pid" 2>/dev/null || true
  done

  exit "$exit_code"
}

trap 'cleanup 130' INT
trap 'cleanup 143' TERM

stop_repo_dev_processes

if [[ "${DEV_START_TTS:-0}" == "1" ]]; then
  TTS_PORT="$(find_available_port "$TTS_HOST" "$TTS_PORT")"
  TTS_API_URL="http://${TTS_HOST}:${TTS_PORT}"
  FRONTEND_TTS_API_URL="${FRONTEND_TTS_API_URL:-/api}"
  FRONTEND_TTS_PROXY_TARGET="${FRONTEND_TTS_PROXY_TARGET:-$TTS_API_URL}"
  echo "TTS backend will run at ${TTS_API_URL}"
  start_in_dir \
    "TTS backend" \
    "$ROOT_DIR/services/tts" \
    env TTS_HOST="$TTS_HOST" TTS_PORT="$TTS_PORT" \
    uv run uvicorn app.main:app --reload --host "$TTS_HOST" --port "$TTS_PORT"
fi

WEB_PORT="$(find_available_port "$WEB_HOST" "$WEB_PORT")"
echo "Web frontend will run at http://${WEB_HOST}:${WEB_PORT}"

if [[ -n "$FRONTEND_TTS_API_URL" || -n "$FRONTEND_TTS_PROXY_TARGET" ]]; then
  if [[ -n "$FRONTEND_TTS_PROXY_TARGET" ]]; then
    echo "Read Aloud will use ${FRONTEND_TTS_API_URL:-/api} via Vite proxy to ${FRONTEND_TTS_PROXY_TARGET}"
  else
    echo "Read Aloud will use ${FRONTEND_TTS_API_URL}"
  fi
  start_in_dir \
    "web frontend" \
    "$ROOT_DIR/apps/web" \
    env VITE_TTS_API_URL="$FRONTEND_TTS_API_URL" VITE_TTS_PROXY_TARGET="$FRONTEND_TTS_PROXY_TARGET" \
    npm run dev -- --host "$WEB_HOST" --port "$WEB_PORT"
else
  start_in_dir \
    "web frontend" \
    "$ROOT_DIR/apps/web" \
    npm run dev -- --host "$WEB_HOST" --port "$WEB_PORT"
fi

wait -n "${PIDS[@]}"
exit_code=$?
cleanup "$exit_code"
