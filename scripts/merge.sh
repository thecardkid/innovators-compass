#!/usr/bin/env bash
set -euo pipefail

curr_branch="$(git branch | grep \* | cut -d ' ' -f2)"
if [[ "$curr_branch" == "develop" ]]; then
    echo "Need to be on feature branch to merge" >&2
    exit 1
fi

git checkout test-branch
git merge --squash "$curr_branch"
commit_messages="$(git log --format=%B --reverse develop..${curr_branch})"
git commit -m "Merge branch \"$curr_branch\"" -m "$commit_messages"
