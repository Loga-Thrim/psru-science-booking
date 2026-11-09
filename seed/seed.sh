#!/bin/bash
# Loads the faculty's rooms, the admin account and one sample booking.
#
#   On the server:  cd /opt/psru-booking && ./seed/seed.sh
#   Wipe first:     RESET=1 ./seed/seed.sh      (deletes ALL rooms, bookings and users)
#
# Settings (environment variables):
#   ADMIN_EMAIL     admin sign-in             (default admin@psru.ac.th)
#   ADMIN_PASSWORD  admin password, 8+ chars  (default: a random one, printed at the end)
#   BASE            site URL                  (default https://$SITE_ADDRESS from .env)
#   COMPOSE         compose command           (default "docker compose"; locally add
#                   -p/-f flags, e.g. COMPOSE="docker compose -p psru-booking -f docker-compose.yml -f override.yml")
#
# Safe to re-run without RESET: existing rooms are skipped by the API and the
# sample booking is only added once.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env ]; then set -a; . ./.env; set +a; fi
BASE="${BASE:-https://${SITE_ADDRESS:?set BASE or SITE_ADDRESS}}"
COMPOSE="${COMPOSE:-docker compose}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@psru.ac.th}"
GENERATED_PASSWORD=""
if [ -z "${ADMIN_PASSWORD:-}" ]; then
  ADMIN_PASSWORD="$(openssl rand -base64 18 | tr -d '/+=' | head -c 16)"
  GENERATED_PASSWORD=1
fi

need() { command -v "$1" >/dev/null || { echo "ต้องติดตั้ง $1 ก่อน"; exit 1; }; }
need curl
need jq

# Runs SQL in the db container with the root password it was started with.
sql() {
  $COMPOSE exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" --default-character-set=utf8mb4 "$MYSQL_DATABASE"' 2>&1 \
    | grep -v 'Using a password on the command line' || true
}

# Copies a script into the backend container (node resolves mysql2/bcrypt from
# /app/node_modules only when the script sits in /app) and runs it there.
run_in_backend() {
  local script="$1"; shift
  $COMPOSE cp "seed/$script" "backend:/app/$script" >/dev/null
  $COMPOSE exec -T "$@" backend node "/app/$script"
  $COMPOSE exec -T backend rm -f "/app/$script"
}

if [ "${RESET:-}" = "1" ]; then
  echo "== 0. ล้างข้อมูลเดิม (ห้อง การจอง ผู้ใช้) =="
  printf '%s\n' \
    "SET FOREIGN_KEY_CHECKS = 0;" \
    "DELETE FROM reservations;" \
    "DELETE FROM room_images;" \
    "DELETE FROM rooms;" \
    "DELETE FROM users;" \
    "SET FOREIGN_KEY_CHECKS = 1;" | sql
fi

echo "== 1. บัญชีผู้ดูแลระบบ =="
run_in_backend create-admin.js -e ADMIN_EMAIL="$ADMIN_EMAIL" -e ADMIN_PASSWORD="$ADMIN_PASSWORD"

echo
echo "== 2. ห้อง =="
TOKEN=$(curl -s -X POST "$BASE/api/login" -H 'Content-Type: application/json' \
  --data-binary "$(jq -n --arg e "$ADMIN_EMAIL" --arg p "$ADMIN_PASSWORD" '{email:$e,password:$p}')" \
  | jq -r '.token')
[ -n "$TOKEN" ] && [ "$TOKEN" != "null" ] || { echo "เข้าสู่ระบบด้วยบัญชีแอดมินไม่สำเร็จ"; exit 1; }

jq -c '.[]' seed/rooms.json | while read -r r; do
  code_name=$(jq -r '.room_code' <<<"$r")
  status=$(curl -s -o /tmp/room.json -w '%{http_code}' -X POST "$BASE/api/rooms" \
    -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" --data-binary "$r")
  printf '  %-10s %s %s\n' "$code_name" "$status" "$(jq -r '.message // empty' /tmp/room.json)"
done

echo
echo "== 3. การจองตัวอย่าง =="
run_in_backend seed-reservations.js

echo
echo "==============================================="
echo "  URL           : $BASE"
echo "  แอดมิน        : $ADMIN_EMAIL"
if [ -n "$GENERATED_PASSWORD" ]; then
  echo "  รหัสผ่านแอดมิน : $ADMIN_PASSWORD   (สุ่มให้ เก็บไว้ จะไม่แสดงอีก)"
fi
echo "==============================================="
