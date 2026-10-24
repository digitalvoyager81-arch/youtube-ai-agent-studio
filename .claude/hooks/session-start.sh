#!/bin/bash
set -euo pipefail

# Only needed in Claude Code cloud sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# TTS dependency for the remotion-video skill
if ! python3 -c "import edge_tts" 2>/dev/null; then
  pip install --quiet edge-tts
fi
