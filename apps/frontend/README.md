# URL Shortener Frontend

A modern, responsive URL shortener frontend built with Next.js 14+ and shadcn/ui components.
Deployed on Vercel with automatic CI/CD integration.

## 🚀 Live Demo

**Production:**
[https://url-shortener-frontend-plum.vercel.app/](https://url-shortener-frontend-plum.vercel.app/)

## Features

- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **URL Shortening**: Create short URLs with custom slugs (optional)
- **URL Analytics**: View click counts and creation dates
- **Form Validation**: Real-time validation with Zod schemas
- **Toast Notifications**: User-friendly feedback for all actions
- **Clipboard Integration**: One-click copying of shortened URLs

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (v9.0.0 or higher)
- Backend API running (local or production)

### Development

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables:

   ```env
   # For local development (with local backend)
   NEXT_PUBLIC_API_URL=http://localhost:8000

   # For production backend integration
   NEXT_PUBLIC_API_URL=https://url-shortener-but7.onrender.com

   # Supabase (when auth is implemented)
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run the development server:**

   ```bash
   pnpm dev
   ```

4. **Open your browser:** Open [http://localhost:3000](http://localhost:3000) to see the
   application.

## Environment Variables

### Local Development

| Variable              | Description          | Example                 |
| --------------------- | -------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |

### Production Variables

For production deployment on Vercel:

| Variable                        | Description            | Example                                   |
| ------------------------------- | ---------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_API_URL`           | Production backend URL | `https://url-shortener-but7.onrender.com` |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL   | `https://your-project.supabase.co`        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `your-anon-key`                           |

### Environment Setup

```env
# .env.local (for local development)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key

# .env.production (for Vercel deployment)
NEXT_PUBLIC_API_URL=https://url-shortener-but7.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

## Project Structure

```
src/
├── app/                    # Next.js 14+ App Router
│   ├── page.tsx           # Home page with URL shortener
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── url-shortener-form.tsx
│   └── url-list.tsx
├── lib/                  # Utilities and configurations
│   ├── utils.ts          # Utility functions
│   └── validations.ts    # Zod schemas
└── types/               # TypeScript type definitions
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript compiler

## Deployment

This application is deployed on [Vercel](https://vercel.com) with automatic CI/CD integration.

### Automatic Deployment (Recommended)

1. **Production**: Automatically deployed when pushing to `main` branch
2. **Preview**: Branch deployments for pull requests
3. **Environment Variables**: Configured in Vercel dashboard
4. **Domain**: Custom domain configured through Vercel

### Manual Deployment

1. **Install Vercel CLI:**

   ```bash
   pnpm add -g vercel
   ```

2. **Build and deploy:**
   ```bash
   pnpm build
   vercel --prod
   ```

### Deployment Configuration

**Vercel Settings:**

- Build Command: `pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`
- Development Command: `pnpm dev`

**Environment Variables (Vercel Dashboard):**

```env
NEXT_PUBLIC_API_URL=https://url-shortener-but7.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

## Technologies Used

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Fetch API
- **Icons**: Lucide React
- **Toast Notifications**: sonner

## Integration with Backend

The frontend integrates with the NestJS backend through REST API calls:

1. **URL Shortening**: `POST /shorten` endpoint
2. **URL Resolution**: `POST /unshorten` endpoint
3. **Redirects**: `GET /:slug` endpoint
4. **Health Checks**: `GET /health` endpoint

### API Client Configuration

The API client is configured in `src/lib/api.ts` and uses the `NEXT_PUBLIC_API_URL` environment
variable.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Supabase Frontend Integration](https://supabase.com/docs/guides/with-nextjs)

---

## Last Updated

**Date:** January 2025  
**Version:** 1.0.0  
**Deployment:** Vercel + Render Backend  
**Status:** Production Ready
