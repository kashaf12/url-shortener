# @url-shortener/types

Shared TypeScript types and Zod validation schemas for the URL Shortener platform.

## Features

- **Type Safety**: TypeScript definitions for all API contracts
- **Runtime Validation**: Zod schemas for request/response validation
- **Tree Shakable**: ESM and CJS builds
- **Zero Config**: Auto-available in monorepo workspace

## Installation

```bash
# For external projects
npm install @url-shortener/types

# Already available in monorepo workspace
```

## Usage

### TypeScript Types

```typescript
import type {
  ShortenRequest,
  ShortenResponse,
  UnshortenRequest,
  UnshortenResponse,
} from "@url-shortener/types";

// Use in API client
async function shortenUrl(request: ShortenRequest): Promise<ShortenResponse> {
  // Implementation
}
```

### Runtime Validation

```typescript
import { ShortenRequestSchema } from "@url-shortener/types";

// Validate requests
const validateRequest = (data: unknown) => {
  try {
    const validData = ShortenRequestSchema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    return { success: false, error };
  }
};
```

## Available Types

### API Types

```typescript
// Request types
type ShortenRequest = {
  url: string;
  metadata?: Record<string, unknown>;
};

type UnshortenRequest = {
  slug: string;
};

// Response types
type ShortenResponse = {
  short_url: string;
  slug: string;
  url: string;
};

type UnshortenResponse = {
  url: string;
};
```

### Zod Schemas

- `ShortenRequestSchema` - Validates shorten requests
- `ShortenResponseSchema` - Validates shorten responses
- `UnshortenRequestSchema` - Validates unshorten requests
- `UnshortenResponseSchema` - Validates unshorten responses

## Development

### Scripts

```bash
# Build package
pnpm build

# Build in watch mode
pnpm dev

# Type check
pnpm type-check

# Run tests
pnpm test
```

### Project Structure

```bash
packages/types/
├── src/
│   ├── api.ts          # API request/response types
│   ├── entities/       # Entity types
│   └── index.ts        # Main exports
├── dist/               # Built output
└── package.json
```

## Integration Examples

### NestJS Backend

```typescript
import { Body, Controller, Post } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { ShortenRequest, ShortenRequestSchema } from "@url-shortener/types";

@Controller("v1")
export class LinkController {
  @Post("shorten")
  async shorten(
    @Body(new ZodValidationPipe(ShortenRequestSchema))
    body: ShortenRequest
  ) {
    // Implementation
  }
}
```

### Next.js Frontend

```typescript
import type { ShortenRequest, ShortenResponse } from "@url-shortener/types";

const shortenUrl = async (request: ShortenRequest): Promise<ShortenResponse> => {
  const response = await fetch("/api/shorten", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  return response.json();
};
```

## Contributing

When adding new types:

1. Add TypeScript types in appropriate file
2. Create corresponding Zod schemas
3. Export from `index.ts`
4. Update README with examples
5. Write tests for validation

### Guidelines

- Use descriptive names: `ShortenRequest` not `ShortReq`
- Keep schemas aligned with TypeScript types
- Use `string` for dates (ISO format)
- Prefer `Record<string, unknown>` for flexible objects

## Dependencies

- **Runtime**: `zod` for validation schemas
- **Dev**: `tsup` for building, `vitest` for testing

## Documentation

- [Monorepo Setup](../../README.md)
- [Backend Usage](../../apps/backend/README.md)
