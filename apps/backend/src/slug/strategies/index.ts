/**
 * Slug Generation Strategies
 *
 * This module exports all available slug generation strategies and related types.
 * New strategies should be added here to make them available throughout the application.
 */

// Interfaces and types
export * from "./slug-generation.interface";

// Strategy implementations
export { NanoidSlugStrategy } from "./nanoid.strategy";
export { UuidSlugStrategy } from "./uuid.strategy";

// Strategy registry type
export type AvailableStrategies = "nanoid" | "uuid";

// Default strategy configuration
export const DEFAULT_STRATEGY: AvailableStrategies = "nanoid";
export const DEFAULT_SLUG_LENGTH = 7;
