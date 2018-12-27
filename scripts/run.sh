#!/usr/bin/env bash

set -euo pipefail

export IC_ROOT="$(unset CDPATH;cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"

source "$IC_ROOT/runner.sh"

# allow failure
set +e
    which mongod
    exists=$?
set -e
if [[ exists -eq 1 ]]; then
    echo "Installing mongodb" >&2
    if [[ ! -e /usr/local/bin/brew ]]; then
        echo "Install homebrew first" >&2
        exit 1
    fi
    brew install mongodb
fi

# restart in case mongo is already running
brew services restart mongodb

nodemon "$IC_ROOT/icompass.js"
