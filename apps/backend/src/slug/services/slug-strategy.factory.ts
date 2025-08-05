import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ISlugGenerationStrategy,
  SlugGenerationOptions,
  ValidationResult,
  CollisionRetryContext,
  NanoidSlugStrategy,
  UuidSlugStrategy,
  DEFAULT_STRATEGY,
} from "../strategies";
import {
  clampSlugLength,
  getAlphabetByType,
  getPatternByType,
  isValidAlphabet,
  MIN_SLUG_LENGTH,
  MAX_SLUG_LENGTH,
  DEFAULT_SLUG_LENGTH,
  MAX_COLLISION_RETRIES,
  FALLBACK_STRATEGIES,
  ERROR_MESSAGES,
} from "../constants";
import {
  isValidDeduplicationFields,
  ERROR_MESSAGES as DEDUP_ERROR_MESSAGES,
} from "../../deduplication/constants";

/**
 * Enhanced factory service for creating and managing slug generation strategies
 *
 * This service handles:
 * - Strategy registration and retrieval
 * - Environment-based default strategy configuration
 * - Runtime strategy validation and selection
 * - Options preprocessing and validation
 * - Alphabet and pattern resolution
 * - Length validation and clamping
 * - Enhanced error reporting with suggestions
 */
@Injectable()
export class SlugStrategyFactory {
  private readonly strategies = new Map<string, ISlugGenerationStrategy>();
  private readonly defaultStrategy: string;
  private readonly availableStrategies: string[];
  private readonly defaultLength: number;
  private readonly minLength: number;
  private readonly maxLength: number;
  private readonly maxRetries: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly nanoidStrategy: NanoidSlugStrategy,
    private readonly uuidStrategy: UuidSlugStrategy
  ) {
    // Register available strategies
    this.registerStrategy(this.nanoidStrategy);
    this.registerStrategy(this.uuidStrategy);

    // Load configuration from environment
    this.defaultStrategy = this.configService.get<string>(
      "SLUG_GENERATION_STRATEGY",
      DEFAULT_STRATEGY
    );
    this.defaultLength = this.configService.get<number>(
      "DEFAULT_SLUG_LENGTH",
      DEFAULT_SLUG_LENGTH
    );
    this.minLength = this.configService.get<number>(
      "MIN_SLUG_LENGTH",
      MIN_SLUG_LENGTH
    );
    this.maxLength = this.configService.get<number>(
      "MAX_SLUG_LENGTH",
      MAX_SLUG_LENGTH
    );
    this.maxRetries = this.configService.get<number>(
      "MAX_COLLISION_RETRIES",
      MAX_COLLISION_RETRIES
    );

    // Get available strategies from environment or use all registered
    const envStrategies = this.configService.get<string>(
      "AVAILABLE_SLUG_STRATEGIES"
    );
    this.availableStrategies = envStrategies
      ? envStrategies.split(",").map(s => s.trim())
      : Array.from(this.strategies.keys());

    // Validate that default strategy is available
    if (!this.isStrategyAvailable(this.defaultStrategy)) {
      throw new Error(
        `Default slug generation strategy '${this.defaultStrategy}' is not available. Available strategies: ${this.availableStrategies.join(", ")}`
      );
    }
  }

  /**
   * Generate a slug with enhanced options processing and validation
   * @param strategyName - Name of the strategy to use (optional)
   * @param options - Generation options
   * @returns Generated slug
   * @throws BadRequestException if options are invalid
   */
  generateSlug(strategyName?: string, options?: SlugGenerationOptions): string {
    const strategy = this.getStrategy(strategyName);
    const processedOptions = this.preprocessOptions(options);

    try {
      return strategy.generate(processedOptions);
    } catch (error) {
      throw new BadRequestException(
        `Slug generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Validate a slug with detailed error reporting
   * @param slug - The slug to validate
   * @param strategyName - Name of the strategy to validate against (optional)
   * @param options - Validation options (optional)
   * @returns Detailed validation result
   */
  validateSlugDetailed(
    slug: string,
    strategyName?: string,
    options?: SlugGenerationOptions
  ): ValidationResult {
    try {
      const strategy = this.getStrategy(strategyName);
      const processedOptions = this.preprocessOptions(options);

      if (
        "validateDetailed" in strategy &&
        typeof strategy.validateDetailed === "function"
      ) {
        return (strategy as any).validateDetailed(slug, processedOptions);
      }

      // Fallback to basic validation
      const isValid = strategy.isValid(slug, processedOptions);
      return {
        isValid,
        errors: isValid ? [] : ["Slug failed basic validation"],
        suggestions: isValid
          ? undefined
          : ["Check slug format and constraints"],
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : String(error)],
        suggestions: ["Verify strategy name and options"],
      };
    }
  }

  /**
   * Validate a slug (simple boolean result)
   * @param slug - The slug to validate
   * @param strategyName - Name of the strategy to validate against
   * @param options - Validation options
   * @returns true if the slug is valid for the strategy
   */
  validateSlug(
    slug: string,
    strategyName?: string,
    options?: SlugGenerationOptions
  ): boolean {
    const result = this.validateSlugDetailed(slug, strategyName, options);
    return result.isValid;
  }

  /**
   * Get collision retry context for adaptive retry strategies
   * @param attempt - Current attempt number
   * @param strategy - Current strategy name
   * @param currentLength - Current slug length
   * @param lastError - Last error encountered
   * @returns Collision retry context
   */
  getCollisionRetryContext(
    attempt: number,
    strategy: string,
    currentLength: number,
    lastError?: string
  ): CollisionRetryContext {
    return {
      attempt,
      maxAttempts: this.maxRetries,
      currentLength,
      strategy,
      lastError,
    };
  }

  /**
   * Get suggested next strategy for collision resolution
   * @param currentStrategy - Current strategy that's failing
   * @param attempt - Current attempt number
   * @returns Suggested strategy name or null if none available
   */
  getSuggestedStrategy(
    currentStrategy: string,
    attempt: number
  ): string | null {
    if (attempt < this.maxRetries - 1) {
      return null; // Keep trying current strategy
    }

    // Suggest fallback strategies
    const fallbacks = FALLBACK_STRATEGIES.filter(
      s => s !== currentStrategy && this.isStrategyAvailable(s)
    );

    return fallbacks.length > 0 ? fallbacks[0] : null;
  }

  /**
   * Get suggested length increase for collision resolution
   * @param currentLength - Current slug length
   * @param attempt - Current attempt number
   * @returns Suggested new length
   */
  getSuggestedLength(currentLength: number, attempt: number): number {
    const increment = Math.min(attempt, 3); // Max increment of 3
    const newLength = currentLength + increment;
    return clampSlugLength(newLength, this.minLength, this.maxLength);
  }

  /**
   * Register a new slug generation strategy
   * @param strategy - The strategy to register
   */
  private registerStrategy(strategy: ISlugGenerationStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  /**
   * Get a strategy by name, falling back to default if not specified
   * @param strategyName - Name of the strategy to retrieve
   * @returns The requested strategy instance
   * @throws BadRequestException if strategy is not available
   */
  getStrategy(strategyName?: string): ISlugGenerationStrategy {
    const requestedStrategy = strategyName || this.defaultStrategy;

    // Validate strategy availability
    if (!this.isStrategyAvailable(requestedStrategy)) {
      throw new BadRequestException(
        ERROR_MESSAGES.INVALID_STRATEGY(
          requestedStrategy,
          this.availableStrategies
        )
      );
    }

    const strategy = this.strategies.get(requestedStrategy);
    if (!strategy) {
      throw new BadRequestException(
        `Slug generation strategy '${requestedStrategy}' is not registered.`
      );
    }

    return strategy;
  }

  /**
   * Check if a strategy is available for use
   * @param strategyName - Name of the strategy to check
   * @returns true if the strategy is available
   */
  isStrategyAvailable(strategyName: string): boolean {
    return (
      this.availableStrategies.includes(strategyName) &&
      this.strategies.has(strategyName)
    );
  }

  /**
   * Get the list of available strategy names
   * @returns Array of available strategy names
   */
  getAvailableStrategies(): string[] {
    return [...this.availableStrategies];
  }

  /**
   * Get the default strategy name
   * @returns The default strategy name
   */
  getDefaultStrategy(): string {
    return this.defaultStrategy;
  }

  /**
   * Get configuration limits
   * @returns Configuration object with limits
   */
  getConfiguration() {
    return {
      defaultStrategy: this.defaultStrategy,
      defaultLength: this.defaultLength,
      minLength: this.minLength,
      maxLength: this.maxLength,
      maxRetries: this.maxRetries,
      availableStrategies: [...this.availableStrategies],
    };
  }

  /**
   * Preprocess and validate generation options
   * @param options - Raw options
   * @returns Processed and validated options
   * @throws BadRequestException if options are invalid
   */
  private preprocessOptions(
    options?: SlugGenerationOptions
  ): SlugGenerationOptions {
    if (!options) {
      return { length: this.defaultLength };
    }

    const processed = { ...options };

    // Process and validate length
    if (processed.length !== undefined) {
      processed.length = clampSlugLength(
        processed.length,
        this.minLength,
        this.maxLength
      );
    } else {
      processed.length = this.defaultLength;
    }

    // Process alphabet (custom takes precedence over type)
    if (!processed.alphabet && processed.alphabetType) {
      try {
        processed.alphabet = getAlphabetByType(processed.alphabetType);
      } catch (error) {
        throw new BadRequestException(
          `Invalid alphabet type: ${processed.alphabetType}`
        );
      }
    }

    // Validate custom alphabet if provided
    if (processed.alphabet && !isValidAlphabet(processed.alphabet)) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_ALPHABET);
    }

    // Process pattern (custom takes precedence over type)
    if (!processed.pattern && processed.patternType) {
      try {
        processed.pattern = getPatternByType(processed.patternType);
      } catch (error) {
        throw new BadRequestException(
          `Invalid pattern type: ${processed.patternType}`
        );
      }
    }

    // Validate deduplication fields if provided
    if (
      processed.deduplicationFields &&
      !isValidDeduplicationFields(processed.deduplicationFields)
    ) {
      throw new BadRequestException(
        DEDUP_ERROR_MESSAGES.DEDUPLICATION_FIELDS_LIMIT(10)
      );
    }

    return processed;
  }
}
