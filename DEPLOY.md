# Deployment

The production stack is the same compose project as local development plus an
overlay that adds TLS, restart policies and loopback-only database binding.

## What is running

| Container | Exposed on | Purpose |
| --- | --- | --- |
| `psru-caddy` | `0.0.0.0:80`, `0.0.0.0:443` | TLS termination, automatic Let's Encrypt certificates, HTTP→HTTPS redirect |
| `psru-nginx` | `127.0.0.1:8080` | Routes `/api`, `/uploads` and the SPA fallback |
| `psru-frontend` | internal | Static build served by nginx |
| `psru-backend` | internal | Express API |
| `mysql` | `127.0.0.1:3306` | Database |

Only Caddy is reachable from the internet. `ufw` allows 22, 80 and 443.

## First-time setup on a fresh server

Requires Docker and Compose. The DigitalOcean **Docker** marketplace image has
both. 2 GB RAM is the practical minimum: the stack idles around 510 MB, but the
frontend build peaks higher, so add swap on a 2 GB box.

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

Cron and the "is this booking in the past" checks both read the clock, so set
the host timezone to match the users:

```bash
timedatectl set-timezone Asia/Bangkok
```

The DigitalOcean Docker image opens ufw rules for the Docker daemon API on
2375/2376. Nothing listens there by default, but close them anyway:

```bash
ufw delete allow 2375/tcp; ufw delete allow 2376/tcp
ufw allow 80/tcp; ufw allow 443/tcp
```

### Secrets

Generate them **on the server**. They must never be committed.

```bash
cd /opt/psru-booking
DB_PASS=$(openssl rand -base64 30 | tr -d '/+=' | head -c 32)
JWT=$(openssl rand -base64 48 | tr -d '/+=' | head -c 64)
SITE=your.domain.here

cat > .env <<EOF
DB_PASSWORD=${DB_PASS}
DB_NAME=psru_booking
TZ=Asia/Bangkok
APP_BIND=127.0.0.1
APP_PORT=8080
SITE_ADDRESS=${SITE}
EOF

cat > back-end/.env <<EOF
SERVER_PORT=3000
DB_HOST=db
DB_NAME=psru_booking
DB_USER=root
DB_PASSWORD=${DB_PASS}
DB_PORT=3306
JWT_KEY=${JWT}
WEB_ORIGIN=https://${SITE}
UPLOAD_DIR=/app/uploads
TZ=Asia/Bangkok
EOF

chmod 600 .env back-end/.env
```

`SITE_ADDRESS` must be a hostname. Let's Encrypt does not issue certificates
for bare IP addresses. Until a real domain points at the server, a wildcard-DNS
name works: `143-198-81-130.sslip.io` resolves to `143.198.81.130`.

### Start

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose exec -T backend npm run migrate
```

### Create the first admin

Register through the API so the password is hashed by the app, then promote the
row. Passwords must be at least 8 characters.

```bash
set -a; . ./.env; set +a
ADMIN_PW=$(openssl rand -base64 18 | tr -d '/+=' | head -c 16)

curl -s -X POST https://$SITE_ADDRESS/api/register \
  -H 'Content-Type: application/json' \
  --data-binary "{\"username\":\"ผู้ดูแลระบบ\",\"email\":\"admin@example.ac.th\",\"password\":\"$ADMIN_PW\",\"department\":\"คณะวิทยาศาสตร์และเทคโนโลยี\"}"

docker compose exec -T db mysql -uroot -p"$DB_PASSWORD" psru_booking \
  -e "UPDATE users SET role='admin' WHERE email='admin@example.ac.th';"

echo "password: $ADMIN_PW"
```

## Moving to a real domain

1. Point an A record at the server.
2. Edit `SITE_ADDRESS` in `.env` (and `WEB_ORIGIN` in `back-end/.env`).
3. `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`

Caddy requests the new certificate on start. Keep the `caddy_data` volume:
re-requesting certificates repeatedly runs into Let's Encrypt rate limits.

## Deploying changes

```bash
cd /opt/psru-booking
# copy the new code up, then:
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose exec -T backend npm run migrate   # only if migrations were added
```

Migrations are written to be re-runnable, so running them when nothing changed
is harmless.

## Backups

`scripts/backup-db.sh` dumps the database and tars the uploaded images into
`/var/backups/psru-booking`, keeping 14 days. Installed as a cron job:

```
15 2 * * * cd /opt/psru-booking && /opt/psru-booking/scripts/backup-db.sh >> /var/log/psru-backup.log 2>&1
```

These copies live on the same droplet, so they do not survive it being
destroyed. Also enable DigitalOcean snapshots, or copy the dumps off-box.

Restore:

```bash
set -a; . ./.env; set +a
zcat /var/backups/psru-booking/db-YYYYMMDD-HHMMSS.sql.gz \
  | docker compose exec -T db mysql -uroot -p"$DB_PASSWORD" psru_booking
tar -xzf /var/backups/psru-booking/uploads-YYYYMMDD-HHMMSS.tar.gz -C back-end/
```

## Troubleshooting

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
docker compose logs -f backend
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs caddy | grep -i certificate
```

**Certificate not issued** — check that `SITE_ADDRESS` resolves to this server
and that ports 80 and 443 are open. The ACME HTTP challenge needs port 80.

**Build killed partway through** — out of memory. Add swap, or build the images
elsewhere and push them to a registry.
