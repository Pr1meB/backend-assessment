# PebbleScore Backend Assessment

This repository contains the backend implementation for the PebbleScore take-home assessment, designed to ingest activity events and serve activity summaries.

## Architecture & Stack

* **Framework**: NestJS
* **Language**: TypeScript
* **Database**: PostgreSQL
* **ORM**: Drizzle ORM
* **Validation**: Zod
* **Testing**: Vitest

## Requirements
* Node.js v20+
* Docker & Docker Compose (for the database)

## Installation

```bash
# Install dependencies
npm install
```

## Local Setup

### Quick Start (Recommended)
For the easiest setup, simply run the included start script. This will install dependencies, boot the database, build the app, and start the development server automatically:

```bash
./start.sh
```

### Manual Setup
If you prefer to run the commands manually:

1. Copy the example environment file:
```bash
cp .env.example .env
```

## Running the Application

### 1. Start the Database
The application relies on PostgreSQL. A `docker-compose.yml` is provided for easy setup:

```bash
docker compose up -d
```

### 2. Run Database Migrations
We use Drizzle ORM to push the schema to the database:

```bash
npm run db:push
```

### 3. Start the Server

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Running Tests

Integration tests run against the PostgreSQL database. Ensure the database is running via Docker before executing tests.

```bash
npm run test
```

## API Endpoints

### Swagger Documentation
Interactive API documentation is available at:
```bash
http://localhost:3000/api/docs
```

### Health Check
```bash
curl -X GET http://localhost:3000/health
```

### Ingest Event
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_001",
    "userId": "user_123",
    "type": "ACTIVITY_A",
    "timestamp": "2026-09-10T10:30:00Z",
    "metadata": {
      "value": 50000
    }
  }'
```

**Duplicate Behavior:**
* If the exact same event (same `id`, `userId`, `type`, `timestamp`, `metadata`) is sent again, the API responds with `200 OK` (Idempotent success).
* If the same `id` is sent with different event contents, the API responds with `409 Conflict`.
* This is protected at the database level using a unique constraint on the primary key `id`.

### Get User Summary
```bash
curl -X GET http://localhost:3000/users/user_123/summary
```
* Example Response:
```json
{
  "userId": "user_123",
  "totalEvents": 1,
  "firstActivityAt": "2026-09-10T10:30:00.000Z",
  "lastActivityAt": "2026-09-10T10:30:00.000Z",
  "activityByType": {
    "ACTIVITY_A": 1
  },
  "periods": {
    "today": 0,
    "last7Days": 0,
    "last30Days": 1
  }
}
```

## Assumptions
* "Today" and period aggregations are calculated dynamically based on current UTC time.
* Metadata is stored as generic JSONB, and we do not perform arithmetic sums on arbitrary metadata properties unless specified.
* Database connection runs as the root user for simplified local Docker development.
# backend-assessment
