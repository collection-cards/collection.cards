#!/usr/bin/env bash
set -e

ASSETS_DIR="assets"
PRIVATE_ASSETS_URL="git@collection.cards:collection-cards/private-assets.collection.cards.git"
VERCEL_ASSETS_URL="git@github.com:collection-cards/private-assets.collection.cards.git"
PUBLIC_ASSETS_URL="https://github.com/collection-cards/assets.collection.cards.git"

has_private_access() {
  if [ "$VERCEL" != "1" ]; then
    export GIT_SSH_COMMAND="ssh -o BatchMode=yes -o ConnectTimeout=2"
    git ls-remote --heads "$PRIVATE_ASSETS_URL" &>/dev/null
  else
    export GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o BatchMode=yes -o ConnectTimeout=2"
    git ls-remote --heads "$VERCEL_ASSETS_URL" &>/dev/null
    export GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
  fi
}

echo "Setting up $ASSETS_DIR…"

# Determine desired repo
if has_private_access; then
  if [ "$VERCEL" != "1" ]; then
    DESIRED_URL="$PRIVATE_ASSETS_URL"
  else
    DESIRED_URL="$VERCEL_ASSETS_URL"
  fi
  echo "✅ Using private assets"
else
  DESIRED_URL="$PUBLIC_ASSETS_URL"
  echo "⚠️ Using public assets"
fi

# Check current repo URL (if directory exists)
if [ -d "$ASSETS_DIR" ]; then
  CURRENT_URL=$(git -C "$ASSETS_DIR" remote get-url origin 2>/dev/null || echo "")
else
  CURRENT_URL=""
fi

# If directory does not exist or repo URL differs → clone fresh
if [ "$CURRENT_URL" != "$DESIRED_URL" ]; then
  echo "🔄 Assets repo mismatch or missing. Resetting $ASSETS_DIR…"
  rm -rf "$ASSETS_DIR"

  git clone --depth 1 "$DESIRED_URL" "$ASSETS_DIR"

  # Switch back to the public repo to prevent assets from pointing to the private hash
  if has_private_access; then
    git submodule set-url "$ASSETS_DIR" "$PUBLIC_ASSETS_URL"
  fi
else
  echo "✅ $ASSETS_DIR already up-to-date, skipping fetch"
fi

# Create symlinks to the assets directories
find ./assets -mindepth 1 -type d | while read -r src; do
  dst="./${src#./assets/}"
  src_abs="$(realpath "$src")"
  [ -e "$dst" ] && continue
  ln -s "$src_abs" "$dst" 2>/dev/null || true
done

# Link shared icon source files that are imported by the generated icon
# directories. Directory-only linking leaves icons/pokemon/* unable to resolve
# ../../CC on a fresh checkout.
if [ -f "./$ASSETS_DIR/icons/CC.tsx" ]; then
  dst="./icons/CC.tsx"
  src_abs="$(realpath "./$ASSETS_DIR/icons/CC.tsx")"
  [ -e "$dst" ] || ln -s "$src_abs" "$dst" 2>/dev/null || true
fi

echo "✅ Assets setup complete"
