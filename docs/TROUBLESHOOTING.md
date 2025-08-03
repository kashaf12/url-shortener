# Troubleshooting Guide

This guide helps you resolve common issues when setting up and running the URL Shortener Platform.

---

## 🚀 Quick Diagnostic Commands

Run these commands to check the health of your development environment:

```bash
# Check Node.js version (should be 20+)
node --version

# Check pnpm version (should be 9.0.0+)
pnpm --version

# Check Supabase CLI
supabase --version

# Check all services status
pnpm supabase:status

# Check if ports are available
lsof -i :3000 -i :8000 -i :54321 -i :54322
```

---

## 🔧 Installation Issues

### Node.js Version Compatibility

**Problem**: `pnpm install` fails with version errors

**Symptoms**:

```bash
error @nestjs/cli@11.0.0: The engine "node" is incompatible with this module
```

**Solution**:

```bash
# Check current Node.js version
node --version

# Install Node.js 20+ using nvm (recommended)
nvm install 20
nvm use 20

# Or download from https://nodejs.org/
```

### pnpm Installation Issues

**Problem**: `pnpm` command not found

**Solution**:

```bash
# Install pnpm globally
npm install -g pnpm@9.0.0

# Or using corepack (Node.js 16.10+)
corepack enable
corepack prepare pnpm@9.0.0 --activate
```

### Supabase CLI Installation

**Problem**: `supabase` command not found

**Solution**:

```bash
# Install via npm (recommended)
npm install -g supabase

# Or via Homebrew (macOS)
brew install supabase/tap/supabase

# Or via Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

---

## 🗄️ Database Issues

### Supabase Services Won't Start

**Problem**: `pnpm supabase:start` fails

**Symptoms**:

```bash
Error: Docker is not running
```

**Solution**:

```bash
# Ensure Docker is installed and running
docker --version
docker ps

# Start Docker Desktop if not running
# Then retry:
pnpm supabase:start
```

### Port Conflicts

**Problem**: Database port already in use

**Symptoms**:

```bash
Error: port 54322 already in use
```

**Solution**:

```bash
# Find what's using the port
lsof -i :54322

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or change Supabase port in supabase/config.toml
[db]
port = 54323
```

### Database Connection Errors

**Problem**: Backend can't connect to database

**Symptoms**:

```bash
Error: connect ECONNREFUSED 127.0.0.1:54322
```

**Solution**:

```bash
# Check if Supabase is running
pnpm supabase:status

# Check environment variables
cat apps/backend/.env | grep DATABASE

# Restart Supabase
pnpm supabase:stop
pnpm supabase:start
```

### Database Migrations Fail

**Problem**: TypeORM migration errors

**Symptoms**:

```bash
QueryFailedError: relation "links" does not exist
```

**Solution**:

```bash
# Reset Supabase database
pnpm supabase:stop
pnpm supabase:start

# Or manually run migrations
cd apps/backend
pnpm run migration:run
```

---

## 🖥️ Backend Issues

### Backend Won't Start

**Problem**: NestJS application crashes on startup

**Symptoms**:

```bash
[Nest] ERROR [TypeOrmModule] Unable to connect to the database
```

**Diagnostic Steps**:

```bash
# Check environment file exists
ls apps/backend/.env

# Check database connection
cd apps/backend
pnpm run start:dev
```

**Solution**:

```bash
# Copy environment template
cp .env.example apps/backend/.env

# Update with Supabase credentials
pnpm supabase:status
# Copy the values to apps/backend/.env
```

### Port 8000 Already in Use

**Problem**: Backend port conflict

**Symptoms**:

```bash
Error: listen EADDRINUSE: address already in use :::8000
```

**Solution**:

```bash
# Find what's using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or change port in apps/backend/.env
PORT=8001
```

### TypeScript Compilation Errors

**Problem**: Type errors prevent startup

**Symptoms**:

```bash
error TS2307: Cannot find module '@url-shortener/types'
```

**Solution**:

```bash
# Build shared types first
pnpm build --filter @url-shortener/types

# Or build everything
pnpm build
```

### API Endpoints Return 404

**Problem**: Routes not working correctly

**Diagnostic**:

```bash
# Check if backend is running
curl http://localhost:8000/health

# Check Swagger docs
open http://localhost:8000/docs
```

**Solution**:

```bash
# Restart backend with clean build
cd apps/backend
pnpm run build
pnpm run start:dev
```

---

## 🎨 Frontend Issues

### Frontend Won't Start

**Problem**: Next.js development server fails

**Symptoms**:

```bash
Error: Cannot find module 'next'
```

**Solution**:

```bash
# Install dependencies
cd apps/frontend
pnpm install

# Start development server
pnpm dev
```

### Port 3000 Already in Use

**Problem**: Frontend port conflict

**Solution**:

```bash
# Find and kill process using port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
cd apps/frontend
PORT=3001 pnpm dev
```

### API Connection Issues

**Problem**: Frontend can't reach backend

**Symptoms**:

- Network errors in browser console
- "Failed to fetch" errors

**Diagnostic**:

```bash
# Check if backend is running
curl http://localhost:8000/health

# Check frontend environment
cat apps/frontend/.env.local | grep API_URL
```

**Solution**:

```bash
# Create frontend environment file
cp .env.example apps/frontend/.env.local

# Ensure correct API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > apps/frontend/.env.local

# Restart frontend
cd apps/frontend
pnpm dev
```

### Build Errors

**Problem**: Next.js build fails

**Symptoms**:

```bash
Type error: Cannot find module '@/components/ui/button'
```

**Solution**:

```bash
# Check if all dependencies are installed
cd apps/frontend
pnpm install

# Clear Next.js cache
rm -rf .next
pnpm build
```

---

## 🚢 Production Deployment Issues

### Render Deployment Fails

**Problem**: Backend deployment fails on Render

**Common Issues**:

1. **Build Command Incorrect**

   ```bash
   # Correct build command for Render:
   cd apps/backend && pnpm install && pnpm build
   ```

2. **Start Command Incorrect**

   ```bash
   # Correct start command for Render:
   cd apps/backend && pnpm start:prod
   ```

3. **Environment Variables Missing**
   - Ensure all Supabase credentials are set in Render dashboard
   - Check production database connection string

### Vercel Deployment Issues

**Problem**: Frontend deployment fails on Vercel

**Common Solutions**:

1. **Build Command**

   ```bash
   # Vercel should auto-detect, but can set manually:
   pnpm build
   ```

2. **Environment Variables**
   ```bash
   # Required in Vercel dashboard:
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Database Connection in Production

**Problem**: Production app can't connect to Supabase

**Diagnostic**:

```bash
# Test production API
curl https://your-backend.onrender.com/health

# Check production logs in Render dashboard
```

**Solution**:

- Verify Supabase production URL and credentials
- Check Supabase project settings for connection string
- Ensure database is not paused (free tier limitation)

---

## 🧪 Testing Issues

### Tests Fail to Run

**Problem**: Jest tests don't execute

**Symptoms**:

```bash
Cannot find module '@url-shortener/types'
```

**Solution**:

```bash
# Build dependencies first
pnpm build --filter @url-shortener/types

# Run tests
pnpm test
```

### Database Tests Fail

**Problem**: Tests can't connect to test database

**Solution**:

```bash
# Ensure Supabase is running for tests
pnpm supabase:start

# Run backend tests
cd apps/backend
pnpm test
```

---

## 🔍 Debugging Tips

### Enable Debug Logging

```bash
# Backend debug mode
cd apps/backend
LOG_LEVEL=debug pnpm start:dev

# Frontend debug mode
cd apps/frontend
DEBUG=* pnpm dev
```

### Check Service Health

```bash
# Backend health
curl http://localhost:8000/health

# Supabase services
pnpm supabase:status

# Frontend (in browser)
open http://localhost:3000
```

### View Logs

```bash
# Backend logs (with Winston formatting)
cd apps/backend
tail -f server.log

# Supabase logs
supabase logs --follow

# Frontend logs (in browser console)
# Open DevTools → Console tab
```

---

## 🆘 Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide** for your specific issue
2. **Search existing issues** on GitHub
3. **Check the logs** for specific error messages
4. **Verify your environment** meets the prerequisites

### How to Report Issues

1. **Describe the problem** clearly
2. **Include error messages** (full stack traces)
3. **Provide environment info**:
   ```bash
   # Gather environment info
   echo "Node: $(node --version)"
   echo "pnpm: $(pnpm --version)"
   echo "Supabase: $(supabase --version)"
   echo "OS: $(uname -a)"
   ```
4. **List steps to reproduce** the issue
5. **Mention what you've already tried**

### Community Resources

- **GitHub Issues**: https://github.com/kashaf12/url-shortener/issues
- **Supabase Docs**: https://supabase.com/docs
- **NestJS Docs**: https://docs.nestjs.com/
- **Next.js Docs**: https://nextjs.org/docs

---

## 📚 Related Documentation

- [Local Development Guide](./LOCAL_DEVELOPMENT.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Project README](../README.md)

---

## Last Updated

**Date**: January 2025  
**Version**: 1.0.0  
**Coverage**: Supabase + Render + Vercel Architecture
