#!/usr/bin/env bash
set -e
if [ -d "apps/backend-api" ]; then
  echo "Moving apps/backend-api → apps/backend-api.deprecated"
  git mv apps/backend-api apps/backend-api.deprecated
  git commit -m "Deprecate legacy Node backend (moved to apps/backend-api.deprecated)" || true
  echo "Done. You can delete apps/backend-api.deprecated after verification."
else
  echo "apps/backend-api not found"
fi
