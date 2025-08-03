# URL Shortener Backend

A NestJS API service for URL shortening with Supabase PostgreSQL database, deployed on Render with
automatic CI/CD. Part of the URL Shortener monorepo.

## Features

- ✅ Fast URL shortening and redirection
- ✅ Click tracking and analytics
- ✅ Swagger API documentation
- ✅ Supabase PostgreSQL with TypeORM
- ✅ Jest testing framework
- ✅ Input validation with Zod
- ✅ Structured logging with Winston
- ✅ Request/response logging with correlation IDs
- ✅ Health check endpoint
- ✅ Environment-specific configuration

## Quick Start

### Prerequisites

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
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
# Start Supabase local development stack (from root)
pnpm supabase:start

# Check Supabase services status
pnpm supabase:status

# Stop Supabase stack when done
pnpm supabase:stop
```

This will start:

- PostgreSQL database on `localhost:54322`
- Supabase Studio (web interface) on `localhost:5432`
- Authentication server and other Supabase services

## API Endpoints

- `POST /shorten` - Create short URL
- `GET /:slug` - Redirect to original URL (with click tracking)
- `POST /unshorten` - Get original URL and metadata
- `GET /health` - Health check
- `GET /docs` - Swagger documentation

**Local Development:** http://localhost:8000  
**Production:** https://url-shortener-but7.onrender.com

## Environment Variables

### Local Development

Create `.env` file for local Supabase:

```bash
PORT=8000
# Supabase Local Development
DATABASE_HOST=localhost
DATABASE_PORT=54322
DATABASE_NAME=postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
# Supabase URLs (when using hosted Supabase)
SUPABASE_URL=your-project-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# Application Settings
BASE_URL=http://localhost:8000
LOG_LEVEL=debug
SERVICE_NAME=url-shortener-api
```

### Production (Render)

Configure these environment variables in your Render dashboard:

```bash
PORT=8000
DATABASE_HOST=your-supabase-host
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-supabase-password
SUPABASE_URL=your-project-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BASE_URL=https://your-render-app.onrender.com
LOG_LEVEL=info
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

- Ensure Supabase is running: `pnpm supabase:status`
- Check `.env` file configuration
- Verify Supabase local development stack is started: `pnpm supabase:start`
- For production: Check Supabase project settings and connection string

**Port conflicts:**

- Change `PORT` in `.env` file
- Kill processes using port 8000

**TypeScript errors:**

- Ensure shared types are built: `pnpm build --filter @url-shortener/types`

## Deployment

### Render Deployment (Production)

The backend is automatically deployed to Render with CI/CD configured:

1. **Automatic Deployment**: Push to `main` branch triggers deployment
2. **Production URL**: https://url-shortener-but7.onrender.com
3. **Environment Variables**: Configure in Render dashboard
4. **Health Check**: Render monitors `/health` endpoint

### Manual Deployment Steps

1. **Connect GitHub**: Link your repository to Render
2. **Configure Build**:
   - Build Command: `cd apps/backend && pnpm install && pnpm build`
   - Start Command: `cd apps/backend && pnpm start:prod`
3. **Set Environment Variables**: Add production environment variables
4. **Deploy**: Render will automatically build and deploy

## Documentation

- [Monorepo Setup](../../README.md)
- [API Documentation (Local)](http://localhost:8000/docs)
- [API Documentation (Production)](https://url-shortener-but7.onrender.com/docs)
- [Shared Types](../../packages/types/README.md)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)

---

## Last Updated

**Date:** January 2025  
**Version:** 1.0.0  
**Deployment:** Render + Supabase  
**Status:** Production Ready
