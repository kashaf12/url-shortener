# Shared Types Package

Shared TypeScript types and Zod schemas for URL shortener platform - used across frontend, backend,
and packages.

## 🚀 Quick Start

```bash
# Development (watch mode)
pnpm dev

# Build
pnpm build

# Type checking
pnpm type-check

# Tests
pnpm test
```

## 📁 Project Structure

```bash
src/
├── api.ts              # API request/response types
├── entities/           # Database entity types
│   ├── index.ts       # Entity exports
│   └── link.ts        # Link entity types
├── slug.ts            # Slug generation types
├── deduplication.ts   # Deduplication types
└── index.ts           # Main exports
```

## 🎯 Features

### Type Safety

- **Shared Types**: Consistent types across all packages
- **Zod Schemas**: Runtime validation with TypeScript types
- **API Contracts**: Guaranteed type safety for API communication
- **Database Types**: Type-safe database operations

### Schema Validation

- **Input Validation**: Zod schemas for all API inputs
- **Output Validation**: Type-safe API responses
- **Database Validation**: Entity validation with TypeORM
- **Runtime Safety**: Catch errors at runtime

### Development Experience

- **IntelliSense**: Full TypeScript support
- **Auto-completion**: IDE support for all types
- **Type Checking**: Compile-time error detection
- **Documentation**: Self-documenting types

## 📚 API Types

### Request Types

```typescript
// URL shortening request
export interface ShortenRequest {
  url: string;
  customSlug?: string;
  metadata?: LinkMetadata;
  deduplicate?: boolean;
  enhancedCanonical?: boolean;
}

// URL resolution request
export interface UnshortenRequest {
  slug: string;
}
```

### Response Types

```typescript
// URL shortening response
export interface ShortenResponse {
  short_url: string;
  slug: string;
  url: string;
  strategy?: string;
  length?: number;
  wasDeduped?: boolean;
  wasCustomSlug?: boolean;
  spaceUsage?: SpaceUsageInfo;
}

// URL resolution response
export interface UnshortenResponse {
  url: string;
}
```

### Metadata Types

```typescript
// Link metadata
export interface LinkMetadata {
  title?: string;
  tags?: string[];
  user_name?: string;
  source?: string;
  [key: string]: string | string[] | undefined;
}
```

## 🗄️ Database Types

### Link Entity

```typescript
// Database link entity
export interface Link {
  id: string;
  slug: string;
  url: string;
  metadata: LinkMetadata;
  click_count: number;
  created_at: Date;
  updated_at: Date;
  last_clicked_at?: Date;
  status: "active" | "inactive" | "archived";
  source: "public_web" | "dashboard" | "api";
}
```

### Slug Space Usage

```typescript
// Slug space tracking
export interface SlugSpaceUsage {
  id: string;
  strategy: string;
  alphabet_hash: string;
  length: number;
  namespace?: string;
  total_space: number;
  used_space: number;
  created_at: Date;
  updated_at: Date;
}
```

## 🔧 Slug Generation Types

### Strategy Types

```typescript
// Available strategies
export type SlugStrategy = "nanoid" | "uuid";

// Strategy metadata
export interface StrategyMetadata {
  name: string;
  displayName: string;
  description: string;
  category: "secure" | "readable" | "compact" | "custom";
  features: string[];
  defaultLength: number;
  supportedLengths: StrategySupportedLengths;
  performance: StrategyPerformance;
  useCases: string[];
  examples: string[];
}
```

### Performance Types

```typescript
// Strategy performance characteristics
export interface StrategyPerformance {
  generationSpeed: "fast" | "medium" | "slow";
  collisionResistance: "low" | "medium" | "high" | "very-high";
  memorability: "low" | "medium" | "high";
}
```

## 🔄 Deduplication Types

### Hash Types

```typescript
// Deduplication hash
export interface DeduplicationHash {
  url: string;
  metadata: LinkMetadata;
  fields: string[];
  hash: string;
}

// Deduplication result
export interface DeduplicationResult {
  isDuplicate: boolean;
  existingSlug?: string;
  hash: string;
}
```

## 📊 Validation Schemas

### Zod Schemas

```typescript
// URL validation
export const UrlSchema = z.string().url("Invalid URL format");

// Slug validation
export const SlugSchema = z
  .string()
  .min(1, "Slug cannot be empty")
  .max(21, "Slug too long")
  .regex(/^[A-Za-z0-9_-]+$/, "Invalid slug characters");

// Metadata validation
export const LinkMetadataSchema = z
  .object({
    title: z.string().optional(),
    tags: z.array(z.string()).optional(),
    user_name: z.string().optional(),
    source: z.string().optional(),
  })
  .catchall(z.union([z.string(), z.array(z.string())]));
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests in CI mode
pnpm test:ci
```

## 🔧 Development

### Available Scripts

```bash
# Building
pnpm build              # Build for production
pnpm dev                # Watch mode for development
pnpm clean              # Clean build artifacts

# Type Checking
pnpm type-check         # TypeScript check
pnpm type-check:watch   # Watch mode

# Testing
pnpm test               # Run all tests
pnpm test:watch         # Watch mode
pnpm test:coverage      # Coverage report
pnpm test:ci            # CI mode

# Linting & Formatting
pnpm lint               # ESLint
pnpm lint:fix           # Auto-fix
pnpm format             # Prettier
pnpm format:check       # Check formatting
```

### Development Workflow

1. **Start Development Mode**

   ```bash
   pnpm dev
   ```

2. **Run Tests**

   ```bash
   pnpm test:watch
   ```

3. **Check Types**

   ```bash
   pnpm type-check
   ```

4. **Build for Production**
   ```bash
   pnpm build
   ```

## 📦 Usage

### In Backend

```typescript
// Import types
import { ShortenRequest, ShortenResponse } from '@url-shortener/types';

// Use in service
async shorten(request: ShortenRequest): Promise<ShortenResponse> {
  // Implementation
}
```

### In Frontend

```typescript
// Import types
import type { ShortenRequest, ShortenResponse } from "@url-shortener/types";

// Use in component
const handleSubmit = async (data: ShortenRequest) => {
  const result: ShortenResponse = await api.shorten(data);
  // Handle result
};
```

### In Other Packages

```typescript
// Import schemas
import { ShortenRequestSchema, ShortenResponseSchema } from "@url-shortener/types";

// Validate data
const validatedData = ShortenRequestSchema.parse(inputData);
```

## 🔗 Dependencies

### Core Dependencies

- **zod**: Schema validation and type inference
- **typescript**: Type checking and compilation

### Development Dependencies

- **tsup**: TypeScript bundler
- **vitest**: Testing framework
- **eslint**: Code linting
- **prettier**: Code formatting

## 📊 Build Output

### Distribution Files

```bash
dist/
├── index.js           # CommonJS bundle
├── index.mjs          # ES Module bundle
├── index.d.ts         # TypeScript declarations
└── index.d.mts        # TypeScript declarations (ESM)
```

### Exports

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  }
}
```

## 🔒 Type Safety

### Compile-time Safety

- **Type Checking**: Catch errors at compile time
- **IntelliSense**: Full IDE support
- **Refactoring**: Safe refactoring across packages
- **Documentation**: Self-documenting code

### Runtime Safety

- **Zod Validation**: Runtime type checking
- **Error Handling**: Comprehensive error messages
- **Type Guards**: Runtime type checking
- **Schema Evolution**: Backward compatibility

## 📈 Performance

### Bundle Size

- **Tree Shaking**: Unused types are eliminated
- **Minification**: Optimized for production
- **Caching**: Efficient module resolution
- **Lazy Loading**: On-demand type loading

### Build Performance

- **Incremental Builds**: Fast rebuilds
- **Parallel Processing**: Multi-core compilation
- **Caching**: Build cache for faster builds
- **Watch Mode**: Fast file watching

## 🤝 Contributing

### Adding New Types

1. **Create Type Definition**

   ```typescript
   // src/new-feature.ts
   export interface NewFeature {
     id: string;
     name: string;
   }
   ```

2. **Add Zod Schema**

   ```typescript
   export const NewFeatureSchema = z.object({
     id: z.string(),
     name: z.string(),
   });
   ```

3. **Export from Index**

   ```typescript
   // src/index.ts
   export * from "./new-feature";
   ```

4. **Add Tests**
   ```typescript
   // __tests__/new-feature.test.ts
   describe("NewFeature", () => {
     it("should validate correctly", () => {
       // Test implementation
     });
   });
   ```

### Type Guidelines

- **Descriptive Names**: Use clear, descriptive type names
- **Documentation**: Add JSDoc comments for complex types
- **Examples**: Include usage examples in comments
- **Validation**: Always include Zod schemas for runtime validation

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.
