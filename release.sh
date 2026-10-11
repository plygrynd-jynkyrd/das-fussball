#!/usr/bin/env bash
# Bump the version of all apps together, then build and push them to Docker Hub.
# Usage: ./release.sh <patch|minor|major>
# Requires a prior `docker login -u leonardiwagner` (use a Docker Hub access token as password).
set -euo pipefail
cd "$(dirname "$0")"

BUMP="${1:?usage: ./release.sh <patch|minor|major>}"
USER="leonardiwagner"
APPS=(app-defender app-midfielder app-attacker)

# Bump the first app, then give the others the exact same version.
VERSION=$(cd "apps/${APPS[0]}" && npm version "$BUMP" --no-git-tag-version | tr -d v)
for app in "${APPS[@]:1}"; do
  (cd "apps/$app" && npm version "$VERSION" --no-git-tag-version >/dev/null)
done

for app in "${APPS[@]}"; do
  image="$USER/das-fussball-$app"
  # EKS nodes are linux/amd64 by default
  docker build --platform linux/amd64 -t "$image:$VERSION" -t "$image:latest" "apps/$app"
  docker push "$image:$VERSION"
  docker push "$image:latest"
done

git add apps/*/package.json apps/*/package-lock.json
git commit -m "release v$VERSION"
git tag "v$VERSION"
echo "Released v$VERSION (commit and tag created locally; push with: git push --follow-tags)"
