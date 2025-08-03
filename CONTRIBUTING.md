# Contributing to URL Shortener

First off, thank you for considering contributing to this project! Any and all are welcome.

## How to Contribute

We'd love your help with:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Reporting Bugs

Bugs are tracked as [GitHub issues](https://github.com/kashaf12/url-shortener/issues). When you are
creating a bug report, please include as many details as possible. Explain the problem and include
additional details to help maintainers reproduce the problem:

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the exact steps which reproduce the problem** in as many details as possible.
- **Provide specific examples to demonstrate the steps.** Include links to files or GitHub projects,
  or copy/pasteable snippets, which you use in those examples.
- **Describe the behavior you observed after following the steps** and point out what exactly is the
  problem with that behavior.
- **Explain which behavior you expected to see instead and why.**

### Suggesting Enhancements

Enhancement suggestions are tracked as
[GitHub issues](https://github.com/kashaf12/url-shortener/issues).

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide a step-by-step description of the suggested enhancement** in as many details as
  possible.
- **Provide specific examples to demonstrate the steps.** Include copy/pasteable snippets which you
  use in those examples.
- **Explain why this enhancement would be useful** to most users.

### Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull
requests:

1.  Fork the repo and create your branch from `main`.
2.  If you've added code that should be tested, add tests.
3.  If you've changed APIs, update the documentation.
4.  Ensure the test suite passes.
5.  Make sure your code lints.
6.  Issue that pull request!

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature").
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
- Limit the first line to 72 characters or less.
- Reference issues and pull requests liberally after the first line.

### Code Style

We use Prettier and ESLint to maintain a consistent code style. Please run `pnpm lint` before
committing your changes.

---

## 🚀 Development Setup

### Prerequisites

- **Node.js 20+** - [Install Guide](https://nodejs.org/)
- **pnpm 9.0.0+** - Run `npm install -g pnpm`
- **Supabase CLI** - Run `npm install -g supabase`
- **Docker** - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Quick Start

```bash
# Clone your fork
git clone https://github.com/kashaf12/url-shortener.git
cd url-shortener

# Install dependencies
pnpm install

# Start Supabase local development
pnpm supabase:start

# Copy environment files
cp .env.example apps/backend/.env
cp .env.example apps/frontend/.env.local

# Update environment files with Supabase credentials
pnpm supabase:status  # Copy values to .env files

# Start development servers
pnpm dev  # Starts both frontend and backend
```

For detailed setup instructions, see [Local Development Guide](./docs/LOCAL_DEVELOPMENT.md).

---

## 🏗️ Project Architecture

### Technology Stack

- **Backend**: NestJS + TypeORM + Supabase PostgreSQL
- **Frontend**: Next.js 14+ + shadcn/ui + TypeScript
- **Database**: Supabase managed PostgreSQL
- **Deployment**: Render (backend) + Vercel (frontend)
- **Monorepo**: pnpm workspaces + Turborepo

### Project Structure

```bash
├── apps/
│   ├── backend/        # NestJS API server
│   └── frontend/       # Next.js web application
├── packages/
│   └── types/          # Shared TypeScript types
├── docs/               # Additional documentation
├── ai-agent/           # Project planning and rules
└── supabase/           # Database configuration
```

---

## 🔄 Development Workflow

### Making Changes

1. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Backend changes in `apps/backend/`
   - Frontend changes in `apps/frontend/`
   - Shared types in `packages/types/`

3. **Test your changes**:

   ```bash
   # Run tests
   pnpm test

   # Lint code
   pnpm lint

   # Type check
   pnpm type-check
   ```

4. **Update documentation** if needed

5. **Commit and push**:

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

6. **Create pull request** via GitHub

### Testing Requirements

- **Unit tests** for new backend functionality
- **Integration tests** for API endpoints
- **Type safety** - all new code must be properly typed
- **Lint passing** - `pnpm lint` must pass
- **Build success** - `pnpm build` must complete without errors

---

## 📋 Contribution Guidelines

### What We're Looking For

- **Bug fixes** - Help us squash issues
- **Feature enhancements** - Improve existing functionality
- **New features** - Add value to the platform
- **Documentation** - Improve clarity and completeness
- **Performance improvements** - Optimize speed and efficiency
- **Security enhancements** - Strengthen platform security

### What We're Not Looking For

- **Breaking changes** without discussion
- **Large refactors** without prior agreement
- **Dependency updates** without clear benefits
- **Style-only changes** (handled by automated formatting)

### Areas for Contribution

**High Priority**:

- Supabase Auth integration
- Enhanced URL validation and security
- Rate limiting implementation
- Advanced analytics features

**Medium Priority**:

- React hooks package (`@url-shortener/react`)
- Shared UI components package
- Performance optimizations
- Additional testing coverage

**Low Priority**:

- Documentation improvements
- Developer experience enhancements
- Code refactoring for clarity

---

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
pnpm test

# Run backend tests only
cd apps/backend && pnpm test

# Run with coverage
pnpm test:cov

# Run E2E tests
pnpm test:e2e
```

### Writing Tests

- **Backend**: Create `.spec.ts` files alongside source code
- **API endpoints**: Test happy path and error cases
- **Services**: Mock dependencies and test business logic
- **Types**: Ensure type safety with shared types package

### Test Requirements

- **New features** must include tests
- **Bug fixes** should include regression tests
- **API changes** require updated integration tests
- **Maintain >80% coverage** for new code

---

## 📚 Documentation Standards

### What to Document

- **New features** - Update relevant README files
- **API changes** - Update Swagger documentation
- **Breaking changes** - Update CHANGELOG.md
- **Setup changes** - Update Local Development Guide

### Documentation Files

- **README.md** - Project overview and quick start
- **apps/\*/README.md** - App-specific setup and usage
- **docs/LOCAL_DEVELOPMENT.md** - Comprehensive setup guide
- **docs/DEPLOYMENT.md** - Production deployment guide
- **docs/TROUBLESHOOTING.md** - Common issues and solutions
- **CHANGELOG.md** - Version history and breaking changes

---

## 🔒 Security Guidelines

### Security Requirements

- **Input validation** - Validate all user inputs with Zod schemas
- **SQL injection prevention** - Use parameterized queries only
- **Environment variables** - Never commit secrets to git
- **Authentication** - Follow Supabase Auth best practices
- **Rate limiting** - Implement for public endpoints

### Reporting Security Issues

For security vulnerabilities, please email directly instead of creating public issues:

<!-- - Email: [security@your-domain.com] (to be set up) -->

- Include detailed reproduction steps
- Allow time for fix before public disclosure

---

## 🎯 Pull Request Process

### Before Submitting

1. **Read these guidelines** completely
2. **Test locally** with `pnpm dev`
3. **Run quality checks**:
   ```bash
   pnpm lint       # Fix any linting issues
   pnpm type-check # Fix any type errors
   pnpm test       # Ensure all tests pass
   pnpm build      # Ensure build succeeds
   ```
4. **Update documentation** if needed
5. **Write clear commit messages**

### PR Requirements

- **Clear title** describing the change
- **Detailed description** explaining what and why
- **Testing instructions** for reviewers
- **Screenshots** for UI changes
- **Breaking changes** clearly documented
- **Links to related issues**

### Review Process

1. **Automated checks** must pass (linting, tests, build)
2. **Code review** by maintainers
3. **Testing** by reviewers when needed
4. **Approval** before merge
5. **Squash and merge** to maintain clean history

---

## 🆘 Getting Help

### Before Asking

1. **Check documentation** - README files and docs/ folder
2. **Search existing issues** - Your question might be answered
3. **Try troubleshooting guide** - [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
4. **Test on clean environment** - Rule out local setup issues

### How to Ask

- **Use clear titles** describing the issue
- **Provide context** - what you're trying to do
- **Include error messages** - full stack traces help
- **Share environment info** - OS, Node version, etc.
- **List what you've tried** - show your effort

### Community Resources

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and general discussion
- **Documentation** - Comprehensive guides and references

---

## 🏆 Recognition

Contributors will be recognized in:

- **README.md** - Contributors section
- **CHANGELOG.md** - Credit for features and fixes
- **Release notes** - Major contributions highlighted

### Types of Contributions

All contributions are valued:

- **Code** - Features, fixes, improvements
- **Documentation** - Guides, examples, clarity
- **Testing** - Finding bugs, writing tests
- **Design** - UI/UX improvements
- **Ideas** - Feature suggestions, discussions

---

## Last Updated

**Date**: January 2025  
**Version**: 1.0.0  
**Architecture**: Supabase + Render + Vercel
