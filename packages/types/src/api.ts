import { z } from "zod";
import { LinkMetadataSchema } from "./entities/link";

// API Request/Response Types
export const ShortenRequestSchema = z.object({
  url: z.url("Invalid URL format"),
  metadata: LinkMetadataSchema.optional(),
});

export const ShortenResponseSchema = z.object({
  short_url: z.url(),
  slug: z.string().min(1).max(20),
  url: z.url(),
});

export const UnshortenRequestSchema = z.object({
  slug: z.string().min(1).max(20),
});

export const UnshortenResponseSchema = z.object({
  url: z.url(),
});

// Type exports
export type ShortenRequest = z.infer<typeof ShortenRequestSchema>;
export type ShortenResponse = z.infer<typeof ShortenResponseSchema>;
export type UnshortenRequest = z.infer<typeof UnshortenRequestSchema>;
export type UnshortenResponse = z.infer<typeof UnshortenResponseSchema>;
