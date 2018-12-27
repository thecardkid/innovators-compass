#!/usr/bin/env bash
set -euo pipefail

curr_branch="$(git branch | grep \* | cut -d ' ' -f2)"
if [[ "$curr_branch" == "develop" ]]; then
    echo "Need to be on feature branch to merge" >&2
    exit 1
fi

git checkout test-branch
git merge --squash "$curr_branch"
git commit
