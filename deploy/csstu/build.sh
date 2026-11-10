#!/bin/bash
# Builds the upload folder for the university student server (csstu.psru.ac.th).
#
#   ./deploy/csstu/build.sh [student-id]      (default 6212231018)
#
# Produces deploy/csstu/out/public_html/ and deploy/csstu/csstu-upload.zip.
# Upload the *contents* of public_html/ into public_html/ on the server by FTP.
set -euo pipefail

STUDENT_ID="${1:-6212231018}"
BASE="/~${STUDENT_ID}/"
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="$HERE/out/public_html"

rm -rf "$HERE/out" "$HERE/csstu-upload.zip"
mkdir -p "$OUT"

# The page lives under /~ID/; every API call and uploaded image goes through
# api.php next to it; routes use "#" because the userdir cannot rewrite paths.
(cd "$HERE/../../front-end" && \
  VITE_API="${BASE}api.php" \
  VITE_UPLOADS_BASE="${BASE}api.php" \
  VITE_HASH_ROUTER=1 \
  npx vite build --base="$BASE" --outDir "$OUT" --emptyOutDir)

cp "$HERE/api.php" "$HERE/check.php" "$OUT/"

(cd "$HERE/out" && zip -qr "$HERE/csstu-upload.zip" public_html)
echo "Built $OUT"
echo "Zip:  $HERE/csstu-upload.zip"
