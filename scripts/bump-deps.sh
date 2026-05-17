#!/usr/bin/env bash
set -euo pipefail

echo "==> Bump main project dependencies"
pnpm update --latest

echo ""
echo "==> Bump .opencode workspace dependencies"
pnpm update --latest @opencode-ai/plugin --dir .opencode

echo ""
echo "==> Regenerate lockfile"
pnpm install --no-frozen-lockfile
