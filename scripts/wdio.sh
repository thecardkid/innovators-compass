#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

WEBPACK=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-webpack)
      echo "skipping webpack." >&2
      WEBPACK=0
      ;;

    -*)
      echo "unknown option $1." >&2
      exit 1
      ;;
  esac
  shift
done

if [[ "$WEBPACK" -eq 1 ]]; then
    "$IC_ROOT/node_modules/.bin/webpack" --config "$IC_ROOT/config/webpack/prod.js"
fi

echo "Waiting for server to start"
i="0"
until $(curl --output /dev/null --silent --head --fail "http://localhost:8080"); do
    if [ $i -gt 30 ]; then
        echo "iCompass server not detected. Exiting"
        exit 1
    fi
    printf '.'
    i=$[$i+1]
    sleep 1
done
echo "iCompass server detected"

echo ""
echo "running webdriverio tests..."
"$IC_ROOT/node_modules/.bin/wdio" "$IC_ROOT/config/wdio.conf.js"
