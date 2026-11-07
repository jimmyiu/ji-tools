#!/usr/bin/env bash
set -euo pipefail

echo "==> Bump main project dependencies"
pnpm update --latest

echo ""
echo "==> Regenerate lockfile"
pnpm install --no-frozen-lockfile
