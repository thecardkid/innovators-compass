#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

echo "Waiting for server to start"
i="0"
until $(curl --output /dev/null --silent --head --fail "http://localhost:8080"); do
    if [[ "$i" -gt 300 ]]; then
        echo "iCompass server not detected. Exiting"
        exit 1
    fi
    printf '.'
    i=$[$i+1]
    sleep 1
done
echo "iCompass server detected"

echo "running webdriverio tests..."
"$IC_ROOT/node_modules/.bin/wdio" "$IC_ROOT/config/wdio/travis.js"
