#!/usr/bin/env bash
set -euo pipefail

curr_branch="$(git branch | grep \* | cut -d ' ' -f2)"
if [[ "$curr_branch" == "develop" ]]; then
    echo "Need to be on feature branch to merge" >&2
    exit 1
fi

commit_messages="$(git log --format=%B --reverse develop..${curr_branch})"

cat <<EOF >&2


about to squash merge branch "$curr_branch" into develop with the following commit message:

>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
Merge branch "$curr_branch"

$commit_messages
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



EOF

read -p "Continue? [y/N] " input >&2
if [[ $input != "y" && $input != "Y" ]]; then
    echo "aborting" >&2
    exit 1
fi

# check branch is not dirty
status="$(git status -s)"
if [[ ! -z "$status" ]]; then
    echo "aborting, git branch is dirty" >&2
    exit 1
fi

echo "committing..." >&2
git checkout test-branch
git merge --squash "$curr_branch"
git commit -m "Merge branch \"$curr_branch\"" -m "$commit_messages"

git status
