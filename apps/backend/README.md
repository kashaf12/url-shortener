# Backend API

NestJS backend API for URL shortener platform with advanced slug generation, deduplication, and
analytics.

## 🚀 Quick Start

```bash
# Development
pnpm start:dev

# Production
pnpm start:prod

# Tests
pnpm test
```

## 📁 Project Structure

```
src/
├── link/                 # URL shortening logic
│   ├── dto/             # Data transfer objects
│   ├── entities/        # Database entities
│   ├── link.controller.ts
│   ├── link.service.ts
│   └── link.module.ts
├── slug/                # Advanced slug generation
│   ├── services/        # Slug generation services
│   ├── strategies/      # Generation strategies
│   ├── controllers/     # Strategy discovery API
│   ├── entities/        # Space usage tracking
│   └── slug.module.ts
├── deduplication/       # Smart deduplication
│   ├── services/        # Deduplication logic
│   └── deduplication.module.ts
├── health/              # Health monitoring
│   ├── health.controller.ts
│   ├── health.service.ts
│   └── health.module.ts
├── config/              # Configuration
│   ├── logger.config.ts
│   └── swagger.ts
├── middleware/          # Custom middleware
└── main.ts             # Application entry point
```

## 🔧 Features

### Core Functionality

- **URL Shortening**: Create short URLs with custom slugs
- **URL Resolution**: Resolve slugs to original URLs
- **Redirect Handling**: Automatic redirects to original URLs
- **Health Monitoring**: Production-ready health checks

### Advanced Features

- **Multiple Slug Strategies**: nanoid, UUID, custom patterns
- **Smart Deduplication**: URL + metadata hash-based deduplication
- **Space Monitoring**: Track slug space usage and exhaustion
- **Custom Validation**: Advanced slug validation and processing
- **Strategy Discovery**: API to discover available slug strategies

### Database Integration

- **TypeORM**: Object-relational mapping
- **PostgreSQL**: Primary database
- **Migrations**: Database schema management
- **Entity Tracking**: Click counts, metadata, timestamps

### API Features

- **Swagger Documentation**: Auto-generated API docs
- **Input Validation**: Zod schemas for all inputs
- **Error Handling**: Comprehensive error responses
- **Logging**: Winston-based structured logging
- **Rate Limiting**: Built-in rate limiting middleware

## 📚 API Endpoints

### Core Endpoints

| Method | Endpoint     | Description                  |
| ------ | ------------ | ---------------------------- |
| `POST` | `/shorten`   | Create a shortened URL       |
| `POST` | `/unshorten` | Resolve slug to original URL |
| `GET`  | `/:slug`     | Redirect to original URL     |
| `GET`  | `/health`    | Health check                 |
| `GET`  | `/docs`      | Swagger documentation        |

### Slug Strategy Endpoints

| Method | Endpoint                 | Description                    |
| ------ | ------------------------ | ------------------------------ |
| `GET`  | `/slug/strategies`       | List available slug strategies |
| `GET`  | `/slug/strategies/:name` | Get strategy details           |
| `POST` | `/slug/validate`         | Validate custom slug           |

## 🔧 Configuration

### Environment Variables

```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=url_shortener

# Application
NODE_ENV=development
PORT=8000
SLUG_GENERATION_STRATEGY=nanoid

# Logging
LOG_LEVEL=info
```

### Database Schema

```sql
-- Links table
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(21) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  metadata_hash VARCHAR(64),
  slug_strategy VARCHAR(50),
  slug_length INTEGER,
  namespace VARCHAR(50),
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Slug space usage tracking
CREATE TABLE slug_space_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy VARCHAR(50) NOT NULL,
  alphabet_hash VARCHAR(64) NOT NULL,
  length INTEGER NOT NULL,
  namespace VARCHAR(50),
  total_space BIGINT NOT NULL,
  used_space BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(strategy, alphabet_hash, length, namespace)
);
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:cov

# Run tests in watch mode
pnpm test:watch

# Run e2e tests
pnpm test:e2e
```

## 🚀 Deployment

### Docker

```bash
# Build image
pnpm docker:build

# Run container
pnpm docker:run
```

### Manual Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start:prod
```

## 📊 Monitoring

### Health Checks

- **Basic Health**: `GET /health`
- **Detailed Health**: Returns uptime, timestamp, status

### Logging

- **Structured Logging**: Winston with JSON format
- **Log Levels**: error, warn, info, debug
- **Request Logging**: Middleware for all requests

### Metrics

- **Response Times**: Built-in timing middleware
- **Error Rates**: Error tracking and reporting
- **Database Performance**: TypeORM query logging

## 🔒 Security

### Input Validation

- **Zod Schemas**: Type-safe validation for all inputs
- **URL Validation**: Proper URL format validation
- **Slug Validation**: Custom slug pattern validation

### Rate Limiting

- **API Rate Limiting**: Built-in rate limiting middleware
- **IP-based Limiting**: Per-IP request limits
- **Endpoint-specific Limits**: Different limits per endpoint

### Database Security

- **Parameterized Queries**: TypeORM prevents SQL injection
- **Connection Pooling**: Optimized database connections
- **Transaction Support**: ACID compliance for critical operations

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm start:dev          # Development server with hot reload
pnpm start:debug        # Debug mode with breakpoints

# Building
pnpm build              # Build for production
pnpm clean              # Clean build artifacts

# Testing
pnpm test               # Run all tests
pnpm test:watch         # Watch mode
pnpm test:cov           # Coverage report
pnpm test:e2e           # End-to-end tests

# Linting & Formatting
pnpm lint               # ESLint with auto-fix
pnpm lint:check         # ESLint without auto-fix
pnpm format             # Prettier formatting

# Database
pnpm db:migrate         # Run migrations
pnpm db:generate        # Generate migration
pnpm db:revert          # Revert migration

# Docker
pnpm docker:build       # Build Docker image
pnpm docker:run         # Run Docker container
```

### Development Workflow

1. **Start Development Server**

   ```bash
   pnpm start:dev
   ```

2. **Run Tests**

   ```bash
   pnpm test:watch
   ```

3. **Check Code Quality**

   ```bash
   pnpm lint
   pnpm format
   ```

4. **Database Changes**
   ```bash
   pnpm db:generate -- -n CreateNewTable
   pnpm db:migrate
   ```

## 📚 API Examples

### Create Short URL

```bash
curl -X POST http://localhost:8000/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/very-long-url",
    "customSlug": "my-link",
    "metadata": {
      "title": "My Link",
      "tags": ["marketing", "campaign"]
    },
    "deduplicate": true
  }'
```

### Response

```json
{
  "short_url": "http://localhost:8000/my-link",
  "slug": "my-link",
  "url": "https://example.com/very-long-url",
  "strategy": "custom",
  "length": 7,
  "wasDeduped": false,
  "wasCustomSlug": true,
  "spaceUsage": {
    "usagePercentage": 0.001,
    "status": "safe",
    "remainingSpace": 999999999
  }
}
```

### Resolve URL

```bash
curl -X POST http://localhost:8000/unshorten \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "my-link"
  }'
```

### Health Check

```bash
curl http://localhost:8000/health
```

## 🔗 Dependencies

### Core Dependencies

- **@nestjs/common**: NestJS core framework
- **@nestjs/typeorm**: Database integration
- **@nestjs/swagger**: API documentation
- **@url-shortener/types**: Shared types

### Database

- **typeorm**: ORM for database operations
- **pg**: PostgreSQL driver

### Utilities

- **nanoid**: URL-safe ID generation
- **uuid**: UUID generation
- **zod**: Schema validation
- **winston**: Logging

### Development

- **@nestjs/testing**: Testing utilities
- **jest**: Testing framework
- **supertest**: HTTP testing

## 📈 Performance

### Optimizations

- **Database Indexing**: Optimized indexes on slug and metadata_hash
- **Connection Pooling**: Efficient database connections
- **Caching**: Built-in caching for frequently accessed URLs
- **Compression**: Response compression middleware

### Benchmarks

- **Redirect Speed**: < 100ms average response time
- **Concurrent Requests**: 1000+ requests per second
- **Database Queries**: Optimized with proper indexing
- **Memory Usage**: Efficient memory management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.
