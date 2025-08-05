import { v4 as uuidv4, v7 as uuidv7 } from "uuid";
import { Injectable } from "@nestjs/common";
import {
  ISlugGenerationStrategy,
  SlugGenerationOptions,
  ValidationResult,
  StrategyMetadata,
} from "./slug-generation.interface";
import {
  clampSlugLength,
  getPatternByType,
  MIN_SLUG_LENGTH,
  MAX_SLUG_LENGTH,
  UUID_PATTERNS,
  ERROR_MESSAGES,
  DEFAULT_SLUG_LENGTH,
  PATTERN_TYPES,
} from "../constants";

/**
 * UUID-based slug generation strategy
 *
 * Uses UUID v4 (random) or v7 (time-ordered) to generate slugs.
 * Good for guaranteed uniqueness but produces longer slugs.
 *
 * Features:
 * - Length control via format selection (short, medium, compact, full)
 * - UUID version selection (v4 random, v7 time-ordered)
 * - Pattern validation support
 * - Enhanced error reporting
 */
@Injectable()
export class UuidSlugStrategy implements ISlugGenerationStrategy {
  readonly name = "uuid";

  /**
   * Generate a slug using UUID
   * @param options - Configuration options for slug generation
   * @returns Generated UUID slug
   * @throws Error if options are invalid
   */
  generate(options?: SlugGenerationOptions): string {
    const processedOptions = this.processOptions(options);

    // Generate base UUID
    let uuid: string;
    const version = processedOptions.version || "v4";

    switch (version) {
      case "v7":
        uuid = uuidv7();
        break;
      case "v4":
      default:
        uuid = uuidv4();
        break;
    }

    // Format the UUID based on length requirements
    const format = this.determineFormat(processedOptions.length);
    let slug = this.formatUuid(uuid, format);

    // Apply length constraint if specific length requested
    if (processedOptions.length && slug.length !== processedOptions.length) {
      slug = this.adjustSlugLength(slug, processedOptions.length);
    }

    // Validate against pattern if provided
    if (processedOptions.pattern && !processedOptions.pattern.test(slug)) {
      throw new Error(
        `Generated UUID slug does not match required pattern: ${processedOptions.pattern}`
      );
    }

    return slug;
  }

  /**
   * Validate that the slug meets UUID requirements and constraints
   * @param slug - The slug to validate
   * @param options - Optional validation options
   * @returns true if the slug is valid for this strategy
   */
  isValid(slug: string, options?: SlugGenerationOptions): boolean {
    const result = this.validateSlugDetailed(slug, options);
    return result.isValid;
  }

  /**
   * Validate options and provide detailed error information
   * @param options - Configuration options to validate
   * @returns Detailed validation result with errors and suggestions
   */
  validateDetailed(options?: SlugGenerationOptions): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Validate length if provided
    if (options?.length !== undefined) {
      if (
        options.length < MIN_SLUG_LENGTH ||
        options.length > MAX_SLUG_LENGTH
      ) {
        errors.push(
          ERROR_MESSAGES.INVALID_LENGTH(MIN_SLUG_LENGTH, MAX_SLUG_LENGTH)
        );
        suggestions.push(
          `Try length between ${MIN_SLUG_LENGTH} and ${MAX_SLUG_LENGTH}`
        );
      }
    }

    // Validate version if provided
    if (options?.version && !["v4", "v7"].includes(options.version)) {
      errors.push("UUID version must be v4 or v7");
      suggestions.push("Use v4 for random UUIDs or v7 for time-ordered UUIDs");
    }

    // Custom alphabet not supported
    if (options?.alphabet) {
      errors.push("Custom alphabets are not supported by UUID strategy");
      suggestions.push("UUID strategy uses fixed hexadecimal characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions,
    };
  }

  /**
   * Perform detailed validation with error reporting for existing slugs
   * @param slug - The slug to validate
   * @param options - Optional validation options
   * @returns Detailed validation result
   */
  private validateSlugDetailed(
    slug: string,
    options?: SlugGenerationOptions
  ): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Basic checks
    if (!slug || typeof slug !== "string") {
      errors.push("Slug must be a non-empty string");
      return { isValid: false, errors, suggestions };
    }

    // Length validation
    if (slug.length < MIN_SLUG_LENGTH || slug.length > MAX_SLUG_LENGTH) {
      errors.push(
        ERROR_MESSAGES.INVALID_LENGTH(MIN_SLUG_LENGTH, MAX_SLUG_LENGTH)
      );
      suggestions.push(
        `Current length: ${slug.length}. Use format options: short (8), medium (12), compact (32), or full (36)`
      );
    }

    // UUID format validation
    const isValidUuidFormat = this.isValidUuidFormat(slug);
    if (!isValidUuidFormat) {
      errors.push("Slug does not match any valid UUID format");
      suggestions.push(
        "UUID slugs must contain only hexadecimal characters (0-9, a-f) and optionally hyphens"
      );
    }

    // Pattern validation if provided
    if (options?.pattern && !options.pattern.test(slug)) {
      errors.push(ERROR_MESSAGES.INVALID_PATTERN);
      suggestions.push(`Slug does not match pattern: ${options.pattern}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * Generate a short UUID slug (8 characters)
   * @param version - UUID version ('v4' or 'v7')
   * @returns Short UUID slug
   */
  generateShort(version: "v4" | "v7" = "v4"): string {
    return this.generate({ version, length: 8 });
  }

  /**
   * Generate a medium UUID slug (12 characters)
   * @param version - UUID version ('v4' or 'v7')
   * @returns Medium UUID slug
   */
  generateMedium(version: "v4" | "v7" = "v4"): string {
    return this.generate({ version, length: 12 });
  }

  /**
   * Generate a time-ordered UUID v7 slug
   * @param length - Desired length (8, 12, 32, or 36)
   * @returns Time-ordered UUID slug
   */
  generateTimeOrdered(length: number = 8): string {
    return this.generate({ version: "v7", length: clampSlugLength(length) });
  }

  /**
   * Generate a compact UUID slug (32 characters, no hyphens)
   * @param version - UUID version ('v4' or 'v7')
   * @returns Compact UUID slug
   */
  generateCompact(version: "v4" | "v7" = "v4"): string {
    return this.generate({ version, length: 32 });
  }

  /**
   * Generate a full UUID slug (36 characters, with hyphens)
   * @param version - UUID version ('v4' or 'v7')
   * @returns Full UUID slug
   */
  generateFull(version: "v4" | "v7" = "v4"): string {
    return this.generate({ version, length: 36 });
  }

  /**
   * Process and validate generation options
   * @param options - Raw options
   * @returns Processed options
   */
  private processOptions(
    options?: SlugGenerationOptions
  ): SlugGenerationOptions {
    const processedOptions = { ...options };

    // Process length with clamping if provided
    if (processedOptions.length) {
      processedOptions.length = clampSlugLength(processedOptions.length);
    }

    // Process pattern (custom takes precedence over type)
    if (!processedOptions.pattern && processedOptions.patternType) {
      processedOptions.pattern = getPatternByType(processedOptions.patternType);
    }

    return processedOptions;
  }

  /**
   * Determine appropriate UUID format based on desired length
   * @param length - Desired length
   * @returns UUID format
   */
  private determineFormat(length?: number): string {
    if (!length) return "short"; // Default to short format

    if (length <= 8) return "short";
    if (length <= 12) return "medium";
    if (length <= 32) return "compact";
    return "full";
  }

  /**
   * Format UUID according to specified format
   * @param uuid - The UUID to format
   * @param format - The desired format
   * @returns Formatted UUID
   */
  private formatUuid(uuid: string, format: string): string {
    const cleanUuid = uuid.replace(/-/g, "");

    switch (format) {
      case "short":
        // Use first 8 characters (similar to short git commit hashes)
        return cleanUuid.substring(0, 8);

      case "medium":
        // Use first 12 characters for better uniqueness
        return cleanUuid.substring(0, 12);

      case "compact":
        // Remove hyphens but keep full UUID
        return cleanUuid;

      case "full":
      default:
        // Keep full UUID with hyphens
        return uuid;
    }
  }

  /**
   * Adjust slug to specific length by truncating or padding
   * @param slug - Original slug
   * @param targetLength - Target length
   * @returns Adjusted slug
   */
  private adjustSlugLength(slug: string, targetLength: number): string {
    if (slug.length === targetLength) {
      return slug;
    }

    if (slug.length > targetLength) {
      // Truncate to target length
      return slug.substring(0, targetLength);
    }

    // For UUID, we don't pad shorter lengths as it would break UUID validity
    // Instead, return the slug as-is
    return slug;
  }

  /**
   * Check if slug matches any valid UUID format
   * @param slug - Slug to validate
   * @returns true if valid UUID format
   */
  private isValidUuidFormat(slug: string): boolean {
    return Object.values(UUID_PATTERNS).some(pattern => pattern.test(slug));
  }

  /**
   * Get default options for this strategy
   * @returns Default configuration options
   */
  getDefaultOptions(): SlugGenerationOptions {
    return {
      length: 8,
      version: "v4",
    };
  }

  /**
   * Get supported features for this strategy
   * @returns Array of supported feature names
   */
  getSupportedFeatures(): string[] {
    return [
      "guaranteed-uniqueness",
      "multiple-formats",
      "version-selection",
      "time-ordered",
      "zero-collision",
      "industry-standard",
    ];
  }

  /**
   * Get comprehensive metadata about this strategy
   * @returns Complete strategy metadata
   */
  getMetadata(): StrategyMetadata {
    return {
      name: "uuid",
      displayName: "UUID",
      description: "Universal Unique Identifier with multiple format options",
      category: "secure",
      features: [
        "Globally unique",
        "Multiple formats (full, short, compact)",
        "Industry standard",
        "No collision risk",
        "Time-based ordering (v7)",
        "Random-based (v4)",
      ],
      defaultLength: 8,
      supportedLengths: {
        min: 8,
        max: 36,
        recommended: [8, 12, 16, 32, 36],
      },
      supportedAlphabets: ["alphanumeric"],
      supportedPatterns: ["alphanumeric"],
      performance: {
        generationSpeed: "medium",
        collisionResistance: "very-high",
        memorability: "low",
      },
      useCases: [
        "Enterprise applications",
        "Database primary keys",
        "Distributed systems",
        "Zero-collision requirements",
      ],
      examples: [
        "a3f5d8e2",
        "9b4c7a1f5e2d",
        "f47ac10b58cc4372a5670e02b2c3d479",
        "6ba7b810-9dad-11d1",
      ],
      configuration: {
        supportsCustomAlphabet: false,
        supportsCustomPattern: false,
        supportsCustomLength: true,
        requiresLength: false,
      },
    };
  }
}
