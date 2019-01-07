#!/usr/bin/env bash
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

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

echo "running webdriverio tests..."

set +e
"$IC_ROOT/node_modules/.bin/wdio" "$IC_ROOT/config/wdio/travis.js"

if [[ $? == 1 ]]; then
    pushd "$IC_ROOT/tools/travis-wdio-reporter"
        node html-generator.js
        aws s3 sync "s3://innovatorscompass/wdio-report-${TRAVIS_BUILD_NUMBER}" s3-static/
    popd
fi
set -e
