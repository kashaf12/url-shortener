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

- **Monorepo Architecture:** Centralized management of all packages and applications.
- **Type-Safe:** Fully written in TypeScript for robust and maintainable code.
- **High-Performance Backend:** Built with NestJS for a scalable and efficient API.
- **Modern Frontend:** A responsive and user-friendly interface powered by Next.js.
- **Extensible:** Designed to be easily extended with new features and integrations.

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

## Project Structure

The monorepo is structured as follows:

```bash
.
├── apps
│   ├── backend         # NestJS API
│   └── frontend        # Next.js Web App
├── packages
│   ├── types           # Shared TypeScript types and interfaces
│   ├── ui              # Shared React components
│   └── react           # React hooks for interacting with the API
└── ...
```

## Contributing

Contributions are welcome! Please see the [contributing guidelines](CONTRIBUTING.md) for more
information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Progress

### Phase 1: Foundation & Monorepo Setup

- [x] **1.1.1** Initialize root package.json with pnpm workspaces (no hardcoded deps)
- [x] **1.1.2** Install latest dev dependencies via CLI (TypeScript, ESLint, Prettier)
- [x] **1.1.3** Set up Turbo configuration (turbo.json) with proper pipeline
- [x] **1.1.4** Create root TypeScript config with project references
- [ ] **1.1.5** Configure ESLint and Prettier for monorepo
- [ ] **1.1.6** Create directory structure (apps/, packages/, docs/) - _Using CLI tools instead_
- [ ] **1.1.7** Set up .gitignore and basic README

### Phase 2: Backend API Development

- [ ] **2.1.1** Initialize NestJS app in apps/backend
- [ ] **2.1.2** Install backend dependencies (NestJS, TypeORM, PostgreSQL driver)
- [ ] **2.1.3** Set up TypeORM configuration with PostgreSQL

### Phase 3: Frontend Development

- [ ] **3.1.1** Initialize Next.js 14+ app with App Router
- [ ] **3.1.2** Install frontend dependencies (TanStack Query, shadcn/ui)
- [ ] **3.1.3** Set up Tailwind CSS configuration

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
