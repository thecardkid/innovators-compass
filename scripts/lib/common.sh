#!/usr/bin/env bash
set -euo pipefail

export IC_ROOT="$(unset CDPATH;cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
