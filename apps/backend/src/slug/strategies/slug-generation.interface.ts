/**
 * Strategy metadata interface for comprehensive strategy information
 */
export interface StrategyMetadata {
  name: string;
  displayName: string;
  description: string;
  category: "secure" | "readable" | "compact" | "custom";
  features: string[];
  defaultLength: number;
  supportedLengths: {
    min: number;
    max: number;
    recommended: number[];
  };
  supportedAlphabets: string[];
  supportedPatterns: string[];
  performance: {
    generationSpeed: "fast" | "medium" | "slow";
    collisionResistance: "low" | "medium" | "high" | "very-high";
    memorability: "low" | "medium" | "high";
  };
  useCases: string[];
  examples: string[];
  configuration: {
    supportsCustomAlphabet: boolean;
    supportsCustomPattern: boolean;
    supportsCustomLength: boolean;
    requiresLength: boolean;
  };
}

/**
 * Interface for slug generation strategies
 *
 * This interface defines the contract that all slug generation strategies must implement.
 * Each strategy provides a unique way to generate URL slugs with configurable options.
 */
export interface ISlugGenerationStrategy {
  /**
   * The unique identifier for this strategy
   */
  readonly name: string;

  /**
   * Generate a slug using this strategy
   * @param options - Configuration options for slug generation
   * @returns Generated slug string
   */
  generate(options?: SlugGenerationOptions): string;

  /**
   * Validate that the generated slug meets the strategy's requirements
   * @param slug - The slug to validate
   * @param options - Optional validation options
   * @returns true if the slug is valid for this strategy
   */
  isValid(slug: string, options?: SlugGenerationOptions): boolean;

  /**
   * Validate options and provide detailed error information
   * @param options - Configuration options to validate
   * @returns Detailed validation result with errors and suggestions
   */
  validateDetailed(options?: SlugGenerationOptions): ValidationResult;

  /**
   * Get default options for this strategy
   * @returns Default configuration options
   */
  getDefaultOptions(): SlugGenerationOptions;

  /**
   * Get supported features for this strategy
   * @returns Array of supported feature names
   */
  getSupportedFeatures(): string[];

  /**
   * Get comprehensive metadata about this strategy
   * @returns Complete strategy metadata
   */
  getMetadata(): StrategyMetadata;
}

/**
 * Configuration options for slug generation
 */
export interface SlugGenerationOptions {
  /**
   * Length of the generated slug (will be clamped to min/max constraints)
   */
  length?: number;

  /**
   * Custom alphabet or character set (if supported by strategy)
   * Takes precedence over alphabetType if both are provided
   */
  alphabet?: string;

  /**
   * Predefined alphabet type for easy selection
   * Options: 'alphanumeric', 'urlSafe', 'readable'
   */
  alphabetType?: "alphanumeric" | "urlSafe" | "readable";

  /**
   * Regex pattern that the generated slug must match
   * Used for validation after generation
   */
  pattern?: RegExp;

  /**
   * Predefined pattern type for easy selection
   * Options: 'alphanumeric', 'urlSafe', 'readable'
   */
  patternType?: "alphanumeric" | "urlSafe" | "readable";

  /**
   * Metadata associated with the URL for deduplication purposes
   */
  metadata?: Record<string, any>;

  /**
   * Whether to enable deduplication based on URL + metadata hash
   * If true, will return existing slug for same URL+metadata combination
   */
  deduplicate?: boolean;

  /**
   * Specific metadata fields to include in deduplication hash
   * If not provided, uses all metadata fields
   */
  deduplicationFields?: string[];

  /**
   * Strategy name override (for factory usage)
   */
  slugStrategy?: string;

  /**
   * Additional strategy-specific options
   */
  [key: string]: any;
}

/**
 * Supported slug generation strategy types
 */
export type SlugGenerationStrategyType = "nanoid" | "uuid" | "custom";

/**
 * Result of slug generation with metadata
 */
export interface SlugGenerationResult {
  slug: string;
  strategy: string;
  length: number;
  alphabet?: string;
  pattern?: RegExp;
  wasDeduped?: boolean;
  generatedAt: Date;
}

/**
 * Deduplication context for URL + metadata hashing
 */
export interface DeduplicationContext {
  url: string;
  metadata: Record<string, any>;
  fields?: string[];
  hash: string;
}

/**
 * Enhanced validation result with detailed feedback
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions?: string[];
}

/**
 * Collision retry context for adaptive strategies
 */
export interface CollisionRetryContext {
  attempt: number;
  maxAttempts: number;
  currentLength: number;
  strategy: string;
  lastError?: string;
}
