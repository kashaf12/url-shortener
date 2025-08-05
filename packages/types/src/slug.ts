import { z } from "zod";

// ================================
// SLUG STRATEGY TYPES
// ================================

/**
 * Strategy performance characteristics
 */
export const StrategyPerformanceSchema = z.object({
  generationSpeed: z.enum(["fast", "medium", "slow"]),
  collisionResistance: z.enum(["low", "medium", "high", "very-high"]),
  memorability: z.enum(["low", "medium", "high"]),
});

/**
 * Strategy configuration capabilities
 */
export const StrategyConfigurationSchema = z.object({
  supportsCustomAlphabet: z.boolean(),
  supportsCustomPattern: z.boolean(),
  supportsCustomLength: z.boolean(),
  requiresLength: z.boolean(),
});

/**
 * Strategy supported lengths
 */
export const StrategySupportedLengthsSchema = z.object({
  min: z.number().int().min(1),
  max: z.number().int().max(50),
  recommended: z.array(z.number().int().min(1).max(50)),
});

/**
 * Complete strategy metadata for API responses
 */
export const StrategyMetadataSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(["secure", "readable", "compact", "custom"]),
  features: z.array(z.string()),
  defaultLength: z.number().int().min(1).max(50),
  supportedLengths: StrategySupportedLengthsSchema,
  supportedAlphabets: z.array(z.string()),
  supportedPatterns: z.array(z.string()),
  performance: StrategyPerformanceSchema,
  useCases: z.array(z.string()),
  examples: z.array(z.string()),
  configuration: StrategyConfigurationSchema,
});

/**
 * Strategy discovery API response
 */
export const StrategyDiscoveryResponseSchema = z.object({
  strategies: z.array(StrategyMetadataSchema),
  defaultStrategy: z.string(),
  configuration: z.object({
    minLength: z.number().int().min(1),
    maxLength: z.number().int().max(50),
    defaultLength: z.number().int().min(1).max(50),
    maxCollisionRetries: z.number().int().min(1),
    supportedAlphabetTypes: z.array(z.string()),
    supportedPatternTypes: z.array(z.string()),
  }),
  usage: z
    .object({
      totalSlugsGenerated: z.number().int().min(0).optional(),
      popularStrategies: z
        .array(
          z.object({
            strategy: z.string(),
            count: z.number().int().min(0),
            percentage: z.number().min(0).max(100),
          })
        )
        .optional(),
    })
    .optional(),
});

// ================================
// VALIDATION TYPES
// ================================

/**
 * Custom slug validation result
 */
export const CustomSlugValidationResultSchema = z.object({
  isValid: z.boolean(),
  slug: z.string(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  suggestions: z.array(z.string()),
  normalizedSlug: z.string().optional(),
});

/**
 * Space usage information - enhanced version of what's in api.ts
 */
export const SpaceInfoSchema = z.object({
  strategy: z.string(),
  alphabet: z.string(),
  alphabetHash: z.string(),
  length: z.number().int().min(1),
  namespace: z.string().optional(),
  totalSpace: z.number().int().min(0),
  usedSpace: z.number().int().min(0),
  remainingSpace: z.number().int().min(0),
  usagePercentage: z.number().min(0).max(1),
  status: z.enum(["safe", "warning", "critical", "exhausted"]),
});

/**
 * Space validation result
 */
export const SpaceValidationResultSchema = z.object({
  isValid: z.boolean(),
  canGenerate: z.boolean(),
  spaceInfo: SpaceInfoSchema,
  warnings: z.array(z.string()),
  recommendations: z.array(z.string()),
});

/**
 * Space usage statistics for monitoring
 */
export const SpaceUsageStatsSchema = z.object({
  strategy: z.string(),
  alphabetHash: z.string(),
  length: z.number().int().min(1),
  namespace: z.string().optional(),
  totalConfigurations: z.number().int().min(0),
  averageUsage: z.number().min(0).max(1),
  maxUsage: z.number().min(0).max(1),
  warningCount: z.number().int().min(0),
  criticalCount: z.number().int().min(0),
  exhaustedCount: z.number().int().min(0),
});

// ================================
// CONSTANTS
// ================================

/**
 * Slug length constraints
 */
export const SLUG_LENGTH_CONSTRAINTS = {
  MIN: 4,
  MAX: 21,
  DEFAULT: 7,
} as const;

/**
 * Maximum collision retries
 */
export const MAX_COLLISION_RETRIES = 5;

/**
 * Available alphabet types
 */
export const ALPHABET_TYPES = {
  alphanumeric:
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  urlSafe: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_",
  readable: "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz",
} as const;

/**
 * Validation patterns
 */
export const VALIDATION_PATTERNS = {
  alphanumeric: /^[A-Za-z0-9]+$/,
  urlSafe: /^[A-Za-z0-9_-]+$/,
  readable: /^[23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz]+$/,
} as const;

// ================================
// TYPE EXPORTS
// ================================

export type StrategyPerformance = z.infer<typeof StrategyPerformanceSchema>;
export type StrategyConfiguration = z.infer<typeof StrategyConfigurationSchema>;
export type StrategySupportedLengths = z.infer<
  typeof StrategySupportedLengthsSchema
>;
export type StrategyMetadata = z.infer<typeof StrategyMetadataSchema>;
export type StrategyDiscoveryResponse = z.infer<
  typeof StrategyDiscoveryResponseSchema
>;

export type CustomSlugValidationResult = z.infer<
  typeof CustomSlugValidationResultSchema
>;
export type SpaceInfo = z.infer<typeof SpaceInfoSchema>;
export type SpaceValidationResult = z.infer<typeof SpaceValidationResultSchema>;
export type SpaceUsageStats = z.infer<typeof SpaceUsageStatsSchema>;

// Alphabet and Pattern type aliases for backward compatibility
export type AlphabetTypeName = keyof typeof ALPHABET_TYPES;
export type PatternTypeName = keyof typeof VALIDATION_PATTERNS;
