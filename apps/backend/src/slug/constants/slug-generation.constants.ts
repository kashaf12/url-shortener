/**
 * Shared constants for slug generation strategies
 *
 * This module contains all shared configuration, alphabets, patterns, and constraints
 * used across different slug generation strategies to ensure consistency.
 */

// ================================
// LENGTH CONSTRAINTS
// ================================

/**
 * Minimum allowed slug length across all strategies
 */
export const MIN_SLUG_LENGTH = 4;

/**
 * Maximum allowed slug length across all strategies
 */
export const MAX_SLUG_LENGTH = 21;

/**
 * Default slug length when none is specified
 */
export const DEFAULT_SLUG_LENGTH = 7;

// ================================
// PREDEFINED ALPHABETS
// ================================

/**
 * Standard alphanumeric characters (0-9, A-Z, a-z)
 */
export const ALPHANUMERIC_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/**
 * URL-safe alphabet including hyphens and underscores
 */
export const URL_SAFE_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

/**
 * Readable alphabet without confusing characters (excludes 0, O, I, l, 1)
 * Optimized for human readability and reduces transcription errors
 */
export const READABLE_ALPHABET =
  "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";

/**
 * Nanoid default alphabet (same as URL_SAFE but maintained separately for clarity)
 */
export const NANOID_DEFAULT_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

// ================================
// ALPHABET TYPE MAPPING
// ================================

/**
 * Predefined alphabet types for easy selection
 */
export const ALPHABET_TYPES = {
  alphanumeric: ALPHANUMERIC_ALPHABET,
  urlSafe: URL_SAFE_ALPHABET,
  readable: READABLE_ALPHABET,
} as const;

export type AlphabetType = keyof typeof ALPHABET_TYPES;

// ================================
// VALIDATION PATTERNS
// ================================

/**
 * URL-safe pattern for validating slugs (alphanumeric + hyphens + underscores)
 */
export const URL_SAFE_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * Alphanumeric pattern for validating slugs (letters and numbers only)
 */
export const ALPHANUMERIC_PATTERN = /^[A-Za-z0-9]+$/;

/**
 * Readable pattern (excludes confusing characters)
 */
export const READABLE_PATTERN =
  /^[23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz]+$/;

/**
 * UUID patterns for different formats
 */
export const UUID_PATTERNS = {
  full: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  compact: /^[0-9a-f]{32}$/i,
  short: /^[0-9a-f]{8,12}$/i,
} as const;

// ================================
// PATTERN TYPE MAPPING
// ================================

/**
 * Predefined pattern types for easy selection
 */
export const PATTERN_TYPES = {
  alphanumeric: ALPHANUMERIC_PATTERN,
  urlSafe: URL_SAFE_PATTERN,
  readable: READABLE_PATTERN,
} as const;

export type PatternType = keyof typeof PATTERN_TYPES;

// ================================
// COLLISION HANDLING CONSTANTS
// ================================

/**
 * Maximum number of collision retry attempts
 */
export const MAX_COLLISION_RETRIES = 5;

/**
 * Length increment for adaptive retry (increase length on repeated collisions)
 */
export const COLLISION_LENGTH_INCREMENT = 1;

/**
 * Fallback strategies to suggest when collision retries are exhausted
 */
export const FALLBACK_STRATEGIES = ["nanoid", "uuid"] as const;

// ================================
// ERROR MESSAGES
// ================================

export const ERROR_MESSAGES = {
  INVALID_LENGTH: (min: number, max: number) =>
    `Slug length must be between ${min} and ${max} characters`,
  INVALID_ALPHABET: "Custom alphabet must contain at least 2 unique characters",
  INVALID_PATTERN: "Generated slug does not match the specified pattern",
  INVALID_STRATEGY: (strategy: string, available: string[]) =>
    `Strategy '${strategy}' is not available. Available strategies: ${available.join(", ")}`,
  COLLISION_EXHAUSTED: (attempts: number) =>
    `Failed to generate unique slug after ${attempts} attempts. Try increasing length or using a different strategy`,
};

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Validate and clamp slug length to allowed range
 * @param length - Requested length
 * @param min - Minimum allowed length (default: MIN_SLUG_LENGTH)
 * @param max - Maximum allowed length (default: MAX_SLUG_LENGTH)
 * @returns Clamped length within valid range
 */
export function clampSlugLength(
  length: number,
  min: number = MIN_SLUG_LENGTH,
  max: number = MAX_SLUG_LENGTH
): number {
  return Math.max(min, Math.min(max, Math.floor(length)));
}

/**
 * Validate alphabet for minimum character diversity
 * @param alphabet - Custom alphabet string
 * @returns true if alphabet is valid
 */
export function isValidAlphabet(alphabet: string): boolean {
  if (!alphabet || alphabet.length < 2) {
    return false;
  }

  // Check for minimum unique characters
  const uniqueChars = new Set(alphabet).size;
  return uniqueChars >= 2;
}

/**
 * Get predefined alphabet by type
 * @param type - Alphabet type
 * @returns Alphabet string
 */
export function getAlphabetByType(type: AlphabetType): string {
  return ALPHABET_TYPES[type];
}

/**
 * Get predefined pattern by type
 * @param type - Pattern type
 * @returns RegExp pattern
 */
export function getPatternByType(type: PatternType): RegExp {
  return PATTERN_TYPES[type];
}

/**
 * Resolve alphabet from custom alphabet or predefined type
 * @param customAlphabet - Custom alphabet string (takes precedence)
 * @param alphabetType - Predefined alphabet type
 * @returns Resolved alphabet string
 */
export function resolveAlphabet(
  customAlphabet?: string,
  alphabetType?: AlphabetType
): string {
  // Custom alphabet takes precedence
  if (customAlphabet) {
    if (!isValidAlphabet(customAlphabet)) {
      throw new Error(ERROR_MESSAGES.INVALID_ALPHABET);
    }
    return customAlphabet;
  }

  // Use predefined alphabet type
  if (alphabetType && alphabetType in ALPHABET_TYPES) {
    return ALPHABET_TYPES[alphabetType];
  }

  // Default to URL-safe alphabet
  return URL_SAFE_ALPHABET;
}
