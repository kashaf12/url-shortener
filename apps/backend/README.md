# URL Shortener Backend

A high-performance NestJS API service for URL shortening with PostgreSQL database, built as part of
the URL Shortener monorepo platform.

## Features

- **Fast URL Shortening**: Generate short URLs with customizable slugs
- **Redirect Service**: High-performance URL resolution and redirection
- **Click Analytics**: Track click events with metadata
- **Health Monitoring**: Comprehensive health check endpoints
- **Type Safety**: Full TypeScript support with shared types
- **API Documentation**: Auto-generated Swagger/OpenAPI docs
- **Rate Limiting**: Built-in request throttling
- **Input Validation**: Zod schema validation for all endpoints

## Tech Stack

- **Framework**: NestJS 11+
- **Database**: PostgreSQL with TypeORM
- **Language**: TypeScript
- **Validation**: Zod schemas via nestjs-zod
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest (unit & e2e)
- **Linting**: ESLint with TypeScript support

## API Endpoints

### Core Endpoints

- `POST /v1/api/shorten` - Create a new short URL
- `GET /:slug` - Redirect to original URL
- `POST /v1/api/unshorten` - Resolve slug to original URL with metadata
- `GET /v1/api/health` - Health check with system status

### Documentation

- `GET /v1/api/docs` - Interactive Swagger UI documentation

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended) or npm

### Development Setup

1. **Install dependencies** (from monorepo root):

   ```bash
   pnpm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Start PostgreSQL** (using Docker):

   ```bash
   docker run --name url-shortener-db \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=url_shortener \
     -p 5432:5432 -d postgres:14
   ```

4. **Run database migrations**:

   ```bash
   pnpm run migration:run
   ```

5. **Start development server**:
   ```bash
   pnpm run start:dev
   ```

The API will be available at `http://localhost:8000` with documentation at
`http://localhost:8000/v1/api/docs`.

### From Monorepo Root

```bash
# Start all services
pnpm dev

# Start only backend
pnpm --filter backend run start:dev

# Run backend tests
pnpm --filter backend run test
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Application
PORT=8000
NODE_ENV=development

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=url_shortener
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_SYNCHRONIZE=true

# URL Shortener
BASE_URL=http://localhost:8000
DEFAULT_SLUG_LENGTH=6
```

## API Usage Examples

### Shorten a URL

```bash
curl -X POST http://localhost:8000/v1/api/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "metadata": {
      "title": "Example Site",
      "source": "api"
    }
  }'
```

**Response:**

```json
{
  "id": "abc123",
  "shortUrl": "http://localhost:8000/abc123",
  "originalUrl": "https://example.com",
  "slug": "abc123",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": null
}
```

### Resolve a Short URL

```bash
curl -X POST http://localhost:8000/v1/api/unshorten \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:8000/abc123"}'
```

### Redirect (Browser)

Simply visit `http://localhost:8000/abc123` and you'll be redirected to the original URL.

## Development Scripts

```bash
# Development
pnpm run start:dev          # Start with file watching
pnpm run start:debug        # Start with debugging enabled

# Building
pnpm run build              # Build for production
pnpm run start:prod         # Start production build

# Testing
pnpm run test               # Run unit tests
pnpm run test:watch         # Run tests in watch mode
pnpm run test:cov           # Run with coverage report
pnpm run test:e2e           # Run end-to-end tests

# Code Quality
pnpm run lint               # Lint and fix code
pnpm run format             # Format code with Prettier
```

## Project Structure

```
apps/backend/
├── src/
│   ├── health/             # Health check module
│   │   ├── health.controller.ts
│   │   ├── health.service.ts
│   │   └── health.module.ts
│   ├── app.controller.ts   # Root controller
│   ├── app.service.ts      # Root service
│   ├── app.module.ts       # Main app module
│   └── main.ts             # Application entry point
├── test/                   # E2E tests
├── .env.example            # Environment template
├── nest-cli.json           # NestJS CLI configuration
├── tsconfig.json           # TypeScript configuration
├── tsconfig.build.json     # Build-specific TypeScript config
└── package.json            # Dependencies and scripts
```

## Testing

### Unit Tests

```bash
# Run all unit tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Generate coverage report
pnpm run test:cov
```

### End-to-End Tests

```bash
# Run e2e tests
pnpm run test:e2e
```

### Test Structure

- **Unit Tests**: Located alongside source files as `*.spec.ts`
- **E2E Tests**: Located in `test/` directory as `*.e2e-spec.ts`
- **Test Database**: Separate test database for isolation

## Deployment

### Docker

```bash
# Build image
docker build -t url-shortener-backend .

# Run container
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  url-shortener-backend
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set up proper logging
- [ ] Configure rate limiting
- [ ] Set up monitoring and health checks
- [ ] Review security headers and CORS settings

## Performance Considerations

- **Database Indexing**: Slugs and URLs are indexed for fast lookups
- **Connection Pooling**: TypeORM manages database connections efficiently
- **Response Caching**: Consider adding Redis for popular URL caching
- **Rate Limiting**: Built-in protection against abuse

## Security Features

- **Input Validation**: All inputs validated with Zod schemas
- **SQL Injection Protection**: TypeORM provides parameterized queries
- **Rate Limiting**: Request throttling per IP address
- **CORS**: Configurable cross-origin resource sharing
- **Helmet Integration**: Security headers (planned)

## Monitoring

### Health Check

The `/v1/api/health` endpoint provides:

- Application status
- Database connectivity
- System uptime
- Environment information

### Logging

- Structured JSON logging in production
- Request/response logging
- Error tracking and stack traces
- Performance metrics

## Contributing

1. **Code Style**: Follow the existing patterns and ESLint rules
2. **Testing**: Write tests for new features and bug fixes
3. **Documentation**: Update API docs and README for changes
4. **Type Safety**: Ensure full TypeScript coverage

### Adding New Endpoints

1. Create/update DTOs in shared types package
2. Add Zod validation schemas
3. Implement controller and service
4. Write unit and integration tests
5. Update Swagger documentation

## Troubleshooting

### Common Issues

**Database Connection Failed**

- Verify PostgreSQL is running
- Check environment variables
- Ensure database exists

**Port Already in Use**

- Change `PORT` in `.env` file
- Check for other running processes

**TypeScript Compilation Errors**

- Run `pnpm run type-check` for detailed errors
- Ensure shared types are built: `pnpm run build --filter @url-shortener/types`

### Debug Mode

```bash
# Start with debugging enabled
pnpm run start:debug

# Attach debugger to localhost:9229
```

## License

MIT License - see the [LICENSE](../../LICENSE) file for details.

## Related Documentation

- [Monorepo Setup](../../README.md)
- [Shared Types Package](../../packages/types/README.md)
- [API Documentation](http://localhost:8000/v1/api/docs) (when running)
- [NestJS Documentation](https://docs.nestjs.com/)
