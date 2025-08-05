import { Injectable, BadRequestException, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { SlugStrategyFactory } from "./slug-strategy.factory";
import { SlugSpaceValidationService } from "./slug-space-validation.service";
import { CustomSlugValidationService } from "./custom-slug-validation.service";
import { SpaceValidationResult } from "@url-shortener/types";
import { SlugGenerationOptions } from "../strategies/slug-generation.interface";

export interface SlugGenerationResult {
  slug: string;
  spaceValidation?: SpaceValidationResult;
  wasCustomSlug: boolean;
  strategy?: string;
  length: number;
  namespace?: string;
}

export interface SlugGenerationRequest {
  customSlug?: string;
  slugStrategy?: string;
  length?: number;
  alphabet?: string;
  alphabetType?: "alphanumeric" | "urlSafe" | "readable";
  pattern?: string;
  patternType?: "alphanumeric" | "urlSafe" | "readable";
  namespace?: string;
  metadata?: Record<string, any>;
  deduplicate?: boolean;
  deduplicationFields?: string[];
  enhancedCanonical?: boolean;
}

/**
 * Central orchestration service for all slug generation operations.
 *
 * This service provides:
 * - Unified interface for slug generation and validation
 * - Custom slug processing with comprehensive validation
 * - Generated slug creation with collision detection
 * - Space validation and tracking coordination
 * - Strategy selection and configuration
 */
@Injectable()
export class SlugGenerationService {
  constructor(
    private readonly slugStrategyFactory: SlugStrategyFactory,
    private readonly slugSpaceValidationService: SlugSpaceValidationService,
    private readonly customSlugValidationService: CustomSlugValidationService,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger
  ) {}

  /**
   * Generate or validate a slug based on the request parameters
   */
  async generateSlug(
    request: SlugGenerationRequest,
    collisionCheckFn: (slug: string, namespace?: string) => Promise<boolean>
  ): Promise<SlugGenerationResult> {
    if (request.customSlug) {
      return this.processCustomSlug(request, collisionCheckFn);
    }

    return this.generateUniqueSlug(request, collisionCheckFn);
  }

  /**
   * Process and validate a custom slug
   */
  async processCustomSlug(
    request: SlugGenerationRequest,
    collisionCheckFn: (slug: string, namespace?: string) => Promise<boolean>
  ): Promise<SlugGenerationResult> {
    if (!request.customSlug) {
      throw new BadRequestException("Custom slug is required");
    }

    const validation =
      await this.customSlugValidationService.validateCustomSlug(
        request.customSlug,
        collisionCheckFn,
        {
          namespace: request.namespace,
          patternType: request.patternType,
          pattern: request.pattern ? new RegExp(request.pattern) : undefined,
          autoNormalize: true,
        }
      );

    if (!validation.isValid) {
      throw new BadRequestException({
        message: "Custom slug validation failed",
        errors: validation.errors,
        suggestions: validation.suggestions,
      });
    }

    return {
      slug: validation.slug,
      wasCustomSlug: true,
      length: validation.slug.length,
      namespace: request.namespace,
    };
  }

  /**
   * Generate a unique slug with space validation and collision detection
   */
  async generateUniqueSlug(
    request: SlugGenerationRequest,
    collisionCheckFn: (slug: string, namespace?: string) => Promise<boolean>
  ): Promise<SlugGenerationResult> {
    const options = this.buildSlugGenerationOptions(request);
    const strategy =
      request.slugStrategy ||
      this.configService.get<string>("SLUG_GENERATION_STRATEGY", "nanoid");
    const maxRetries = this.configService.get<number>(
      "MAX_COLLISION_RETRIES",
      5
    );

    // Validate slug space before generation
    const spaceValidation =
      await this.slugSpaceValidationService.validateSlugGeneration(
        strategy,
        options,
        request.namespace
      );

    // Check if space is exhausted
    if (!spaceValidation.canGenerate) {
      throw new BadRequestException({
        message: "Slug space is exhausted",
        spaceInfo: spaceValidation.spaceInfo,
        recommendations: spaceValidation.recommendations,
      });
    }

    // Log warnings for approaching exhaustion
    if (spaceValidation.warnings.length > 0) {
      this.logger.warn("Slug space approaching exhaustion", {
        strategy,
        spaceInfo: spaceValidation.spaceInfo,
        warnings: spaceValidation.warnings,
        recommendations: spaceValidation.recommendations,
      });
    }

    // Generate with collision detection
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const slug = this.slugStrategyFactory.generateSlug(strategy, options);

        // Check for collision using provided function
        const hasCollision = await collisionCheckFn(slug, request.namespace);

        if (!hasCollision) {
          this.logger.debug("Generated unique slug", {
            slug,
            strategy,
            attempt,
            namespace: request.namespace,
            spaceUsage: spaceValidation.spaceInfo.usagePercentage,
          });

          return {
            slug,
            spaceValidation,
            wasCustomSlug: false,
            strategy,
            length: slug.length,
            namespace: request.namespace,
          };
        }

        this.logger.warn("Slug collision detected, retrying", {
          slug,
          attempt,
          maxRetries,
          strategy,
          namespace: request.namespace,
        });

        // Adaptive retry: increase length on repeated collisions
        if (attempt > 2 && options.length && options.length < 12) {
          options.length = Math.min(options.length + 1, 12);
          this.logger.info("Increasing slug length due to collisions", {
            newLength: options.length,
            attempt,
          });
        }
      } catch (error) {
        this.logger.error("Error during slug generation", {
          attempt,
          strategy,
          error: error instanceof Error ? error.message : String(error),
        });

        if (attempt === maxRetries) {
          throw error;
        }
      }
    }

    throw new BadRequestException(
      `Failed to generate unique slug after ${maxRetries} attempts. ${spaceValidation.recommendations.join(" ")}`
    );
  }

  /**
   * Track the creation of a slug in the space validation system
   */
  async trackSlugCreation(
    strategy: string,
    options: SlugGenerationOptions,
    namespace?: string
  ): Promise<void> {
    try {
      await this.slugSpaceValidationService.trackSlugCreation(
        strategy,
        options,
        namespace
      );
    } catch (error) {
      this.logger.error("Failed to track slug creation", {
        strategy,
        namespace,
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - slug creation should succeed even if tracking fails
    }
  }

  /**
   * Get space validation information for a strategy and options
   */
  async getSpaceValidation(
    strategy: string,
    options: SlugGenerationOptions,
    namespace?: string
  ): Promise<SpaceValidationResult> {
    return this.slugSpaceValidationService.validateSlugGeneration(
      strategy,
      options,
      namespace
    );
  }

  /**
   * Get space usage statistics
   */
  async getSpaceUsageStats(strategy?: string) {
    return this.slugSpaceValidationService.getSpaceUsageStats(strategy);
  }

  /**
   * Get spaces that need attention (warning, critical, or exhausted)
   */
  async getSpacesNeedingAttention() {
    return this.slugSpaceValidationService.getSpacesNeedingAttention();
  }

  /**
   * Recalculate all space usage statistics
   */
  async recalculateAllSpaceUsage(): Promise<void> {
    return this.slugSpaceValidationService.recalculateAllSpaceUsage();
  }

  /**
   * Clean up old or unused space usage records
   */
  async cleanupSpaceUsage(daysOld: number = 30): Promise<number> {
    return this.slugSpaceValidationService.cleanupSpaceUsage(daysOld);
  }

  /**
   * Generate slug suggestions for custom slug validation failures
   */
  async generateSlugSuggestions(
    slug: string,
    collisionCheckFn: (slug: string, namespace?: string) => Promise<boolean>,
    namespace?: string,
    count: number = 5
  ): Promise<string[]> {
    return this.customSlugValidationService.generateSlugSuggestions(
      slug,
      collisionCheckFn,
      namespace,
      count
    );
  }

  /**
   * Check if a slug is available
   */
  async isSlugAvailable(
    slug: string,
    collisionCheckFn: (slug: string, namespace?: string) => Promise<boolean>,
    namespace?: string
  ): Promise<boolean> {
    return this.customSlugValidationService.isSlugAvailable(
      slug,
      collisionCheckFn,
      namespace
    );
  }

  /**
   * Get reserved slugs list
   */
  getReservedSlugs(): string[] {
    return this.customSlugValidationService.getReservedSlugs();
  }

  /**
   * Add a reserved slug
   */
  addReservedSlug(slug: string): void {
    this.customSlugValidationService.addReservedSlug(slug);
  }

  /**
   * Remove a reserved slug
   */
  removeReservedSlug(slug: string): void {
    this.customSlugValidationService.removeReservedSlug(slug);
  }

  /**
   * Build slug generation options from request
   */
  private buildSlugGenerationOptions(
    request: SlugGenerationRequest
  ): SlugGenerationOptions {
    return {
      length: request.length,
      alphabet: request.alphabet,
      alphabetType: request.alphabetType,
      pattern: request.pattern ? new RegExp(request.pattern) : undefined,
      patternType: request.patternType,
      metadata: request.metadata,
      deduplicate: request.deduplicate,
      deduplicationFields: request.deduplicationFields,
    };
  }
}
