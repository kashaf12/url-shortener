import { nanoid, customAlphabet } from "nanoid";
import { Injectable } from "@nestjs/common";
import {
  ISlugGenerationStrategy,
  SlugGenerationOptions,
  ValidationResult,
  StrategyMetadata,
} from "./slug-generation.interface";
import {
  clampSlugLength,
  getAlphabetByType,
  getPatternByType,
  isValidAlphabet,
  MIN_SLUG_LENGTH,
  MAX_SLUG_LENGTH,
  DEFAULT_SLUG_LENGTH,
  NANOID_DEFAULT_ALPHABET,
  URL_SAFE_PATTERN,
  ERROR_MESSAGES,
  ALPHABET_TYPES,
  PATTERN_TYPES,
} from "../constants";

/**
 * Nanoid-based slug generation strategy
 *
 * Uses the nanoid library to generate URL-safe, unique identifiers.
 * This is the recommended default strategy due to its performance and collision resistance.
 *
 * Features:
 * - Length validation with min/max clamping
 * - Predefined alphabet types (alphanumeric, urlSafe, readable)
 * - Custom alphabet support with validation
 * - Pattern validation after generation
 * - Enhanced error reporting with suggestions
 */
@Injectable()
export class NanoidSlugStrategy implements ISlugGenerationStrategy {
  readonly name = "nanoid";

  /**
   * Generate a slug using nanoid
   * @param options - Configuration options for slug generation
   * @returns Generated nanoid slug
   * @throws Error if options are invalid
   */
  generate(options?: SlugGenerationOptions): string {
    const processedOptions = this.processOptions(options);

    // Generate the slug
    let slug: string;

    if (processedOptions.alphabet) {
      // Use custom alphabet
      const customNanoid = customAlphabet(
        processedOptions.alphabet,
        processedOptions.length
      );
      slug = customNanoid();
    } else {
      // Use default nanoid
      slug = nanoid(processedOptions.length);
    }

    // Validate against pattern if provided
    if (processedOptions.pattern && !processedOptions.pattern.test(slug)) {
      // If pattern doesn't match, try generating again with appropriate alphabet
      const fallbackAlphabet = this.getPatternCompatibleAlphabet(
        processedOptions.pattern
      );
      if (fallbackAlphabet) {
        const fallbackNanoid = customAlphabet(
          fallbackAlphabet,
          processedOptions.length
        );
        slug = fallbackNanoid();

        // If still doesn't match, throw error
        if (!processedOptions.pattern.test(slug)) {
          throw new Error(
            `Unable to generate slug matching pattern: ${processedOptions.pattern}`
          );
        }
      } else {
        throw new Error(
          `Generated slug does not match required pattern: ${processedOptions.pattern}`
        );
      }
    }

    return slug;
  }

  /**
   * Validate that the slug meets nanoid requirements and any additional constraints
   * @param slug - The slug to validate
   * @param options - Optional validation options
   * @returns true if the slug is valid for this strategy
   */
  isValid(slug: string, options?: SlugGenerationOptions): boolean {
    const result = this.validateSlugDetailed(slug, options);
    return result.isValid;
  }

  /**
   * Perform detailed validation with error reporting
   * @param slug - The slug to validate
   * @param options - Optional validation options
   * @returns Detailed validation result
   */
  validateDetailed(options?: SlugGenerationOptions): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Basic options validation
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

    // Custom alphabet validation
    if (options?.alphabet && !isValidAlphabet(options.alphabet)) {
      errors.push(ERROR_MESSAGES.INVALID_ALPHABET);
      suggestions.push("Ensure alphabet has at least 2 unique characters");
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
        `Current length: ${slug.length}. Adjust to be between ${MIN_SLUG_LENGTH} and ${MAX_SLUG_LENGTH}`
      );
    }

    // Pattern validation if provided
    const pattern =
      options?.pattern ||
      (options?.patternType
        ? getPatternByType(options.patternType)
        : URL_SAFE_PATTERN);
    if (!pattern.test(slug)) {
      errors.push(ERROR_MESSAGES.INVALID_PATTERN);
      suggestions.push(
        `Slug contains invalid characters for pattern: ${pattern}`
      );
    }

    // Alphabet validation if custom alphabet provided
    if (
      options?.alphabet &&
      !this.isSlugCompatibleWithAlphabet(slug, options.alphabet)
    ) {
      errors.push("Slug contains characters not in the specified alphabet");
      suggestions.push(`Allowed characters: ${options.alphabet}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * Generate a slug with enhanced security (longer length)
   * @param length - Desired length (default: 11)
   * @returns Secure nanoid slug
   */
  generateSecure(length: number = 11): string {
    return this.generate({ length: clampSlugLength(length) });
  }

  /**
   * Generate a slug optimized for readability
   * @param length - Desired length (default: 8)
   * @returns Readable nanoid slug
   */
  generateReadable(length: number = 8): string {
    return this.generate({
      alphabetType: "readable",
      length: clampSlugLength(length),
    });
  }

  /**
   * Generate a slug with custom alphabet
   * @param alphabet - Custom alphabet string
   * @param length - Desired length
   * @returns Custom alphabet slug
   */
  generateCustom(
    alphabet: string,
    length: number = DEFAULT_SLUG_LENGTH
  ): string {
    return this.generate({
      alphabet,
      length: clampSlugLength(length),
    });
  }

  /**
   * Process and validate generation options
   * @param options - Raw options
   * @returns Processed and validated options
   */
  private processOptions(
    options?: SlugGenerationOptions
  ): Required<Pick<SlugGenerationOptions, "length">> & SlugGenerationOptions {
    const processedOptions = { ...options };

    // Process length with clamping
    const requestedLength = options?.length || DEFAULT_SLUG_LENGTH;
    processedOptions.length = clampSlugLength(requestedLength);

    // Process alphabet (custom takes precedence over type)
    if (!processedOptions.alphabet && processedOptions.alphabetType) {
      processedOptions.alphabet = getAlphabetByType(
        processedOptions.alphabetType
      );
    }

    // Process pattern (custom takes precedence over type)
    if (!processedOptions.pattern && processedOptions.patternType) {
      processedOptions.pattern = getPatternByType(processedOptions.patternType);
    }

    // Validate custom alphabet if provided
    if (
      processedOptions.alphabet &&
      !isValidAlphabet(processedOptions.alphabet)
    ) {
      throw new Error(ERROR_MESSAGES.INVALID_ALPHABET);
    }

    return processedOptions as Required<Pick<SlugGenerationOptions, "length">> &
      SlugGenerationOptions;
  }

  /**
   * Get alphabet that's compatible with a given pattern
   * @param pattern - Regex pattern
   * @returns Compatible alphabet or null if none found
   */
  private getPatternCompatibleAlphabet(pattern: RegExp): string | null {
    // Test common alphabets against the pattern
    const alphabets = [
      NANOID_DEFAULT_ALPHABET,
      getAlphabetByType("alphanumeric"),
      getAlphabetByType("readable"),
    ];

    for (const alphabet of alphabets) {
      // Test if a sample string from this alphabet matches the pattern
      const testChar = alphabet[0];
      if (pattern.test(testChar)) {
        // Filter alphabet to only include pattern-compatible characters
        return alphabet
          .split("")
          .filter(char => pattern.test(char))
          .join("");
      }
    }

    return null;
  }

  /**
   * Check if slug only contains characters from specified alphabet
   * @param slug - Slug to check
   * @param alphabet - Allowed alphabet
   * @returns true if compatible
   */
  private isSlugCompatibleWithAlphabet(
    slug: string,
    alphabet: string
  ): boolean {
    const alphabetSet = new Set(alphabet);
    return slug.split("").every(char => alphabetSet.has(char));
  }

  /**
   * Get default options for this strategy
   * @returns Default configuration options
   */
  getDefaultOptions(): SlugGenerationOptions {
    return {
      length: DEFAULT_SLUG_LENGTH,
      alphabetType: "urlSafe",
      patternType: "urlSafe",
    };
  }

  /**
   * Get supported features for this strategy
   * @returns Array of supported feature names
   */
  getSupportedFeatures(): string[] {
    return [
      "variable-length",
      "custom-alphabet",
      "pattern-validation",
      "high-collision-resistance",
      "url-safe",
      "fast-generation",
      "alphabet-types",
      "pattern-types",
    ];
  }

  /**
   * Get comprehensive metadata about this strategy
   * @returns Complete strategy metadata
   */
  getMetadata(): StrategyMetadata {
    return {
      name: "nanoid",
      displayName: "NanoID",
      description:
        "Fast, URL-safe, unique ID generator with customizable alphabet and length",
      category: "secure",
      features: [
        "URL-safe by default",
        "Cryptographically strong",
        "Customizable alphabet",
        "Variable length",
        "High collision resistance",
        "Fast generation",
      ],
      defaultLength: DEFAULT_SLUG_LENGTH,
      supportedLengths: {
        min: MIN_SLUG_LENGTH,
        max: MAX_SLUG_LENGTH,
        recommended: [6, 7, 8, 10, 12],
      },
      supportedAlphabets: Object.keys(ALPHABET_TYPES),
      supportedPatterns: Object.keys(PATTERN_TYPES),
      performance: {
        generationSpeed: "fast",
        collisionResistance: "very-high",
        memorability: "low",
      },
      useCases: [
        "General purpose URL shortening",
        "High-volume applications",
        "Security-conscious applications",
        "API endpoints",
      ],
      examples: ["2nYyNd6", "V1StGXR8_Z5jdHi6B-myT", "KpfBw", "rJf2vM9"],
      configuration: {
        supportsCustomAlphabet: true,
        supportsCustomPattern: true,
        supportsCustomLength: true,
        requiresLength: false,
      },
    };
  }
}
