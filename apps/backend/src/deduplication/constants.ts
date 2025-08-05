/**
 * Deduplication constants
 *
 * This module contains all constants related to URL and metadata deduplication
 */

// ================================
// DEDUPLICATION CONSTANTS
// ================================

/**
 * Default fields to include in metadata hash for deduplication
 */
export const DEFAULT_DEDUPLICATION_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "ref",
];

/**
 * Maximum number of deduplication fields to prevent performance issues
 */
export const MAX_DEDUPLICATION_FIELDS = 10;

// ================================
// ERROR MESSAGES
// ================================

export const ERROR_MESSAGES = {
  DEDUPLICATION_FIELDS_LIMIT: (max: number) =>
    `Too many deduplication fields. Maximum allowed: ${max}`,
};

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Validate deduplication fields array
 * @param fields - Array of field names
 * @returns true if fields array is valid
 */
export function isValidDeduplicationFields(fields: string[]): boolean {
  return (
    Array.isArray(fields) &&
    fields.length > 0 &&
    fields.length <= MAX_DEDUPLICATION_FIELDS &&
    fields.every(field => typeof field === "string" && field.length > 0)
  );
}
