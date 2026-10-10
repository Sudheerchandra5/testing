#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export LD_LIBRARY_PATH="${ROOT}/mesa-libs/usr/lib/x86_64-linux-gnu:${LD_LIBRARY_PATH:-}"
export LIBGL_ALWAYS_SOFTWARE=1
"${ROOT}/blender-4.2.3-linux-x64/blender" --background --python "${ROOT}/scripts/blender_boy_puppy_10s.py"
