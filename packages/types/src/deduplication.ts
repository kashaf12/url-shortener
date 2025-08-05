import { z } from "zod";

// ================================
// DEDUPLICATION CONSTANTS
// ================================

/**
 * Default fields to include in metadata hash for deduplication
 */
export const DEFAULT_DEDUPLICATION_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "ref",
] as const;

/**
 * Maximum number of deduplication fields to prevent performance issues
 */
export const MAX_DEDUPLICATION_FIELDS = 10;

/**
 * Deduplication field validation constraints
 */
export const DEDUPLICATION_CONSTRAINTS = {
  MAX_FIELDS: MAX_DEDUPLICATION_FIELDS,
  DEFAULT_FIELDS: DEFAULT_DEDUPLICATION_FIELDS,
} as const;

// ================================
// DEDUPLICATION SCHEMAS
// ================================

/**
 * Deduplication context for URL + metadata hashing
 */
export const DeduplicationContextSchema = z.object({
  url: z.url(),
  metadata: z.record(z.string(), z.any()),
  fields: z.array(z.string()).optional(),
  hash: z.string(),
});

/**
 * Deduplication options for API requests
 */
export const DeduplicationOptionsSchema = z.object({
  deduplicate: z.boolean().optional().default(false),
  deduplicationFields: z
    .array(z.string())
    .max(MAX_DEDUPLICATION_FIELDS)
    .optional(),
  enhancedCanonical: z.boolean().optional().default(false),
});

// ================================
// VALIDATION FUNCTIONS
// ================================

/**
 * Validate deduplication fields array
 */
export const DeduplicationFieldsSchema = z
  .array(z.string().min(1))
  .min(1)
  .max(MAX_DEDUPLICATION_FIELDS)
  .refine(fields => fields.every(field => field.trim().length > 0), {
    message: "All deduplication fields must be non-empty strings",
  });

// ================================
// TYPE EXPORTS
// ================================

export type DeduplicationContext = z.infer<typeof DeduplicationContextSchema>;
export type DeduplicationOptions = z.infer<typeof DeduplicationOptionsSchema>;
export type DeduplicationFields = z.infer<typeof DeduplicationFieldsSchema>;

// Export field names as union type for better TypeScript support
export type DefaultDeduplicationField =
  (typeof DEFAULT_DEDUPLICATION_FIELDS)[number];
