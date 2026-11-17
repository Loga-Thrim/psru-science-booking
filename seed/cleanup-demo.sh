#!/bin/bash
# Deletes the bookings made during a demo session, and nothing else.
#
#   On the server:  cd /opt/psru-booking && ./seed/cleanup-demo.sh
#
# Demo test cards use phone numbers 0000000001-0000000999, which no real Thai
# number starts with, so only those bookings match. Rooms, admins, real
# bookings and the collected feedback are left alone.
#
# COMPOSE: compose command (default "docker compose"; add -p/-f flags locally).
set -euo pipefail

cd "$(dirname "$0")/.."
COMPOSE="${COMPOSE:-docker compose}"

sql() {
  $COMPOSE exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" --default-character-set=utf8mb4 -N "$MYSQL_DATABASE"' 2>&1 \
    | grep -v 'Using a password on the command line' || true
}

MATCH="phone REGEXP '^0000000[0-9]{3}\$'"
count=$(echo "SELECT COUNT(*) FROM reservations WHERE $MATCH;" | sql)
if ! [[ "$count" =~ ^[0-9]+$ ]]; then
  echo "ติดต่อฐานข้อมูลไม่ได้: $count"
  exit 1
fi
echo "การจองจากบัตรทดสอบ: $count รายการ"
if [ "$count" -gt 0 ]; then
  echo "DELETE FROM reservations WHERE $MATCH;" | sql
  echo "ลบแล้ว"
fi
