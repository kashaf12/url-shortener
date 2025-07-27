# URL Shortener Frontend

A modern, responsive URL shortener frontend built with Next.js 14+ and shadcn/ui components.

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

- Node.js 18+
- pnpm (recommended)

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
   NEXT_PUBLIC_API_URL=http://localhost:8000/v1
   ```

3. **Run the development server:**

   ```bash
   pnpm dev
   ```

4. **Open your browser:** Open [http://localhost:3000](http://localhost:3000) to see the
   application.

## Environment Variables

### Required Variables

| Variable              | Description          | Example                    |
| --------------------- | -------------------- | -------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/v1` |

### Production Variables

For production deployment on Vercel:

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com/v1
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

This application is deployed on [Vercel](https://vercel.com). The deployment is automatically
triggered on pushes to the main branch.

### Manual Deployment

1. **Build the application:**

   ```bash
   pnpm build
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

## Technologies Used

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Fetch API
- **Icons**: Lucide React
- **Toast Notifications**: sonner

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
