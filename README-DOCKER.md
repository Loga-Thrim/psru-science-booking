# Docker Setup for PSRU Booking System

## Overview
This setup uses Docker Compose to run the entire application (frontend, backend, database) behind a single nginx reverse proxy on **port 80**.

Set `APP_PORT` if port 80 is already in use, e.g. `APP_PORT=8080 docker-compose up -d`.

## Architecture
```
                    ┌─────────────────┐
                    │      nginx      │
                    │    (port 80)    │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │  frontend   │   │   backend   │   │   uploads   │
    │  (port 80)  │   │ (port 3000) │   │  /uploads/  │
    │     /*      │   │   /api/*    │   │             │
    └─────────────┘   └──────┬──────┘   └─────────────┘
                             │
                    ┌────────▼────────┐
                    │   MySQL 8.4     │
                    │  (port 3306)    │
                    └─────────────────┘
```

## Quick Start

### 1. Create the backend environment file
`back-end/.env` is gitignored, so it does not exist on a fresh clone. Copy the sample and edit it:
```bash
cp back-end/.env-example back-end/.env
```
Two values matter:
- `DB_HOST=db` — the compose service name (use `localhost` only when running the backend outside Docker).
- `JWT_KEY` — set a long random value. **The backend refuses to start if this is unset.**

### 2. Build and start all services
```bash
docker-compose up --build -d
```

### 3. Wait for services to be ready
```bash
docker-compose logs -f
```
Wait until the backend logs `Server runing on port 3000`.

### 4. Run database migrations (first time only)
```bash
docker-compose exec backend npm run migrate
```

### 5. Create the admin and load the rooms
Only admins sign in; bookers use the public form with a name and phone number.
```bash
BASE=http://localhost ADMIN_EMAIL=you@psru.ac.th ./seed/seed.sh
```
It prints a generated admin password unless you set `ADMIN_PASSWORD`. See `seed/README.md` for where the room data comes from.

### 6. Access the application
- http://localhost

## Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Rebuild after code changes
```bash
docker-compose up --build -d
```

### View logs
```bash
docker-compose logs -f backend
```

### Reset database
This destroys all data in the `db` volume.
```bash
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run migrate
```

## Ports
- **80**: Main application (nginx proxy), override with `APP_PORT`
- **3306**: MySQL, override with `MYSQL_PORT`

## Notes

### Uploads
Room images are written to `/app/uploads` inside the backend container, which is bind-mounted
to `back-end/uploads` on the host, so they survive rebuilds. The path is controlled by
`UPLOAD_DIR`; if you change it, update the volume in `docker-compose.yml` to match.

### Timezone
Both the `backend` and `db` services run with `TZ` (default `Asia/Bangkok`). This matters:
`CURDATE()` decides whether a booking is in the past and whether it exceeds a room's
`advance_booking_days`. Containers default to UTC, which is a day behind Thai users every
night between 00:00 and 07:00, so the calendar and the server would disagree about "today".
Override with `TZ=...` if you deploy elsewhere, but keep both services on the same zone.

### MySQL version
The `db` image is pinned to `mysql:8.4` (LTS). Do not switch it to `mysql:latest` — MySQL
refuses to start against a data directory written by a much newer or older major version,
which makes the container crash-loop on an existing volume.

## Troubleshooting

### Backend exits immediately
Check that `back-end/.env` exists and sets `JWT_KEY`:
```bash
docker-compose logs backend
```

### Backend can't connect to database
Confirm `DB_HOST=db` in `back-end/.env` and that the db health check passed:
```bash
docker-compose ps
```

### Port 80 already in use
```bash
APP_PORT=8080 docker-compose up -d
```
