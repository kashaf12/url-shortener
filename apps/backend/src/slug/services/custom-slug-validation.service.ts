import {
  Injectable,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  MIN_SLUG_LENGTH,
  MAX_SLUG_LENGTH,
  URL_SAFE_PATTERN,
  ALPHANUMERIC_PATTERN,
  READABLE_PATTERN,
  PATTERN_TYPES,
  getPatternByType,
  PatternType,
} from "../constants/slug-generation.constants";
import { SlugCollisionCheckerFn } from "../interfaces/slug-collision-checker.interface";
import { CustomSlugValidationResult } from "@url-shortener/types";

export interface CustomSlugValidationOptions {
  pattern?: RegExp;
  patternType?: PatternType;
  allowReservedWords?: boolean;
  autoNormalize?: boolean;
  namespace?: string;
}

/**
 * Service for validating and processing user-provided custom slugs
 *
 * This service provides:
 * - Comprehensive validation of custom slugs
 * - Collision detection with existing slugs
 * - Reserved word protection
 * - Pattern matching and normalization
 * - Suggestions for invalid slugs
 * - Namespace-aware validation
 */
@Injectable()
export class CustomSlugValidationService {
  private readonly reservedSlugs: Set<string>;

  constructor(private readonly configService: ConfigService) {
    // Initialize reserved slugs from configuration
    const reservedWords = this.configService.get<string>(
      "RESERVED_SLUGS",
      "api,admin,www,app,docs,health,status,metrics,dashboard"
    );
    this.reservedSlugs = new Set(
      reservedWords.split(",").map(word => word.trim().toLowerCase())
    );
  }

  /**
   * Validate a custom slug with comprehensive checks
   */
  async validateCustomSlug(
    slug: string,
    collisionChecker: SlugCollisionCheckerFn,
    options: CustomSlugValidationOptions = {}
  ): Promise<CustomSlugValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Normalize slug if requested
    const normalizedSlug = options.autoNormalize
      ? this.normalizeSlug(slug)
      : slug;
    const slugToValidate = normalizedSlug;

    // Basic validation
    this.validateBasicRequirements(slugToValidate, errors);

    // Length validation
    this.validateLength(slugToValidate, errors, suggestions);

    // Pattern validation
    this.validatePattern(slugToValidate, options, errors, suggestions);

    // Reserved word validation
    if (!options.allowReservedWords) {
      this.validateReservedWords(slugToValidate, errors, warnings, suggestions);
    }

    // Security validation
    this.validateSecurity(slugToValidate, errors, warnings);

    // Collision detection
    await this.validateCollision(
      slugToValidate,
      collisionChecker,
      options.namespace,
      errors,
      suggestions
    );

    // Generate additional suggestions if slug is invalid
    if (errors.length > 0) {
      const additionalSuggestions = await this.generateSlugSuggestions(
        slugToValidate,
        collisionChecker,
        options.namespace
      );
      suggestions.push(...additionalSuggestions);
    }

    return {
      isValid: errors.length === 0,
      slug: slugToValidate,
      errors,
      warnings,
      suggestions: [...new Set(suggestions)], // Remove duplicates
      normalizedSlug: options.autoNormalize ? normalizedSlug : undefined,
    };
  }

  /**
   * Check if a slug is available (not in use)
   */
  async isSlugAvailable(
    slug: string,
    collisionChecker: SlugCollisionCheckerFn,
    namespace?: string
  ): Promise<boolean> {
    const hasCollision = await collisionChecker(slug, namespace);
    return !hasCollision; // Return true if no collision (available)
  }

  /**
   * Get suggestions for alternative slugs
   */
  async generateSlugSuggestions(
    slug: string,
    collisionChecker: SlugCollisionCheckerFn,
    namespace?: string,
    count: number = 5
  ): Promise<string[]> {
    const suggestions: string[] = [];
    const baseSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "");

    // Strategy 1: Append numbers
    for (let i = 1; i <= count && suggestions.length < count; i++) {
      const candidate = `${baseSlug}-${i}`;
      if (await this.isSlugAvailable(candidate, collisionChecker, namespace)) {
        suggestions.push(candidate);
      }
    }

    // Strategy 2: Append random characters
    if (suggestions.length < count) {
      for (let i = 0; i < count - suggestions.length; i++) {
        const randomSuffix = Math.random().toString(36).substring(2, 5);
        const candidate = `${baseSlug}-${randomSuffix}`;
        if (
          await this.isSlugAvailable(candidate, collisionChecker, namespace)
        ) {
          suggestions.push(candidate);
        }
      }
    }

    // Strategy 3: Variations
    if (suggestions.length < count) {
      const variations = [
        `${baseSlug}-new`,
        `${baseSlug}-v2`,
        `my-${baseSlug}`,
        `${baseSlug}-link`,
        `${baseSlug}-url`,
      ];

      for (const variation of variations) {
        if (suggestions.length >= count) break;
        if (
          await this.isSlugAvailable(variation, collisionChecker, namespace)
        ) {
          suggestions.push(variation);
        }
      }
    }

    return suggestions;
  }

  /**
   * Normalize a slug to a valid format
   */
  normalizeSlug(slug: string): string {
    return (
      slug
        .toLowerCase()
        .trim()
        // Replace spaces and special characters with hyphens
        .replace(/[\s_]+/g, "-")
        // Remove non-URL-safe characters
        .replace(/[^a-z0-9-]/g, "")
        // Remove multiple consecutive hyphens
        .replace(/-+/g, "-")
        // Remove leading/trailing hyphens
        .replace(/^-+|-+$/g, "")
        // Ensure minimum length
        .substring(0, MAX_SLUG_LENGTH)
    );
  }

  /**
   * Get reserved slugs list
   */
  getReservedSlugs(): string[] {
    return Array.from(this.reservedSlugs);
  }

  /**
   * Add a reserved slug
   */
  addReservedSlug(slug: string): void {
    this.reservedSlugs.add(slug.toLowerCase());
  }

  /**
   * Remove a reserved slug
   */
  removeReservedSlug(slug: string): void {
    this.reservedSlugs.delete(slug.toLowerCase());
  }

  /**
   * Validate basic requirements
   */
  private validateBasicRequirements(slug: string, errors: string[]): void {
    if (!slug) {
      errors.push("Slug cannot be empty");
      return;
    }

    if (typeof slug !== "string") {
      errors.push("Slug must be a string");
      return;
    }

    if (slug.trim() !== slug) {
      errors.push("Slug cannot have leading or trailing whitespace");
    }
  }

  /**
   * Validate slug length
   */
  private validateLength(
    slug: string,
    errors: string[],
    suggestions: string[]
  ): void {
    if (slug.length < MIN_SLUG_LENGTH) {
      errors.push(`Slug must be at least ${MIN_SLUG_LENGTH} characters long`);
      if (slug.length > 0) {
        suggestions.push(
          `Consider using: ${slug.padEnd(MIN_SLUG_LENGTH, "0")}`
        );
      }
    }

    if (slug.length > MAX_SLUG_LENGTH) {
      errors.push(`Slug cannot be longer than ${MAX_SLUG_LENGTH} characters`);
      suggestions.push(`Consider using: ${slug.substring(0, MAX_SLUG_LENGTH)}`);
    }
  }

  /**
   * Validate slug pattern
   */
  private validatePattern(
    slug: string,
    options: CustomSlugValidationOptions,
    errors: string[],
    suggestions: string[]
  ): void {
    let pattern: RegExp;

    // Determine pattern to use
    if (options.pattern) {
      pattern = options.pattern;
    } else if (options.patternType) {
      pattern = getPatternByType(options.patternType);
    } else {
      // Default to URL-safe pattern
      pattern = URL_SAFE_PATTERN;
    }

    if (!pattern.test(slug)) {
      errors.push("Slug contains invalid characters");

      // Provide pattern-specific suggestions
      if (
        options.patternType === "alphanumeric" ||
        pattern === ALPHANUMERIC_PATTERN
      ) {
        suggestions.push("Only letters and numbers are allowed");
        suggestions.push(`Try: ${slug.replace(/[^a-zA-Z0-9]/g, "")}`);
      } else if (
        options.patternType === "readable" ||
        pattern === READABLE_PATTERN
      ) {
        suggestions.push(
          "Only readable characters are allowed (excludes 0, O, I, l, 1)"
        );
        suggestions.push(
          `Try: ${slug.replace(/[01OIl]/g, "").replace(/[^23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz]/g, "")}`
        );
      } else {
        suggestions.push(
          "Only letters, numbers, hyphens, and underscores are allowed"
        );
        suggestions.push(`Try: ${slug.replace(/[^a-zA-Z0-9_-]/g, "")}`);
      }
    }
  }

  /**
   * Validate against reserved words
   */
  private validateReservedWords(
    slug: string,
    errors: string[],
    warnings: string[],
    suggestions: string[]
  ): void {
    const lowerSlug = slug.toLowerCase();

    if (this.reservedSlugs.has(lowerSlug)) {
      errors.push(`'${slug}' is a reserved slug and cannot be used`);
      suggestions.push(`${slug}-link`, `${slug}-url`, `my-${slug}`);
    }

    // Check for variations of reserved words
    for (const reserved of this.reservedSlugs) {
      if (lowerSlug.includes(reserved) && lowerSlug !== reserved) {
        warnings.push(
          `Slug contains reserved word '${reserved}' which may cause confusion`
        );
      }
    }
  }

  /**
   * Validate security concerns
   */
  private validateSecurity(
    slug: string,
    errors: string[],
    warnings: string[]
  ): void {
    // Check for potential security issues
    const lowerSlug = slug.toLowerCase();

    // Directory traversal patterns
    if (
      lowerSlug.includes("..") ||
      lowerSlug.includes("./") ||
      lowerSlug.includes(".\\")
    ) {
      errors.push("Slug cannot contain directory traversal patterns");
    }

    // Suspicious patterns
    const suspiciousPatterns = [
      "script",
      "javascript",
      "vbscript",
      "onload",
      "onerror",
      "eval",
      "alert",
      "confirm",
      "prompt",
    ];

    for (const pattern of suspiciousPatterns) {
      if (lowerSlug.includes(pattern)) {
        warnings.push(
          `Slug contains potentially suspicious pattern: ${pattern}`
        );
      }
    }

    // Very short slugs that could be problematic
    if (slug.length <= 2 && /^[a-z]+$/.test(lowerSlug)) {
      warnings.push(
        "Very short slugs may conflict with common abbreviations or cause confusion"
      );
    }
  }

  /**
   * Validate collision with existing slugs
   */
  private async validateCollision(
    slug: string,
    collisionChecker: SlugCollisionCheckerFn,
    namespace: string | undefined,
    errors: string[],
    suggestions: string[]
  ): Promise<void> {
    const isAvailable = await this.isSlugAvailable(
      slug,
      collisionChecker,
      namespace
    );

    if (!isAvailable) {
      const namespaceInfo = namespace ? ` in namespace '${namespace}'` : "";
      errors.push(`Slug '${slug}' is already in use${namespaceInfo}`);

      // Generate collision-free suggestions
      const collisionSuggestions = await this.generateSlugSuggestions(
        slug,
        collisionChecker,
        namespace,
        3
      );
      suggestions.push(...collisionSuggestions);
    }
  }
}
