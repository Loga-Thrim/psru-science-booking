# Docker Setup for PSRU Booking System

## Overview
This setup uses Docker Compose to run the entire application (frontend, backend, database) behind a single nginx reverse proxy on port 8080.

## Architecture
```
                    ┌─────────────────┐
                    │     ngrok       │
                    │   (port 8080)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │      nginx      │
                    │   (port 8080)   │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │  frontend   │   │   backend   │   │   uploads   │
    │  (port 80)  │   │ (port 3000) │   │   /api/*    │
    │     /*      │   │   /api/*    │   │             │
    └─────────────┘   └──────┬──────┘   └─────────────┘
                             │
                    ┌────────▼────────┐
                    │     MySQL       │
                    │  (port 3306)    │
                    └─────────────────┘
```

## Quick Start

### 1. Build and start all services
```bash
docker-compose up --build -d
```

### 2. Wait for services to be ready
```bash
docker-compose logs -f
```
Wait until you see the backend is connected to the database.

### 3. Run database migrations (first time only)
```bash
docker-compose exec backend npm run migrate
```

### 4. Access the application
- Local: http://localhost:8080
- With ngrok: `ngrok http 8080`

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
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Reset database
```bash
docker-compose down -v
docker-compose up -d
# Wait for db to be ready, then run migrations
docker-compose exec backend npm run migrate
```

## Using with ngrok

1. Start Docker services:
```bash
docker-compose up -d
```

2. Start ngrok:
```bash
ngrok http 8080
```

3. Share the ngrok URL (e.g., `https://xxxx.ngrok.io`)

## Ports
- **8080**: Main application (nginx proxy)
- **3306**: MySQL (exposed for local development)

## Troubleshooting

### Backend can't connect to database
Wait for the database health check to pass. Check logs:
```bash
docker-compose logs db
```

### Frontend shows API errors
Make sure nginx is running and backend is healthy:
```bash
docker-compose ps
```

### Need to rebuild a specific service
```bash
docker-compose build frontend
docker-compose up -d frontend
```
