import { z } from "zod";
import { LinkMetadataSchema } from "./entities/link";

// Available slug generation strategies
export const SlugStrategySchema = z.enum(["nanoid", "uuid"]);

// Available alphabet types
export const AlphabetTypeSchema = z.enum([
  "alphanumeric",
  "urlSafe",
  "readable",
]);

// Available pattern types
export const PatternTypeSchema = z.enum([
  "alphanumeric",
  "urlSafe",
  "readable",
]);

// API Request/Response Types
export const ShortenRequestSchema = z.object({
  url: z.url("Invalid URL format"),
  metadata: LinkMetadataSchema.optional(),

  // Custom slug override (takes precedence over generation)
  customSlug: z
    .string()
    .min(1)
    .max(21)
    .optional()
    .describe("Use a custom slug instead of generating one"),

  // Slug generation options (used only if customSlug not provided)
  slugStrategy: SlugStrategySchema.optional().describe(
    "Slug generation strategy to use (defaults to configured strategy)"
  ),
  length: z
    .number()
    .int()
    .min(4)
    .max(21)
    .optional()
    .describe("Desired slug length (will be clamped to min/max constraints)"),

  // Alphabet customization
  alphabetType: AlphabetTypeSchema.optional().describe(
    "Predefined alphabet type for easy selection"
  ),
  alphabet: z
    .string()
    .min(2)
    .optional()
    .describe("Custom alphabet string (takes precedence over alphabetType)"),

  // Pattern validation
  patternType: PatternTypeSchema.optional().describe(
    "Predefined pattern type for validation"
  ),
  pattern: z
    .string()
    .optional()
    .describe("Custom regex pattern (as string) that slug must match"),

  // Advanced options
  namespace: z
    .string()
    .min(1)
    .max(50)
    .optional()
    .describe("Optional namespace for scoped slug generation"),

  // Deduplication options
  deduplicate: z
    .boolean()
    .optional()
    .default(false)
    .describe("Enable deduplication based on URL + metadata hash"),
  deduplicationFields: z
    .array(z.string())
    .max(10)
    .optional()
    .describe("Specific metadata fields to include in deduplication hash"),
  enhancedCanonical: z
    .boolean()
    .optional()
    .default(false)
    .describe("Use enhanced canonical hashing for improved deduplication"),
});

export const ShortenResponseSchema = z.object({
  short_url: z.url(),
  slug: z.string().min(1).max(21),
  url: z.url(),
  strategy: z
    .string()
    .optional()
    .describe("Strategy used to generate the slug"),
  length: z.number().optional().describe("Actual length of the generated slug"),
  wasDeduped: z
    .boolean()
    .optional()
    .describe("Whether an existing slug was returned due to deduplication"),
  wasCustomSlug: z
    .boolean()
    .optional()
    .describe("Whether the slug was provided by the user"),
  namespace: z.string().optional().describe("Namespace used for the slug"),
  spaceUsage: z
    .object({
      usagePercentage: z.number().describe("Current space usage percentage"),
      status: z
        .enum(["safe", "warning", "critical", "exhausted"])
        .describe("Space usage status"),
      remainingSpace: z
        .number()
        .describe("Remaining space in this configuration"),
    })
    .optional()
    .describe("Slug space usage information"),
});

export const UnshortenRequestSchema = z.object({
  slug: z.string().min(1).max(21),
});

export const UnshortenResponseSchema = z.object({
  url: z.url(),
});

// Type exports
export type SlugStrategy = z.infer<typeof SlugStrategySchema>;
export type AlphabetType = z.infer<typeof AlphabetTypeSchema>;
export type PatternType = z.infer<typeof PatternTypeSchema>;
export type ShortenRequest = z.infer<typeof ShortenRequestSchema>;
export type ShortenResponse = z.infer<typeof ShortenResponseSchema>;
export type UnshortenRequest = z.infer<typeof UnshortenRequestSchema>;
export type UnshortenResponse = z.infer<typeof UnshortenResponseSchema>;
