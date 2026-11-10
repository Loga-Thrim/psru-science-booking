#!/bin/bash
# Uploads deploy/csstu/out/public_html to public_html on csstu.psru.ac.th by FTP.
#
#   ./deploy/csstu/upload.sh [student-id]      (default 6212231018)
#
# Asks for the FTP password without echoing it. The password is kept only in a
# temporary netrc file (mode 600) that is deleted on exit, so it never appears
# in the process list or shell history.
#
# The server is plain FTP (it refuses AUTH TLS), so the password crosses the
# network unencrypted; that is the university server's setup, not this script's.
set -euo pipefail

STUDENT_ID="${1:-6212231018}"
HOST="csstu.psru.ac.th"
HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="$HERE/out/public_html"

[ -f "$SRC/index.html" ] || { echo "ยังไม่มีไฟล์ build: รัน ./deploy/csstu/build.sh $STUDENT_ID ก่อน"; exit 1; }

NETRC="$(mktemp)"
trap 'rm -f "$NETRC"' EXIT
chmod 600 "$NETRC"

read -r -s -p "รหัสผ่าน FTP ของ $STUDENT_ID: " PASS
echo
printf 'machine %s login %s password %s\n' "$HOST" "$STUDENT_ID" "$PASS" > "$NETRC"
unset PASS

# Check the login once before touching anything.
if ! curl -sS --netrc-file "$NETRC" --list-only "ftp://$HOST/" >/dev/null; then
  echo "เข้าสู่ระบบ FTP ไม่สำเร็จ (รหัสผ่านไม่ถูก หรือเครือข่ายนี้เข้า FTP ไม่ได้)"
  exit 1
fi

echo "อัปโหลดไปที่ ftp://$HOST/public_html/"
cd "$SRC"
count=0
while IFS= read -r -d '' f; do
  p="${f#./}"
  printf '  ↑ %s\n' "$p"
  curl -sS --netrc-file "$NETRC" --ftp-create-dirs -T "$p" "ftp://$HOST/public_html/$p"
  count=$((count + 1))
done < <(find . -type f -print0 | sort -z)

echo
echo "เสร็จแล้ว: อัปโหลด $count ไฟล์"
echo "ตรวจการเชื่อมต่อ: https://$HOST/~$STUDENT_ID/check.php"
echo "หน้าเว็บ:         https://$HOST/~$STUDENT_ID/"
