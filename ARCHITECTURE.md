# Architecture Decisions

This document outlines the architectural decisions for the PebbleScore backend assessment. The system is designed to be simple, robust, and maintainable by a single engineer, avoiding premature abstraction or over-engineering.

## Framework Selection

**NestJS** was selected to provide a structured, opinionated foundation. It offers excellent dependency injection and modularity out of the box. By leveraging NestJS, we cleanly separate concerns:
* **Controllers** handle HTTP routing and delegate directly to Services.
* **Services** contain business logic (e.g., idempotency checks).
* **Repositories** encapsulate database queries.

## API Documentation

**Swagger UI** was added to provide interactive API documentation without extensive manual effort. By leveraging `@nestjs/swagger`, the documentation is served directly from the application at `/api/docs`, providing an easy way for clients and developers to explore the endpoints and schemas.

## Persistence

**PostgreSQL** was chosen because it natively handles JSON (JSONB) for our dynamic metadata requirements and offers robust aggregation capabilities for the summary endpoint. 

**Drizzle ORM** provides type-safe SQL-like queries without the heavy abstraction overhead of traditional ORMs (like TypeORM). It keeps us close to the SQL layer, which is critical for writing efficient aggregation queries.

## Data Model & Indexing

### The Absence of a `users` Table
To maintain deliberate simplicity and high ingestion performance, this architecture deliberately omits a separate `users` table. The application blindly trusts the `userId` provided in the incoming event payload. Introducing a `users` table would either require building out separate user-registration endpoints (out of scope) or performing a "find-or-create" database operation on every event ingestion, which would unnecessarily degrade write throughput.

The schema consists of a single `events` table:
* `id`: Primary Key (enforces idempotency and uniqueness).
* `userId`: String (fast lookups per user).
* `type`: String (extensible, no strict ENUM restricting future activity types).
* `timestamp`: TIMESTAMPTZ (ensures UTC correctness).
* `metadata`: JSONB (flexible schema).

**Indexes:**
In addition to the primary key, a composite index on `(userId, timestamp)` was added. The `GET /users/:userId/summary` endpoint heavily filters by user and performs aggregations based on time periods. This index ensures these reads are highly optimized and prevent full table scans.

## Duplicate and Idempotency Strategy

We use the database as the ultimate source of truth to handle concurrent requests (race conditions). 
1. We execute an `INSERT ... ON CONFLICT (id) DO NOTHING`.
2. If insertion fails due to a conflict, we retrieve the existing record.
3. We perform a deep equality check between the existing record and the new payload.
4. Identical payloads return `200 OK`. Conflicting payloads return `409 Conflict`.

## Summary Calculation Strategy

Rather than loading all of a user's events into Node.js memory (which would fail at scale), we leverage PostgreSQL aggregation. We use `COUNT`, `MIN`, `MAX`, `json_object_agg` (for type counts), and `COUNT(*) FILTER (WHERE ...)` (for dynamic time periods) to compute the entire summary in a single optimized SQL query.

## Error Handling

A global NestJS Exception Filter is implemented to capture all exceptions. Validation errors (via Zod) return standardized `400 Bad Request` JSON structures. Unexpected server errors return `500 Internal Server Error` and are logged internally, ensuring that database implementation details and stack traces are never leaked to the client.

## Scaling Trade-offs

This architecture is deliberately simple. If traffic or data volume increases significantly:
1. **Read Replicas**: Database reads (summaries) could be routed to a read replica.
2. **Caching**: We could cache the summary endpoint using Redis (invalidating or updating the cache upon new event ingestion).
3. **Partitioning**: The `events` table could be partitioned by date (e.g., monthly) to maintain query performance as the table grows to millions of rows.
4. **Asynchronous Processing**: Ingestion could be decoupled using a message queue (e.g., Kafka or SQS), returning a 202 Accepted immediately and processing the DB insertion asynchronously.

These were intentionally omitted to keep the solution straightforward and appropriate for the current requirements.
