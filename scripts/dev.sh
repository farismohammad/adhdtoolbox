#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_HOST="${WEB_HOST:-127.0.0.1}"
WEB_PORT="${WEB_PORT:-5173}"

port_is_available() {
  local host="$1"
  local port="$2"

  python3 - "$host" "$port" <<'PY' >/dev/null 2>&1
import socket
import sys

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        sock.bind((sys.argv[1], int(sys.argv[2])))
    except OSError:
        raise SystemExit(1)
PY
}

while ! port_is_available "$WEB_HOST" "$WEB_PORT"; do
  echo "Port ${WEB_PORT} is in use, trying another one..." >&2
  WEB_PORT=$((WEB_PORT + 1))
done

echo "Web frontend will run at http://${WEB_HOST}:${WEB_PORT}"
cd "$ROOT_DIR/apps/web"
exec npm run dev -- --host "$WEB_HOST" --port "$WEB_PORT"
