#!/bin/bash
cd "$(dirname "$0")"

# Handle --restart flag
if [ "$1" = "--restart" ] || [ "$1" = "-r" ]; then
    echo "Restarting: killing existing processes..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    pkill -f "tauri" 2>/dev/null
    pkill -f "lyria-ai-studio" 2>/dev/null
    sleep 1
    echo "Cleanup complete."
fi

# Enable Rust/Tauri logging
export RUST_LOG=debug
export RUST_BACKTRACE=1

echo "Starting Lyria AI Studio in dev mode..."
echo "Tauri logs will appear below."
echo "-----------------------------------"

bun tauri dev 2>&1
