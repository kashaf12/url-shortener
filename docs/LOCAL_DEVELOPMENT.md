# Local Development Guide

Complete guide for setting up and running the URL Shortener Platform in your local development
environment.

---

## 📋 Prerequisites

### Required Software

| Software         | Version | Installation                                                                              |
| ---------------- | ------- | ----------------------------------------------------------------------------------------- |
| **Node.js**      | 20+     | [Download](https://nodejs.org/) or use [nvm](https://github.com/nvm-sh/nvm)               |
| **pnpm**         | 9.0.0+  | `npm install -g pnpm` or [install guide](https://pnpm.io/installation)                    |
| **Supabase CLI** | Latest  | `npm install -g supabase` or [install guide](https://supabase.com/docs/guides/cli)        |
| **Docker**       | Latest  | [Docker Desktop](https://www.docker.com/products/docker-desktop/) (required for Supabase) |
| **Git**          | Latest  | [Download](https://git-scm.com/downloads)                                                 |

### Verify Installation

```bash
# Check versions
node --version     # Should be v20.0.0 or higher
pnpm --version     # Should be 9.0.0 or higher
supabase --version # Should show latest version
docker --version   # Should be installed and running
git --version      # Should be installed
```

---

## 🚀 Quick Start (5 minutes)

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/kashaf12/url-shortener.git
cd url-shortener

# Install all dependencies
pnpm install

# Start Supabase local development stack
pnpm supabase:start
```

### 2. Environment Configuration

```bash
# Copy environment template to backend
cp .env.example apps/backend/.env

# Copy environment template to frontend
cp .env.example apps/frontend/.env.local

# Get Supabase credentials
pnpm supabase:status
```

### 3. Update Environment Files

**apps/backend/.env**:

```env
PORT=8000
NODE_ENV=development
DATABASE_HOST=localhost
DATABASE_PORT=54322
DATABASE_NAME=postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=<from supabase status>
SUPABASE_SERVICE_ROLE_KEY=<from supabase status>
BASE_URL=http://localhost:8000
LOG_LEVEL=debug
SERVICE_NAME=url-shortener-api
```

**apps/frontend/.env.local**:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase status>
```

### 4. Start Development Servers

```bash
# Start all services (in separate terminals)
pnpm dev

# Or start individually:
pnpm dev:backend   # Backend on http://localhost:8000
pnpm dev:frontend  # Frontend on http://localhost:3000
```

---

## 🛠️ Detailed Setup Instructions

### Step 1: Repository Setup

```bash
# Clone with SSH (recommended)
git clone git@github.com:kashaf12/url-shortener.git

# Or with HTTPS
git clone https://github.com/kashaf12/url-shortener.git

# Navigate to project
cd url-shortener

# Install dependencies for entire monorepo
pnpm install
```

### Step 2: Supabase Local Development

```bash
# Initialize Supabase (if not already done)
supabase init

# Start all Supabase services
pnpm supabase:start

# This will start:
# - PostgreSQL database on localhost:54322
# - Supabase Studio on localhost:54323
# - Auth server and other services
```

**Verify Supabase is running**:

```bash
# Check status
pnpm supabase:status

# Open Supabase Studio (optional)
open http://localhost:54323
```

### Step 3: Backend Setup

```bash
# Navigate to backend
cd apps/backend

# Copy environment template
cp ../../.env.example .env

# Install dependencies (if not done globally)
pnpm install

# Build shared types
pnpm build --filter @url-shortener/types

# Start backend in development mode
pnpm start:dev
```

**Verify backend is running**:

```bash
# Health check
curl http://localhost:8000/health

# API documentation
open http://localhost:8000/docs
```

### Step 4: Frontend Setup

```bash
# Navigate to frontend (in new terminal)
cd apps/frontend

# Copy environment template
cp ../../.env.example .env.local

# Install dependencies (if not done globally)
pnpm install

# Start frontend in development mode
pnpm dev
```

**Verify frontend is running**:

```bash
# Open in browser
open http://localhost:3000
```

---

## 📁 Project Structure

```bash
url-shortener/
├── apps/
│   ├── backend/              # NestJS API server
│   │   ├── src/
│   │   │   ├── main.ts       # Application entry point
│   │   │   ├── app.module.ts # Root module
│   │   │   ├── link/         # URL shortening logic
│   │   │   ├── health/       # Health check endpoint
│   │   │   └── config/       # Configuration files
│   │   ├── test/             # E2E tests
│   │   └── .env              # Backend environment variables
│   └── frontend/             # Next.js web application
│       ├── src/
│       │   ├── app/          # Next.js App Router
│       │   ├── components/   # React components
│       │   └── lib/          # Utility functions
│       └── .env.local        # Frontend environment variables
├── packages/
│   └── types/                # Shared TypeScript types
├── supabase/                 # Supabase configuration
│   ├── config.toml           # Supabase settings
│   └── migrations/           # Database migrations (auto-generated)
├── docs/                     # Additional documentation
├── ai-agent/                 # Project planning and rules
└── .env.example              # Environment template
```

---

## 🔧 Development Workflow

### Daily Development

```bash
# Start your development day
pnpm supabase:start    # Start database services
pnpm dev              # Start all development servers

# Or start services individually in separate terminals:
pnpm dev:backend      # Terminal 1: API server
pnpm dev:frontend     # Terminal 2: Web interface

# End your development day
pnpm supabase:stop    # Stop database services
```

### Making Changes

```bash
# For backend changes
cd apps/backend
# Make your changes
pnpm run lint         # Check code style
pnpm run test         # Run tests
pnpm start:dev        # Restart if needed

# For frontend changes
cd apps/frontend
# Make your changes
pnpm run lint         # Check code style
pnpm run type-check   # Check TypeScript
pnpm dev              # Auto-reloads on changes

# For shared types changes
cd packages/types
# Make your changes
pnpm build            # Rebuild types
# Restart backend and frontend to pick up changes
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run backend tests only
cd apps/backend
pnpm test

# Run tests with coverage
pnpm test:cov

# Run E2E tests
pnpm test:e2e
```

### Code Quality

```bash
# Lint entire project
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check

# Build everything
pnpm build
```

---

## 🎯 Development URLs

| Service             | URL                          | Purpose               |
| ------------------- | ---------------------------- | --------------------- |
| **Frontend**        | http://localhost:3000        | Web interface         |
| **Backend API**     | http://localhost:8000        | REST API              |
| **API Docs**        | http://localhost:8000/docs   | Swagger documentation |
| **Health Check**    | http://localhost:8000/health | Service health status |
| **Supabase Studio** | http://localhost:54323       | Database management   |
| **Database**        | localhost:54322              | PostgreSQL connection |

---

## 📊 Available Scripts

### Root Level (monorepo)

```bash
pnpm dev              # Start all development servers
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint all packages
pnpm type-check       # Type check all packages
pnpm format           # Format all code
pnpm supabase:start   # Start Supabase services
pnpm supabase:stop    # Stop Supabase services
pnpm supabase:status  # Check Supabase status
```

### Backend (apps/backend)

```bash
pnpm start:dev        # Development with watch mode
pnpm start:debug      # Development with debugging
pnpm build            # Build for production
pnpm start:prod       # Start production build
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm test:cov         # Test with coverage
pnpm lint             # Lint backend code
```

### Frontend (apps/frontend)

```bash
pnpm dev              # Development server
pnpm build            # Build for production
pnpm start            # Start production build
pnpm lint             # Lint frontend code
pnpm type-check       # TypeScript check
```

---

## 🔍 Debugging

### Backend Debugging

```bash
# Start with debug logging
cd apps/backend
LOG_LEVEL=debug pnpm start:dev

# Use Node.js inspector
pnpm start:debug
# Then open chrome://inspect in Chrome
```

### Frontend Debugging

```bash
# Development mode includes source maps
cd apps/frontend
pnpm dev

# Use browser DevTools
# Right-click → Inspect → Sources tab
```

### Database Debugging

```bash
# View database in Supabase Studio
open http://localhost:54323

# Connect via psql
psql postgresql://postgres:postgres@localhost:54322/postgres

# View logs
supabase logs --follow
```

---

## 🔄 Hot Reloading

### What Auto-Reloads

- **Backend**: NestJS watches for changes and restarts automatically
- **Frontend**: Next.js Fast Refresh for instant updates
- **Shared Types**: Manual rebuild required (`pnpm build --filter @url-shortener/types`)

### Manual Restart Required

- **Environment variables**: Restart both backend and frontend
- **Package.json changes**: Run `pnpm install` and restart
- **Supabase config**: Restart Supabase services

---

## 🌱 Seeding Data

### Manual Testing Data

```bash
# Create a short URL via API
curl -X POST http://localhost:8000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Test redirect
curl -I http://localhost:8000/<slug>

# Get URL info
curl -X POST http://localhost:8000/unshorten \
  -H "Content-Type: application/json" \
  -d '{"slug": "<slug>"}'
```

### Database Seeding (Future)

```bash
# Seed development data (planned feature)
cd apps/backend
pnpm run seed
```

---

## 🔧 Common Development Tasks

### Adding New Backend Endpoint

1. Create or modify controller in `apps/backend/src/`
2. Add types to `packages/types/src/`
3. Rebuild types: `pnpm build --filter @url-shortener/types`
4. Add tests in corresponding `.spec.ts` file
5. Test via Swagger docs: http://localhost:8000/docs

### Adding New Frontend Component

1. Create component in `apps/frontend/src/components/`
2. Use shared types from `@url-shortener/types`
3. Add to page in `apps/frontend/src/app/`
4. Test in browser: http://localhost:3000

### Updating Shared Types

1. Modify types in `packages/types/src/`
2. Rebuild: `pnpm build --filter @url-shortener/types`
3. Restart backend and frontend to pick up changes
4. Update API endpoints and frontend components as needed

---

## 📚 Learning Resources

### Project-Specific

- [Main README](../README.md) - Overview and features
- [API Documentation](http://localhost:8000/docs) - When backend is running
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment

### Technology Documentation

- [NestJS](https://docs.nestjs.com/) - Backend framework
- [Next.js](https://nextjs.org/docs) - Frontend framework
- [Supabase](https://supabase.com/docs) - Database and auth
- [TypeScript](https://www.typescriptlang.org/docs/) - Type system
- [Turborepo](https://turbo.build/repo/docs) - Monorepo build system

---

## 🆘 Getting Help

### Check These First

1. [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues and solutions
2. **Console/Terminal Output** - Look for specific error messages
3. **Browser DevTools** - Check Network and Console tabs
4. **Service Status** - Run `pnpm supabase:status`

### Getting Support

- **GitHub Issues**: [Create an issue](https://github.com/kashaf12/url-shortener/issues)
- **Documentation**: Check all README files in the project
- **Community**: Join discussions in GitHub Discussions

---

## Last Updated

**Date**: January 2025  
**Version**: 1.0.0  
**Architecture**: Supabase + Render + Vercel  
**Tested On**: macOS, Linux, Windows (WSL)
