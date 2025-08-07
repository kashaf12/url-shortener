# Frontend App

Next.js frontend for URL shortener platform with modern UI, real-time analytics, and responsive
design.

## 🚀 Quick Start

```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start

# Tests
pnpm test
```

## 📁 Project Structure

```bash
src/
├── app/                   # Next.js App Router
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── header.tsx        # Site header
│   ├── footer.tsx        # Site footer
│   ├── url-shortener-form.tsx # Main form component
│   └── theme-provider.tsx # Theme provider
├── lib/                  # Utilities and API
│   ├── api.ts            # API service
│   └── utils.ts          # Utility functions
├── context/              # React context
│   └── auth-context.tsx  # Authentication context
└── hooks/                # Custom React hooks
```

## 🎨 Features

### Core Functionality

- **URL Shortening**: Create short URLs with custom slugs
- **Real-time Updates**: Live updates with optimistic UI
- **Responsive Design**: Mobile-first responsive layout
- **Dark/Light Mode**: Theme switching with system preference

### Advanced Features

- **Type Safety**: Full TypeScript integration with shared types
- **Form Validation**: Client-side validation with error handling
- **Loading States**: Skeleton loading and progress indicators
- **Error Handling**: Comprehensive error messages and recovery
- **Copy to Clipboard**: One-click copying of shortened URLs

### UI/UX Features

- **Modern Design**: Beautiful UI with shadcn/ui components
- **Animations**: Smooth transitions and micro-interactions
- **Accessibility**: WCAG compliant with keyboard navigation
- **SEO Optimized**: Meta tags, structured data, and sitemap
- **PWA Ready**: Progressive Web App capabilities

### Analytics & Tracking

- **Click Tracking**: Track URL clicks and analytics
- **User Analytics**: Anonymous usage analytics
- **Performance Monitoring**: Core Web Vitals tracking
- **Error Tracking**: Client-side error reporting

## 🛠️ Tech Stack

### Core Technologies

- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript 5**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework

### UI Components

- **shadcn/ui**: Beautiful, accessible components
- **Radix UI**: Headless component primitives
- **Lucide React**: Beautiful icons
- **Sonner**: Toast notifications

### Development Tools

- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **Vitest**: Unit testing

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
```

### Next.js Configuration

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ["localhost", "your-domain.com"],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run tests in CI mode
pnpm test:ci
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

### Static Export

```bash
# Build static files
pnpm export

# Serve static files
pnpm start
```

### Docker

```bash
# Build Docker image
docker build -t url-shortener-frontend .

# Run container
docker run -p 3000:3000 url-shortener-frontend
```

## 📱 PWA Features

### Service Worker

- **Offline Support**: Cache static assets
- **Background Sync**: Sync when online
- **Push Notifications**: Real-time updates

### Manifest

- **App Icons**: Multiple sizes for different devices
- **Theme Colors**: Consistent branding
- **Display Mode**: Standalone app experience

## 🎨 Theming

### Color Scheme

```css
/* Light theme */
--background: #ffffff --foreground: #171717 --primary: #2563eb --primary-foreground: #ffffff
  /* Dark theme */ --background: #0a0a0a --foreground: #ededed --primary: #3b82f6
  --primary-foreground: #ffffff;
```

### Customization

```typescript
// components/theme-provider.tsx
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Development server
pnpm dev:port 3001    # Custom port

# Building
pnpm build            # Production build
pnpm build:analyze    # Bundle analysis
pnpm clean            # Clean build artifacts

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Watch mode
pnpm test:cov         # Coverage report
pnpm test:ci          # CI mode

# Linting & Formatting
pnpm lint             # ESLint
pnpm lint:fix         # Auto-fix
pnpm format           # Prettier
pnpm format:check     # Check formatting

# Type Checking
pnpm type-check       # TypeScript check
pnpm type-check:watch # Watch mode

# Export
pnpm export           # Static export
pnpm start            # Production server
```

### Development Workflow

1. **Start Development Server**

   ```bash
   pnpm dev
   ```

2. **Run Tests**

   ```bash
   pnpm test:watch
   ```

3. **Check Code Quality**

   ```bash
   pnpm lint
   pnpm format
   pnpm type-check
   ```

4. **Build for Production**
   ```bash
   pnpm build
   pnpm start
   ```

## 📚 API Integration

### API Service

```typescript
// lib/api.ts
export class ApiService {
  async shorten(data: ShortenRequest): Promise<ShortenResponse> {
    return this.request<ShortenResponse>("/shorten", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}
```

### Usage in Components

```typescript
// components/url-shortener-form.tsx
const handleSubmit = async (data: ShortenRequest) => {
  try {
    const result = await apiService.shorten(data);
    setResult(result);
  } catch (error) {
    setError(error.message);
  }
};
```

## 🎯 Performance

### Optimizations

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Font Optimization**: System fonts with fallbacks
- **Bundle Analysis**: Webpack bundle analyzer

### Core Web Vitals

- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### Monitoring

```typescript
// lib/analytics.ts
export function trackEvent(event: string, properties?: Record<string, any>) {
  // Analytics implementation
}
```

## 🔒 Security

### Content Security Policy

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
/>
```

### Input Validation

```typescript
// Client-side validation
const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
```

### Error Boundaries

```typescript
// Error boundary component
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      {children}
    </ErrorBoundary>
  );
}
```

## 📊 Analytics

### Page Views

```typescript
// Track page views
useEffect(() => {
  trackPageView("/");
}, []);
```

### User Events

```typescript
// Track user interactions
const handleUrlShorten = () => {
  trackEvent("url_shortened", {
    hasCustomSlug: !!customSlug,
    deduplicate: deduplicate,
  });
};
```

### Performance Monitoring

```typescript
// Monitor Core Web Vitals
export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Send to analytics
}
```

## 🔗 Dependencies

### Core Dependencies

- **next**: React framework
- **react**: UI library
- **react-dom**: React DOM
- **@url-shortener/types**: Shared types

### UI Dependencies

- **@radix-ui/react-\***: Headless components
- **class-variance-authority**: Component variants
- **clsx**: Conditional classes
- **tailwind-merge**: Tailwind class merging

### Development Dependencies

- **@types/react**: React types
- **@types/node**: Node types
- **eslint**: Linting
- **typescript**: Type checking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.
