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

## Features

- **Monorepo Architecture:** Centralized management with pnpm workspaces and Turborepo
- **Type-Safe:** Fully written in TypeScript with shared types package
- **NestJS Backend:** Scalable REST API with TypeORM, PostgreSQL, and Swagger documentation
- **Health Monitoring:** Built-in health check endpoints for production monitoring
- **Modern Tooling:** ESLint flat config, Prettier, and automated code quality checks
- **Development Ready:** Hot reloading, environment configuration, and comprehensive testing setup

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [pnpm](https://pnpm.io/)

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

3.  **Build the packages:**

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
pnpm --filter backend start:dev
```

The backend will be available at:

- **API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## Project Structure

The monorepo is structured as follows:

```bash
.
├── apps/
│   ├── backend/        # NestJS API (✅ Implemented)
│   │   ├── src/
│   │   │   ├── health/ # Health check module
│   │   │   └── ...     # App structure with controllers, services
│   │   └── package.json
│   └── frontend/       # Next.js Web App (Planned)
├── packages/
│   ├── types/          # Shared TypeScript types (✅ Basic structure)
│   │   ├── src/api.ts  # API request/response types
│   │   └── src/index.ts
│   ├── ui/             # Shared React components (Planned)
│   └── react/          # React hooks for API interaction (Planned)
├── ai-agent/           # Project planning and documentation
└── turbo.json          # Turborepo configuration
```

## Contributing

Contributions are welcome! Please see the [contributing guidelines](CONTRIBUTING.md) for more
information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Progress

### Phase 1: Foundation & Monorepo Setup ✅ COMPLETED

- [x] **1.1.1** Initialize root package.json with pnpm workspaces (no hardcoded deps)
- [x] **1.1.2** Install latest dev dependencies via CLI (TypeScript, ESLint, Prettier)
- [x] **1.1.3** Set up Turbo configuration (turbo.json) with proper pipeline
- [x] **1.1.4** Create root TypeScript config with project references
- [x] **1.1.5** Configure ESLint and Prettier for monorepo _(implemented with modern flat config)_
- [x] **1.1.6** Create directory structure (apps/, packages/, docs/)
- [x] **1.1.7** Set up .gitignore and basic README _(includes contributing guidelines)_

### Phase 2: Backend API Development 🎯 CURRENT FOCUS

- [x] **2.1.1** Initialize NestJS app in apps/backend with CLI
- [x] **2.1.2** Install backend dependencies (NestJS, TypeORM, PostgreSQL driver, nestjs-zod)
- [x] **2.1.3** Set up Swagger/OpenAPI documentation with @nestjs/swagger
- [x] **2.1.4** Configure environment variables with @nestjs/config
- [x] **2.1.5** Set up TypeORM configuration with PostgreSQL connection
- [x] **2.1.6** Create basic app structure (modules, controllers, services)
- [x] **2.1.7** Implement health check endpoint (/health) with dedicated module
- [ ] **2.1.8** Set up logging configuration with structured logging
- [ ] **2.2.1** Create Link entity with TypeORM decorators
- [ ] **2.2.3** Set up database migrations

### Phase 3: Frontend Development (Next Phase)

- [ ] **3.1.1** Initialize Next.js 14+ app with App Router
- [ ] **3.1.2** Install frontend dependencies (TanStack Query, shadcn/ui)
- [ ] **3.1.3** Set up Tailwind CSS configuration

### Types Package Progress

- [x] **1.2.1** Create packages/types structure with package.json
- [x] **1.2.2** Set up TypeScript config for types package
- [x] **1.2.3** Install Zod for runtime validation
- [x] **1.2.4** Implement core API types (ShortenRequest, ShortenResponse)

## Developer Details

This project is being developed by [Kashaf Ahmed](https://github.com/kashaf12).

**Key Technologies:**

- **Monorepo:** Turborepo
- **Frontend:** Next.js (React)
- **Backend:** NestJS (Node.js)
- **Package Manager:** pnpm
- **Linting:** ESLint
- **Formatting:** Prettier
- **Git Hooks:** Husky

Feel free to contribute or provide feedback!
