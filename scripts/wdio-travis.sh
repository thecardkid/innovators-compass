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
set -e

if [[ $? == 1 ]]; then
    pushd "$IC_ROOT/tools/travis-wdio-reporter"
        echo "generating HTML report.."
        node html-generator.js
        echo "copying report to S3 bucket.."
        aws s3 sync "s3://innovatorscompass/wdio-report-${TRAVIS_BUILD_NUMBER}" s3-static/ --acl public-read
        echo -e "\nWebdriverIO failures detected, to see the full report, go to https://s3.us-east-2.amazonaws.com/innovatorscompass/wdio-report-${TRAVIS_BUILD_NUMBER}/index.html"
        exit 1
    popd
fi
