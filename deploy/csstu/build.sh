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

# The real page becomes index.php so it can send "Cache-Control: no-cache":
# Apache here sends no caching header for .html, and browsers then keep the
# previous build for hours after an upload. index.html stays as a stub that
# never changes and only forwards to index.php (keeping the #/route), so even a
# cached copy of it always leads to the current page.
{ printf '<?php header("Cache-Control: no-cache"); ?>'; cat "$OUT/index.html"; } > "$OUT/index.php"
cat > "$OUT/index.html" <<'HTML'
<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=index.php">
<title>PSRU Booking</title>
<script>location.replace("index.php" + location.hash);</script>
</head>
<body><a href="index.php">เปิดระบบจองห้อง</a></body>
</html>
HTML

(cd "$HERE/out" && zip -qr "$HERE/csstu-upload.zip" public_html)
echo "Built $OUT"
echo "Zip:  $HERE/csstu-upload.zip"
