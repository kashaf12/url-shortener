# @url-shortener/types

Shared TypeScript types and runtime validation schemas for the URL Shortener platform. This package
provides type safety across the entire monorepo and includes Zod schemas for runtime validation.

## Features

- **Type Safety**: Comprehensive TypeScript definitions for all API contracts
- **Runtime Validation**: Zod schemas for request/response validation
- **Tree Shakable**: ESM and CJS builds for optimal bundle sizes
- **Zero Dependencies**: Only depends on Zod for validation
- **Auto-Generated**: Types automatically exported and available across workspace

## Installation

This package is automatically available in the monorepo workspace. For external projects:

```bash
# Using npm
npm install @url-shortener/types

# Using pnpm
pnpm add @url-shortener/types

# Using yarn
yarn add @url-shortener/types
```

## Usage

### TypeScript Types

```typescript
import type {
  ShortenRequest,
  ShortenResponse,
  UnshortenRequest,
  UnshortenResponse,
  ErrorResponse,
} from "@url-shortener/types";

// Use in your API client
async function shortenUrl(request: ShortenRequest): Promise<ShortenResponse> {
  // Implementation
}

// Use in your API server
function handleShortenRequest(req: ShortenRequest): ShortenResponse {
  // Implementation
}
```

### Runtime Validation

```typescript
import { ShortenRequestSchema, ShortenResponseSchema } from "@url-shortener/types";

// Validate API requests
const validateRequest = (data: unknown) => {
  try {
    const validData = ShortenRequestSchema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    return { success: false, error };
  }
};

// Validate API responses
const result = ShortenResponseSchema.safeParse(apiResponse);
if (result.success) {
  console.log("Valid response:", result.data);
} else {
  console.error("Invalid response:", result.error);
}
```

## Available Types

### API Request Types

#### `ShortenRequest`

```typescript
{
  url: string;                    // Valid URL to shorten
  customSlug?: string;            // Optional custom slug
  expiration?: string;            // ISO datetime string
  metadata?: Record<string, string>; // Additional metadata
}
```

#### `UnshortenRequest`

```typescript
{
  url: string; // Short URL to resolve
}
```

### API Response Types

#### `ShortenResponse`

```typescript
{
  id: string; // Unique identifier
  shortUrl: string; // Complete short URL
  originalUrl: string; // Original long URL
  slug: string; // URL slug
  clicks: number; // Click count
  createdAt: string; // ISO datetime
  expiresAt: string | null; // Expiration datetime
  metadata: Record<string, string> | null; // Metadata
}
```

#### `UnshortenResponse`

```typescript
{
  originalUrl: string; // Original long URL
  shortUrl: string; // Short URL
  slug: string; // URL slug
  clicks: number; // Click count
  createdAt: string; // ISO datetime
  expiresAt: string | null; // Expiration datetime
}
```

#### `ErrorResponse`

```typescript
{
  error: string; // Error type
  message: string; // Human-readable message
  statusCode: number; // HTTP status code
  timestamp: string; // ISO datetime
}
```

## Zod Schemas

All types have corresponding Zod schemas for runtime validation:

- `ShortenRequestSchema`
- `ShortenResponseSchema`
- `UnshortenRequestSchema`
- `UnshortenResponseSchema`

### Validation Features

- **URL Validation**: Ensures valid URL format
- **Type Coercion**: Automatic string to number conversion where appropriate
- **Required Fields**: Enforces required vs optional properties
- **Custom Validation**: Domain-specific validation rules

## Development

### Building the Package

```bash
# Build for production
pnpm run build

# Build in watch mode
pnpm run dev

# Type check only
pnpm run type-check
```

### Testing

```bash
# Run tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch
```

### File Structure

```bash
packages/types/
├── src/
│   ├── api.ts              # API request/response types
│   └── index.ts            # Main exports
├── dist/                   # Built output
├── package.json
├── tsconfig.json
└── README.md
```

## Integration Examples

### NestJS Backend

```typescript
import { Body, Controller, Post } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { ShortenRequest, ShortenResponse, ShortenRequestSchema } from "@url-shortener/types";

@Controller("api")
export class ShortenController {
  @Post("shorten")
  async shorten(
    @Body(new ZodValidationPipe(ShortenRequestSchema))
    body: ShortenRequest
  ): Promise<ShortenResponse> {
    // Implementation
  }
}
```

### Next.js Frontend

```typescript
import { useState } from "react";
import type { ShortenRequest, ShortenResponse } from "@url-shortener/types";

export function UrlShortener() {
  const [result, setResult] = useState<ShortenResponse | null>(null);

  const shortenUrl = async (request: ShortenRequest) => {
    const response = await fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    const data: ShortenResponse = await response.json();
    setResult(data);
  };

  // Component JSX
}
```

### React Hook

```typescript
import { useState } from "react";
import { ShortenRequest, ShortenResponse, ShortenRequestSchema } from "@url-shortener/types";

export function useUrlShortener() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shorten = async (request: ShortenRequest): Promise<ShortenResponse> => {
    // Validate request at runtime
    const validRequest = ShortenRequestSchema.parse(request);

    setLoading(true);
    setError(null);

    try {
      // API call implementation
      const response = await api.shorten(validRequest);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { shorten, loading, error };
}
```

## Version History

- **1.0.0**: Initial release with core API types

## Contributing

When adding new types:

1. **Add TypeScript types** in appropriate file (e.g., `api.ts`)
2. **Create Zod schemas** for runtime validation
3. **Export from `index.ts`**
4. **Update this README** with examples
5. **Write tests** for validation logic
6. **Update version** following semantic versioning

### Type Guidelines

- Use descriptive names: `ShortenRequest` not `ShortReq`
- Include JSDoc comments for complex types
- Prefer `string` for dates (ISO format)
- Use `Record<string, string>` for flexible metadata
- Keep schemas aligned with TypeScript types

## Dependencies

- **Runtime**: `zod` for validation schemas
- **Dev**: `tsup` for building, `vitest` for testing

## License

MIT License - see the [LICENSE](../../LICENSE) file for detail
