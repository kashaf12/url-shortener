import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SlugSpaceUsage } from "./entities/slug-space-usage.entity";
import { SlugGenerationService } from "./services/slug-generation.service";
import { SlugStrategyFactory } from "./services/slug-strategy.factory";
import { SlugSpaceValidationService } from "./services/slug-space-validation.service";
import { CustomSlugValidationService } from "./services/custom-slug-validation.service";
import { SlugStrategiesController } from "./controllers/slug-strategies.controller";
import { NanoidSlugStrategy, UuidSlugStrategy } from "./strategies";

/**
 * Slug Module - Centralized slug generation, validation, and management
 *
 * This module provides:
 * - Slug generation with multiple strategies
 * - Custom slug validation and processing
 * - Slug space monitoring and exhaustion prevention
 * - Strategy discovery API
 *
 * Exports:
 * - SlugGenerationService: Main orchestration service for other modules
 * - SlugStrategyFactory: For advanced slug generation needs
 */
@Module({
  imports: [TypeOrmModule.forFeature([SlugSpaceUsage])],
  controllers: [SlugStrategiesController],
  providers: [
    // Main orchestration service
    SlugGenerationService,

    // Core slug services
    SlugStrategyFactory,
    SlugSpaceValidationService,
    CustomSlugValidationService,

    // Strategy implementations
    NanoidSlugStrategy,
    UuidSlugStrategy,
  ],
  exports: [
    // Primary export - main interface for other modules
    SlugGenerationService,

    // Secondary exports for specific use cases
    SlugStrategyFactory, // For advanced slug generation

    // Additional exports for specialized needs
    SlugSpaceValidationService, // For space monitoring
    CustomSlugValidationService, // For custom slug validation
  ],
})
export class SlugModule {}
