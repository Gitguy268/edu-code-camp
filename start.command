#!/bin/bash
# Double-click to run edu-code-camp. It installs and builds what's missing, starts a local server
# on http://localhost:5281 and opens your browser. Close this window to stop it.
cd "$(dirname "$0")" || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
PORT=5281

command -v node >/dev/null || { echo "edu-code-camp needs Node.js 20 or newer: https://nodejs.org"; read -rp "Press Enter to close."; exit 1; }
[ -d node_modules ] || npm ci || exit 1

if [ ! -f public/alpine/fs.json ]; then
  if docker info >/dev/null 2>&1; then
    echo "Building the Linux image for the command-line lessons (one time, a few minutes)..."
    ./scripts/build-image.sh || echo "The Linux image didn't build; everything except the Linux lessons still works."
  else
    echo "Docker isn't running, so the Linux lessons stay off. Everything else works."
  fi
fi

# Rebuild when any source is newer than the last build.
if [ ! -f dist/index.html ] || [ -n "$(find index.html src content public scripts vite.config.js package.json NOTICE -newer dist/index.html 2>/dev/null | head -1)" ]; then
  npm run build || exit 1
fi

if curl -s -o /dev/null "http://localhost:$PORT/"; then
  echo "edu-code-camp is already running."
else
  npx vite preview --port $PORT --strictPort &
  trap 'kill $! 2>/dev/null' EXIT
  for _ in $(seq 1 50); do curl -s -o /dev/null "http://localhost:$PORT/" && break; sleep 0.2; done
fi
open "http://localhost:$PORT/"
echo "edu-code-camp is running at http://localhost:$PORT/. Close this window to stop it."
wait
