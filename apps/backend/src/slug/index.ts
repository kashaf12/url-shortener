// Slug Module Barrel Exports

// Module
export { SlugModule } from "./slug.module";

// Main service
export {
  SlugGenerationService,
  SlugGenerationResult,
  SlugGenerationRequest,
} from "./services/slug-generation.service";

// Supporting services
export { SlugStrategyFactory } from "./services/slug-strategy.factory";
export { SlugSpaceValidationService } from "./services/slug-space-validation.service";
export { CustomSlugValidationService } from "./services/custom-slug-validation.service";

// Entities
export { SlugSpaceUsage } from "./entities/slug-space-usage.entity";

// Strategies and interfaces
export {
  ISlugGenerationStrategy,
  SlugGenerationOptions,
  ValidationResult,
  StrategyMetadata,
} from "./strategies/slug-generation.interface";
export {
  SlugCollisionChecker,
  SlugCollisionCheckerFn,
} from "./interfaces/slug-collision-checker.interface";
export { NanoidSlugStrategy, UuidSlugStrategy } from "./strategies";

// Controllers
export { SlugStrategiesController } from "./controllers/slug-strategies.controller";

// Constants
export * from "./constants/slug-generation.constants";
