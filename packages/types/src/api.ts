import { z } from "zod";

// API Request/Response Types
export const ShortenRequestSchema = z.object({
  url: z.string().url("Invalid URL format"),
  customSlug: z.string().optional(),
  expiration: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const ShortenResponseSchema = z.object({
  id: z.string(),
  shortUrl: z.string().url(),
  originalUrl: z.string().url(),
  slug: z.string(),
  clicks: z.number().int().min(0),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable(),
  metadata: z.record(z.string(), z.string()).nullable(),
});

export const UnshortenRequestSchema = z.object({
  url: z.string().url("Invalid URL format"),
});

export const UnshortenResponseSchema = z.object({
  originalUrl: z.string().url(),
  shortUrl: z.string().url(),
  slug: z.string(),
  clicks: z.number().int().min(0),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number().int(),
  timestamp: z.string().datetime(),
});

// Type exports
export type ShortenRequest = z.infer<typeof ShortenRequestSchema>;
export type ShortenResponse = z.infer<typeof ShortenResponseSchema>;
export type UnshortenRequest = z.infer<typeof UnshortenRequestSchema>;
export type UnshortenResponse = z.infer<typeof UnshortenResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
