#!/bin/bash
# Loads demo data: staff accounts, rooms, and a realistic spread of bookings.
#
#   cd /opt/psru-booking && ./seed/seed.sh
#
# Safe to re-run: accounts and rooms that already exist are reported and skipped
# by the API. Reservations are only added if the room is free at that time, so a
# second run mostly no-ops.
#
# Demo accounts all share one password, printed at the end. This is demo data on
# a demo deployment; do not load it into a system holding real bookings.
set -euo pipefail

cd "$(dirname "$0")/.."

set -a; . ./.env; set +a
BASE="https://${SITE_ADDRESS}"
DEMO_PASSWORD="${DEMO_PASSWORD:-PsruDemo2569}"
FACULTY="คณะวิทยาศาสตร์และเทคโนโลยี"

need() { command -v "$1" >/dev/null || { echo "ต้องติดตั้ง $1 ก่อน"; exit 1; }; }
need curl
need jq

echo "== 1. สร้างบัญชีผู้ใช้ =="
jq -c '.[]' seed/users.json | while read -r u; do
  email=$(jq -r '.email' <<<"$u")
  name=$(jq -r '.username' <<<"$u")
  body=$(jq -n --arg u "$name" --arg e "$email" --arg p "$DEMO_PASSWORD" --arg d "$FACULTY" \
    '{username:$u, email:$e, password:$p, department:$d}')
  code=$(curl -s -o /tmp/reg.json -w '%{http_code}' -X POST "$BASE/api/register" \
    -H 'Content-Type: application/json' --data-binary "$body")
  printf '  %-28s %s %s\n' "$email" "$code" "$(jq -r '.message // empty' /tmp/reg.json)"
done

echo
echo "== 2. กำหนดสิทธิ์ =="
# Roles are not settable through /register, which always creates a plain user.
# Built line by line in the shell: embedding the SQL quotes inside a jq program
# that is itself shell-single-quoted is where this went wrong before.
: > /tmp/roles.sql
jq -r '.[] | "\(.email) \(.role)"' seed/users.json | while read -r email role; do
  echo "UPDATE users SET role='$role' WHERE email='$email';" >> /tmp/roles.sql
done
docker compose exec -T db mysql -uroot -p"$DB_PASSWORD" --default-character-set=utf8mb4 "$DB_NAME" \
  < /tmp/roles.sql 2>&1 | grep -v '^mysql:.*Warning' || true
docker compose exec -T db mysql -uroot -p"$DB_PASSWORD" --default-character-set=utf8mb4 "$DB_NAME" \
  -e "SELECT role, COUNT(*) AS n FROM users GROUP BY role;" 2>&1 | grep -v '^mysql:.*Warning'

echo
echo "== 3. สร้างห้อง =="
TOKEN=$(curl -s -X POST "$BASE/api/login" -H 'Content-Type: application/json' \
  --data-binary "$(jq -n --arg e "porntip.j@psru.ac.th" --arg p "$DEMO_PASSWORD" '{email:$e,password:$p}')" \
  | jq -r '.token')
[ -n "$TOKEN" ] && [ "$TOKEN" != "null" ] || { echo "เข้าสู่ระบบด้วยบัญชีแอดมินไม่สำเร็จ"; exit 1; }

jq -c '.[]' seed/rooms.json | while read -r r; do
  code_name=$(jq -r '.room_code' <<<"$r")
  status=$(curl -s -o /tmp/room.json -w '%{http_code}' -X POST "$BASE/api/rooms" \
    -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" --data-binary "$r")
  printf '  %-10s %s %s\n' "$code_name" "$status" "$(jq -r '.message // empty' /tmp/room.json)"
done

echo
echo "== 4. สร้างการจอง =="
# Must land inside /app: node resolves require() against the script's own
# directory, and mysql2 lives in /app/node_modules.
docker compose cp seed/seed-reservations.js backend:/app/seed-reservations.js
docker compose exec -T backend node /app/seed-reservations.js
docker compose exec -T backend rm -f /app/seed-reservations.js

echo
echo "==============================================="
echo "  URL          : $BASE"
echo "  รหัสผ่านทุกบัญชีสาธิต : $DEMO_PASSWORD"
echo "==============================================="
