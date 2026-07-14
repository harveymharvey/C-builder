#!/bin/bash
# APC Lesson Builder — double-click to run.
# Starts the local server and opens the UI in your default browser.

cd "$(dirname "$0")"

# Verify Node is installed
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed."
  echo "Install it from https://nodejs.org (LTS) and then double-click this file again."
  read -p "Press Enter to close..."
  exit 1
fi

# Install dependencies on first run (idempotent)
if [ ! -d "node_modules" ]; then
  echo "First run — installing dependencies (this only happens once)..."
  npm install --silent
fi

# Start the server in the background, open the browser, then stream server output
echo "Starting APC Lesson Builder..."
node server.js &
SERVER_PID=$!

# Give the server a second to bind
sleep 1.5

# Open browser (macOS uses 'open', Linux uses 'xdg-open')
if command -v open >/dev/null 2>&1; then
  open "http://localhost:4173"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "http://localhost:4173"
fi

echo ""
echo "  The builder is now running at http://localhost:4173"
echo "  Close this Terminal window to stop the server."
echo ""

# Trap Ctrl+C so the server shuts down cleanly
trap "echo 'Shutting down...'; kill $SERVER_PID 2>/dev/null; exit 0" INT TERM

# Wait for the server process
wait $SERVER_PID
