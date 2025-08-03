# URL Shortener

<p align="center">
  <a href="#readme">
    <img src="https://img.shields.io/badge/pnpm-v9.0.0-blue?style=for-the-badge&logo=pnpm" alt="pnpm Version" />
  </a>
  <a href="#readme">
    <img src="https://img.shields.io/badge/TypeScript-v5.8.3-blue?style=for-the-badge&logo=typescript" alt="TypeScript Version" />
  </a>
  <a href="#readme">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
  </a>
</p>

This project is a modern, high-performance URL shortener platform built with a monorepo architecture
using Turborepo. It features a Next.js frontend, a NestJS backend, and is designed for scalability
and ease of development.

## 🚀 Live Demo

**Frontend:**
[https://url-shortener-frontend-plum.vercel.app/](https://url-shortener-frontend-plum.vercel.app/)

## Features

- **Monorepo Architecture:** Centralized management with pnpm workspaces and Turborepo
- **Type-Safe:** Fully written in TypeScript with shared types package
- **NestJS Backend:** Scalable REST API with TypeORM, PostgreSQL, and Swagger documentation
- **URL Shortening:** Complete API endpoints for shortening, resolving, and redirecting URLs
- **Database Integration:** PostgreSQL with TypeORM entities and migrations
- **Health Monitoring:** Built-in health check endpoints for production monitoring
- **Modern Tooling:** ESLint flat config, Prettier, and automated code quality checks
- **Testing Framework:** Jest setup with unit and integration tests
- **Development Ready:** Hot reloading, environment configuration, and Docker support

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or higher)
- [pnpm](https://pnpm.io/) (v9.0.0 or higher)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local development)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/kashaf12/url-shortener.git
    cd url-shortener
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up Supabase for local development:**

    ```bash
    # Start Supabase local development stack
    pnpm supabase:start
    ```

4.  **Build the packages:**

    ```bash
    pnpm build
    ```

### Running the Development Servers

To start the development servers for all applications and packages, run:

```bash
pnpm dev
```

This will use Turborepo to run the `dev` script in each package, enabling hot-reloading and parallel
execution.

#### Backend Development

To run just the backend NestJS server:

```bash
pnpm dev:backend
```

The backend will be available at:

- **API**: http://localhost:8000
- **Swagger Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

#### Frontend Development

To run just the frontend Next.js application:

```bash
pnpm dev:frontend
```

The frontend will be available at:

- **Frontend**: http://localhost:3000
- **Live Demo**: https://url-shortener-frontend-plum.vercel.app/

#### Database Setup

Supabase handles the database automatically when you run:

```bash
pnpm supabase:start
```

This will start the Supabase local development stack including:

- PostgreSQL database on `localhost:54322`
- Supabase Studio on `localhost:54323`
- Auth server and other Supabase services

To stop the Supabase stack:

```bash
pnpm supabase:stop
```

### Available Scripts

- `pnpm dev` - Start all development servers
- `pnpm dev:frontend` - Start frontend only
- `pnpm dev:backend` - Start backend with Supabase
- `pnpm start:backend` - Start backend only
- `pnpm supabase:start` - Start Supabase local development stack
- `pnpm supabase:stop` - Stop Supabase local development stack
- `pnpm supabase:status` - Check Supabase services status
- `pnpm build` - Build all packages
- `pnpm test` - Run all tests
- `pnpm lint` - Run linting
- `pnpm format` - Format code
- `pnpm type-check` - Type check all packages

## Project Structure

The monorepo is structured as follows:

```bash
.
├── apps/
│   ├── backend/        # NestJS API (✅ Implemented)
│   └── frontend/       # Next.js Web App (✅ Implemented & Deployed)
├── packages/
│   ├── types/          # Shared TypeScript types (✅ Implemented)
│   ├── ui/             # Shared React components (Planned)
│   └── react/          # React hooks for API interaction (Planned)
├── ai-agent/           # Project planning and documentation
├── supabase/           # Supabase configuration and migrations
└── turbo.json          # Turborepo configuration
```

## Contributing

Contributions are welcome! Please see the [contributing guidelines](CONTRIBUTING.md) for more
information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## API Endpoints

Once the backend is running, the following endpoints are available:

### URL Shortening

- `POST /shorten` - Create a short URL
- `POST /unshorten` - Get original URL from slug
- `GET /:slug` - Redirect to original URL

### Health & Documentation

- `GET /health` - Health check endpoint
- `GET /docs` - Swagger API documentation

## Development Status

### ✅ Completed

- Monorepo setup with pnpm workspaces and Turborepo
- NestJS backend with TypeORM and Supabase PostgreSQL
- Complete API endpoints for URL shortening
- Swagger documentation
- Jest testing framework (10 tests passing)
- Shared TypeScript types package
- Supabase local development setup
- **Next.js frontend application with shadcn/ui**
- **Frontend deployed to Vercel**
- **Backend deployed to Render with CI/CD**

### 🚧 In Progress

- Enhanced URL validation
- Improved slug generation with nanoid
- Rate limiting middleware

### 📋 Planned

- React hooks package for API integration
- Shared UI components package

## Developer Details

This project is being developed by [Kashaf Ahmed](https://github.com/kashaf12).

**Key Technologies:**

- **Monorepo:** Turborepo + pnpm workspaces
- **Frontend:** Next.js (React) + shadcn/ui
- **Backend:** NestJS (Node.js) + TypeORM
- **Database:** Supabase PostgreSQL
- **Deployment:** Vercel (Frontend) + Render (Backend)
- **Package Manager:** pnpm
- **Linting:** ESLint
- **Formatting:** Prettier
- **Git Hooks:** Husky

Feel free to contribute or provide feedback!

---

## Last Updated

**Date:** January 2025  
**Version:** 1.0.0  
**Architecture:** Supabase + Render + Vercel
