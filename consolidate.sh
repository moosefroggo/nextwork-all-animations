#!/usr/bin/env bash
# consolidate.sh — gathers animations from all projects into nextwork-all-animations
# Run from anywhere: bash ~/Downloads/nextwork-all-animations/consolidate.sh

set -euo pipefail

DEST="$HOME/Downloads/nextwork-all-animations"

# ── 1. Create folder structure ─────────────────────────────────────────────
mkdir -p "$DEST/svg"
mkdir -p "$DEST/html-css"
mkdir -p "$DEST/threejs"
mkdir -p "$DEST/assets"

echo "✓ Folder structure ready"

# ── 2. Helper: copy a file, skip exact duplicates, rename on name collision ─
copy_file() {
  local src="$1"
  local dest_dir="$2"
  local filename
  filename=$(basename "$src")

  # Skip macOS junk
  [[ "$filename" == .DS_Store ]] && return
  [[ "$filename" == ._* ]] && return

  local dest_path="$dest_dir/$filename"

  # Exact duplicate (same size + same name) → skip
  if [[ -f "$dest_path" ]] && [[ $(wc -c < "$src") -eq $(wc -c < "$dest_path") ]]; then
    echo "  skip (duplicate): $filename"
    return
  fi

  # Name collision but different content → add suffix
  if [[ -f "$dest_path" ]]; then
    local base="${filename%.*}"
    local ext="${filename##*.}"
    local i=2
    while [[ -f "$dest_dir/${base}-${i}.${ext}" ]]; do ((i++)); done
    dest_path="$dest_dir/${base}-${i}.${ext}"
    echo "  rename conflict:  $filename → $(basename "$dest_path")"
  fi

  cp "$src" "$dest_path"
  echo "  copied: $(basename "$dest_path")"
}

# ── 3. Route a file to the right subfolder ─────────────────────────────────
route_file() {
  local src="$1"
  local filename
  filename=$(basename "$src")
  local ext="${filename##*.}"
  ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')  # lowercase

  case "$ext" in
    svg)
      copy_file "$src" "$DEST/svg" ;;
    html|htm)
      # Peek inside for Three.js usage
      if grep -qi "three" "$src" 2>/dev/null; then
        copy_file "$src" "$DEST/threejs"
      else
        copy_file "$src" "$DEST/html-css"
      fi ;;
    js|ts|jsx|tsx)
      if grep -qi "three\|webgl\|shader" "$src" 2>/dev/null; then
        copy_file "$src" "$DEST/threejs"
      else
        copy_file "$src" "$DEST/html-css"
      fi ;;
    css)
      copy_file "$src" "$DEST/html-css" ;;
    json|lottie)
      copy_file "$src" "$DEST/assets" ;;
    png|jpg|jpeg|gif|webp|mp4|webm)
      copy_file "$src" "$DEST/assets" ;;
    sh)
      return ;;  # skip this script itself
    *)
      copy_file "$src" "$DEST/assets" ;;
  esac
}

# ── 4. Process a source directory ──────────────────────────────────────────
process_dir() {
  local dir="$1"
  if [[ ! -d "$dir" ]]; then
    echo "⚠  Not found, skipping: $dir"
    return
  fi
  echo ""
  echo "── Scanning: $dir"
  while IFS= read -r -d '' file; do
    route_file "$file"
  done < <(find "$dir" -type f -print0)
}

# ── 5. Move loose files already in the root of DEST ───────────────────────
echo ""
echo "── Organizing existing files in nextwork-all-animations/"
while IFS= read -r -d '' file; do
  route_file "$file"
done < <(find "$DEST" -maxdepth 1 -type f -print0)

# ── 6. Pull from all source projects ──────────────────────────────────────
process_dir "$HOME/anims"
process_dir "$HOME/animu"
process_dir "$HOME/anims2"
process_dir "$HOME/Downloads/nextwork-anim"

# ── 7. Summary ─────────────────────────────────────────────────────────────
echo ""
echo "Done! Final counts:"
echo "  svg/      $(find "$DEST/svg"      -type f | wc -l | tr -d ' ') files"
echo "  html-css/ $(find "$DEST/html-css" -type f | wc -l | tr -d ' ') files"
echo "  threejs/  $(find "$DEST/threejs"  -type f | wc -l | tr -d ' ') files"
echo "  assets/   $(find "$DEST/assets"   -type f | wc -l | tr -d ' ') files"
echo ""
echo "Open your folder: open \"$DEST\""
