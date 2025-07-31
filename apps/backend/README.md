# URL Shortener Backend

A NestJS API service for URL shortening with PostgreSQL database, part of the URL Shortener
monorepo.

## Features

- ✅ Fast URL shortening and redirection
- ✅ Click tracking and analytics
- ✅ Swagger API documentation
- ✅ PostgreSQL with TypeORM
- ✅ Jest testing framework
- ✅ Input validation with Zod
- ✅ Structured logging with Winston
- ✅ Request/response logging with correlation IDs
- ✅ Health check endpoint
- ✅ Environment-specific configuration

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL
- pnpm

### Development

1. **From monorepo root:**

   ```bash
   pnpm install
   pnpm dev:backend
   ```

2. **Direct backend development:**
   ```bash
   cd apps/backend
   pnpm install
   pnpm start:dev
   ```

### Database Setup

```bash
# Start PostgreSQL with Docker (from root)
pnpm docker:up

# Or manually:
docker run --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=url_shortener \
  -p 5432:5432 -d postgres:14
```

## API Endpoints

- `POST /shorten` - Create short URL
- `GET /:slug` - Redirect to original URL (with click tracking)
- `POST /unshorten` - Get original URL and metadata
- `GET /health` - Health check
- `GET /docs` - Swagger documentation

**Base URL:** http://localhost:8000

## Environment Variables

Create `.env` file:

```bash
PORT=8000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=url_shortener
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
BASE_URL=http://localhost:8000
LOG_LEVEL=debug
SERVICE_NAME=url-shortener-api
```

## Available Scripts

```bash
# Development
pnpm start:dev              # Start with file watching
pnpm start:debug            # Start with debugging

# Testing
pnpm test                   # Run unit tests
pnpm test:e2e               # Run e2e tests
pnpm test:cov               # Run with coverage

# Production
pnpm build                  # Build for production
pnpm start:prod             # Start production build

# Code Quality
pnpm lint                   # Lint and fix
pnpm format                 # Format code
```

## API Usage

### Shorten URL

```bash
curl -X POST http://localhost:8000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

Response:

```json
{
  "short_url": "http://localhost:8000/abc123",
  "slug": "abc123",
  "original_url": "https://example.com",
  "created_at": "2025-01-27T10:30:00.000Z"
}
```

### Get Original URL

```bash
curl -X POST http://localhost:8000/unshorten \
  -H "Content-Type: application/json" \
  -d '{"slug": "abc123"}'
```

Response:

```json
{
  "original_url": "https://example.com",
  "slug": "abc123",
  "click_count": 5,
  "created_at": "2025-01-27T10:30:00.000Z"
}
```

## Project Structure

```bash
apps/backend/
├── src/
│   ├── config/             # Configuration (logger, swagger)
│   ├── health/             # Health check module
│   ├── link/               # URL shortening module
│   │   ├── dto/            # Data transfer objects
│   │   ├── entities/       # TypeORM entities
│   │   └── *.ts            # Controllers and services
│   ├── middleware/         # Request logging middleware
│   ├── app.module.ts       # Main app module
│   └── main.ts             # Application entry
├── test/                   # E2E tests
└── package.json            # Dependencies and scripts
```

## Testing

Current test status: **5 test suites, 10 tests passing** ✅

- Unit tests: `*.spec.ts` files alongside source
- E2E tests: `test/` directory
- Coverage reports: `pnpm test:cov`

## Logging

The backend includes comprehensive structured logging with Winston:

- **Request/Response Logging**: All HTTP requests are logged with correlation IDs
- **Environment-Specific Formatting**: Console output in development, JSON + file rotation in
  production
- **Log Levels**: Configurable via `LOG_LEVEL` environment variable
- **Request Correlation**: Each request gets a unique ID for tracing across logs

Log files (production only):

- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

## Current Status

**Backend MVP Status: ~80% Complete** ✅

**Implemented:**

- ✅ Full REST API with all endpoints
- ✅ PostgreSQL database integration
- ✅ Click tracking and analytics
- ✅ Swagger documentation
- ✅ Comprehensive testing suite
- ✅ Structured logging system
- ✅ Environment configuration

**Remaining Tasks:**

- [ ] Enhanced URL validation
- [ ] Improved slug generation (nanoid)
- [ ] Rate limiting middleware
- [ ] CORS configuration for frontend

## Troubleshooting

**Database connection issues:**

- Ensure PostgreSQL is running on port 5432
- Check `.env` file configuration
- Verify database `url_shortener` exists

**Port conflicts:**

- Change `PORT` in `.env` file
- Kill processes using port 8000

**TypeScript errors:**

- Ensure shared types are built: `pnpm build --filter @url-shortener/types`

## Documentation

- [Monorepo Setup](../../README.md)
- [API Documentation](http://localhost:8000/docs) (when running)
- [Shared Types](../../packages/types/README.md)
