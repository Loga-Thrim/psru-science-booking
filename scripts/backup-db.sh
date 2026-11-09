#!/bin/bash
# Nightly backup of the database and the uploaded room images.
#
# Install on the server with:
#   (crontab -l 2>/dev/null; echo "15 2 * * * /opt/psru-booking/scripts/backup-db.sh >> /var/log/psru-backup.log 2>&1") | crontab -
#
# Keeps KEEP_DAYS of history locally. Local copies do not survive the droplet
# being destroyed, so also enable DigitalOcean snapshots or copy these off-box.
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/psru-booking}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/psru-booking}"
KEEP_DAYS="${KEEP_DAYS:-14}"

cd "$PROJECT_DIR"

# shellcheck disable=SC1091
set -a; [ -f .env ] && . ./.env; set +a
DB_NAME="${DB_NAME:-psru_booking}"

STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "[$(date -Is)] starting backup"

# --single-transaction keeps the dump consistent without locking the tables,
# so bookings can still be made while this runs.
docker compose exec -T db mysqldump \
  -uroot -p"${DB_PASSWORD}" \
  --single-transaction --quick --default-character-set=utf8mb4 \
  "$DB_NAME" | gzip > "$BACKUP_DIR/db-$STAMP.sql.gz"

# Room images live on the host via a bind mount, so tar them straight from disk.
tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C "$PROJECT_DIR/back-end" uploads

# A dump that is only a few hundred bytes means mysqldump errored into the pipe.
DB_SIZE=$(stat -c%s "$BACKUP_DIR/db-$STAMP.sql.gz")
if [ "$DB_SIZE" -lt 1000 ]; then
  echo "[$(date -Is)] ERROR: dump is only ${DB_SIZE} bytes, treating as failed"
  rm -f "$BACKUP_DIR/db-$STAMP.sql.gz"
  exit 1
fi

find "$BACKUP_DIR" -name 'db-*.sql.gz' -mtime "+$KEEP_DAYS" -delete
find "$BACKUP_DIR" -name 'uploads-*.tar.gz' -mtime "+$KEEP_DAYS" -delete

echo "[$(date -Is)] done: db-$STAMP.sql.gz (${DB_SIZE} bytes)"
