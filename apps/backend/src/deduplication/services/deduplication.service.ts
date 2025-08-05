import { Injectable } from "@nestjs/common";
import { createHash } from "crypto";
import { DeduplicationContext } from "../../slug/strategies/slug-generation.interface";
import {
  DEFAULT_DEDUPLICATION_FIELDS,
  MAX_DEDUPLICATION_FIELDS,
  isValidDeduplicationFields,
  ERROR_MESSAGES,
} from "../constants";

/**
 * Service for handling URL + metadata deduplication logic
 *
 * This service provides:
 * - URL + metadata hash generation for deduplication
 * - Selective metadata field inclusion
 * - Deterministic hashing for consistent results
 * - Performance optimized for large metadata objects
 */
@Injectable()
export class DeduplicationService {
  /**
   * Create a deduplication hash for URL + metadata combination
   * @param url - The URL to include in hash
   * @param metadata - Metadata object to include in hash
   * @param fields - Specific fields to include (optional, defaults to all fields)
   * @returns Deterministic hash string
   */
  createDeduplicationHash(
    url: string,
    metadata: Record<string, any> = {},
    fields?: string[]
  ): string {
    // Validate inputs
    this.validateInputs(url, metadata, fields);

    // Determine which metadata fields to include
    const fieldsToInclude = this.resolveFieldsToInclude(metadata, fields);

    // Create canonical filtered metadata object
    const canonicalMetadata = this.createCanonicalMetadata(
      metadata,
      fieldsToInclude
    );

    // Create deterministic hash input
    const hashInput = this.createCanonicalHashInput(url, canonicalMetadata);

    // Generate SHA-256 hash
    return createHash("sha256").update(hashInput).digest("hex");
  }

  /**
   * Create a canonical deduplication hash with enhanced determinism
   * @param url - The URL to include in hash
   * @param metadata - Metadata object to include in hash
   * @param fields - Specific fields to include (optional, defaults to all fields)
   * @returns Deterministic hash string with enhanced canonicalization
   */
  createCanonicalDeduplicationHash(
    url: string,
    metadata: Record<string, any> = {},
    fields?: string[]
  ): string {
    // Validate inputs
    this.validateInputs(url, metadata, fields);

    // Normalize URL for canonical comparison
    const canonicalUrl = this.canonicalizeUrl(url);

    // Determine which metadata fields to include
    const fieldsToInclude = this.resolveFieldsToInclude(metadata, fields);

    // Create enhanced canonical metadata object
    const canonicalMetadata = this.createEnhancedCanonicalMetadata(
      metadata,
      fieldsToInclude
    );

    // Create deterministic hash input with version prefix
    const hashInput = this.createVersionedHashInput(
      canonicalUrl,
      canonicalMetadata
    );

    // Generate SHA-256 hash
    return createHash("sha256").update(hashInput).digest("hex");
  }

  /**
   * Create a complete deduplication context
   * @param url - The URL
   * @param metadata - Metadata object
   * @param fields - Specific fields to include
   * @returns Complete deduplication context
   */
  createDeduplicationContext(
    url: string,
    metadata: Record<string, any> = {},
    fields?: string[]
  ): DeduplicationContext {
    const hash = this.createDeduplicationHash(url, metadata, fields);

    return {
      url,
      metadata,
      fields,
      hash,
    };
  }

  /**
   * Compare two deduplication contexts for equality
   * @param context1 - First context
   * @param context2 - Second context
   * @returns true if contexts represent the same URL + metadata combination
   */
  compareContexts(
    context1: DeduplicationContext,
    context2: DeduplicationContext
  ): boolean {
    return context1.hash === context2.hash;
  }

  /**
   * Check if metadata contains any of the specified fields
   * @param metadata - Metadata object to check
   * @param fields - Fields to look for
   * @returns true if any field is present
   */
  hasAnyField(metadata: Record<string, any>, fields: string[]): boolean {
    return fields.some(field => this.hasField(metadata, field));
  }

  /**
   * Check if metadata contains a specific field with a non-null value
   * @param metadata - Metadata object to check
   * @param field - Field to look for
   * @returns true if field exists and has a non-null value
   */
  hasField(metadata: Record<string, any>, field: string): boolean {
    return field in metadata && metadata[field] != null;
  }

  /**
   * Extract only the deduplication-relevant fields from metadata
   * @param metadata - Full metadata object
   * @param fields - Fields to extract
   * @returns Filtered metadata object
   */
  extractDeduplicationFields(
    metadata: Record<string, any>,
    fields?: string[]
  ): Record<string, any> {
    const fieldsToInclude = this.resolveFieldsToInclude(metadata, fields);
    return this.filterMetadata(metadata, fieldsToInclude);
  }

  /**
   * Get default deduplication fields
   * @returns Array of default field names
   */
  getDefaultDeduplicationFields(): string[] {
    return [...DEFAULT_DEDUPLICATION_FIELDS];
  }

  /**
   * Validate maximum number of deduplication fields
   * @param fields - Fields array to validate
   * @returns true if within limits
   */
  isWithinFieldLimit(fields: string[]): boolean {
    return fields.length <= MAX_DEDUPLICATION_FIELDS;
  }

  /**
   * Validate inputs for hash generation
   * @param url - URL to validate
   * @param metadata - Metadata to validate
   * @param fields - Fields to validate
   * @throws Error if inputs are invalid
   */
  private validateInputs(
    url: string,
    metadata: Record<string, any>,
    fields?: string[]
  ): void {
    if (!url || typeof url !== "string") {
      throw new Error("URL must be a non-empty string");
    }

    if (metadata && typeof metadata !== "object") {
      throw new Error("Metadata must be an object");
    }

    if (fields && !isValidDeduplicationFields(fields)) {
      throw new Error(
        ERROR_MESSAGES.DEDUPLICATION_FIELDS_LIMIT(MAX_DEDUPLICATION_FIELDS)
      );
    }
  }

  /**
   * Resolve which fields to include in deduplication hash
   * @param metadata - Metadata object
   * @param requestedFields - Specific fields requested
   * @returns Array of field names to include
   */
  private resolveFieldsToInclude(
    metadata: Record<string, any>,
    requestedFields?: string[]
  ): string[] {
    if (requestedFields && requestedFields.length > 0) {
      // Use specific fields requested by user
      return requestedFields.filter(field => this.hasField(metadata, field));
    }

    // Use default deduplication fields that exist in metadata
    const availableDefaultFields = DEFAULT_DEDUPLICATION_FIELDS.filter(field =>
      this.hasField(metadata, field)
    );

    if (availableDefaultFields.length > 0) {
      return availableDefaultFields;
    }

    // If no default fields found, use all metadata fields
    return Object.keys(metadata).filter(field => metadata[field] != null);
  }

  /**
   * Filter metadata to only include specified fields
   * @param metadata - Full metadata object
   * @param fields - Fields to include
   * @returns Filtered metadata object
   */
  private filterMetadata(
    metadata: Record<string, any>,
    fields: string[]
  ): Record<string, any> {
    const filtered: Record<string, any> = {};

    for (const field of fields) {
      if (this.hasField(metadata, field)) {
        filtered[field] = metadata[field];
      }
    }

    return filtered;
  }

  /**
   * Create deterministic string representation for hashing (legacy)
   * @param url - URL string
   * @param metadata - Filtered metadata object
   * @returns Deterministic string for hashing
   */
  private createHashInput(url: string, metadata: Record<string, any>): string {
    return this.createCanonicalHashInput(url, metadata);
  }

  /**
   * Create canonical hash input for enhanced determinism
   * @param url - URL string
   * @param metadata - Canonical metadata object
   * @returns Deterministic string for hashing
   */
  private createCanonicalHashInput(
    url: string,
    metadata: Record<string, any>
  ): string {
    // Create deterministic representation
    const components = [
      `url:${url}`,
      `metadata:${this.serializeCanonicalMetadata(metadata)}`,
    ];

    return components.join("|");
  }

  /**
   * Create versioned hash input for future-proof hashing
   * @param url - Canonical URL string
   * @param metadata - Enhanced canonical metadata object
   * @returns Versioned deterministic string for hashing
   */
  private createVersionedHashInput(
    url: string,
    metadata: Record<string, any>
  ): string {
    // Include version prefix for future hash compatibility
    const components = [
      "v2", // Version identifier for enhanced canonical hashing
      `url:${url}`,
      `metadata:${this.serializeEnhancedCanonicalMetadata(metadata)}`,
    ];

    return components.join("|");
  }

  /**
   * Create deterministic string representation of metadata (legacy)
   * @param metadata - Metadata object
   * @returns Deterministic string representation
   */
  private serializeMetadata(metadata: Record<string, any>): string {
    return this.serializeCanonicalMetadata(metadata);
  }

  /**
   * Create canonical string representation of metadata
   * @param metadata - Canonical metadata object
   * @returns Deterministic string representation
   */
  private serializeCanonicalMetadata(metadata: Record<string, any>): string {
    if (!metadata || Object.keys(metadata).length === 0) {
      return "";
    }

    // Sort keys for deterministic ordering
    const sortedKeys = Object.keys(metadata).sort();

    // Create key-value pairs
    const pairs = sortedKeys.map(key => {
      const value = metadata[key];
      const serializedValue = this.serializeCanonicalValue(value);
      return `${key}:${serializedValue}`;
    });

    return pairs.join(",");
  }

  /**
   * Create enhanced canonical string representation of metadata
   * @param metadata - Enhanced canonical metadata object
   * @returns Deterministic string representation with enhanced normalization
   */
  private serializeEnhancedCanonicalMetadata(
    metadata: Record<string, any>
  ): string {
    if (!metadata || Object.keys(metadata).length === 0) {
      return "";
    }

    // Sort keys for deterministic ordering
    const sortedKeys = Object.keys(metadata).sort();

    // Create key-value pairs with enhanced serialization
    const pairs = sortedKeys.map(key => {
      const value = metadata[key];
      const serializedValue = this.serializeEnhancedCanonicalValue(value);
      return `${key}:${serializedValue}`;
    });

    return pairs.join(",");
  }

  /**
   * Serialize a value to a deterministic string representation (legacy)
   * @param value - Value to serialize
   * @returns Deterministic string representation
   */
  private serializeValue(value: any): string {
    return this.serializeCanonicalValue(value);
  }

  /**
   * Serialize a value to a canonical deterministic string representation
   * @param value - Value to serialize
   * @returns Canonical deterministic string representation
   */
  private serializeCanonicalValue(value: any): string {
    if (value == null) {
      return "null";
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    if (Array.isArray(value)) {
      return `[${value.map(item => this.serializeCanonicalValue(item)).join(",")}]`;
    }

    if (typeof value === "object") {
      // Recursively serialize nested objects
      const sortedKeys = Object.keys(value).sort();
      const pairs = sortedKeys.map(
        key => `${key}:${this.serializeCanonicalValue(value[key])}`
      );
      return `{${pairs.join(",")}}`;
    }

    // Fallback for other types
    return String(value);
  }

  /**
   * Serialize a value to an enhanced canonical deterministic string representation
   * @param value - Value to serialize
   * @returns Enhanced canonical deterministic string representation
   */
  private serializeEnhancedCanonicalValue(value: any): string {
    if (value == null) {
      return "null";
    }

    if (typeof value === "string") {
      // Normalize whitespace and trim for enhanced canonicalization
      return value.trim().replace(/\s+/g, " ");
    }

    if (typeof value === "number") {
      // Normalize number representation
      if (Number.isInteger(value)) {
        return value.toString();
      }
      // For floats, use fixed precision to avoid floating point inconsistencies
      return Number(value.toFixed(10)).toString();
    }

    if (typeof value === "boolean") {
      return String(value);
    }

    if (Array.isArray(value)) {
      // Sort array values for canonical ordering where possible
      const sortedValue = [...value].sort((a, b) => {
        const aStr = this.serializeEnhancedCanonicalValue(a);
        const bStr = this.serializeEnhancedCanonicalValue(b);
        return aStr.localeCompare(bStr);
      });
      return `[${sortedValue.map(item => this.serializeEnhancedCanonicalValue(item)).join(",")}]`;
    }

    if (typeof value === "object") {
      // Recursively serialize nested objects with enhanced canonicalization
      const sortedKeys = Object.keys(value).sort();
      const pairs = sortedKeys.map(
        key => `${key}:${this.serializeEnhancedCanonicalValue(value[key])}`
      );
      return `{${pairs.join(",")}}`;
    }

    // Fallback for other types
    return String(value);
  }

  /**
   * Create canonical metadata object for deterministic hashing
   * @param metadata - Original metadata object
   * @param fields - Fields to include
   * @returns Canonical metadata object
   */
  private createCanonicalMetadata(
    metadata: Record<string, any>,
    fields: string[]
  ): Record<string, any> {
    // Same as filterMetadata for backward compatibility
    return this.filterMetadata(metadata, fields);
  }

  /**
   * Create enhanced canonical metadata object for deterministic hashing
   * @param metadata - Original metadata object
   * @param fields - Fields to include
   * @returns Enhanced canonical metadata object
   */
  private createEnhancedCanonicalMetadata(
    metadata: Record<string, any>,
    fields: string[]
  ): Record<string, any> {
    const filtered: Record<string, any> = {};

    for (const field of fields) {
      if (this.hasField(metadata, field)) {
        // Apply enhanced canonicalization to metadata values
        filtered[field] = this.canonicalizeMetadataValue(metadata[field]);
      }
    }

    return filtered;
  }

  /**
   * Canonicalize a metadata value for enhanced determinism
   * @param value - Value to canonicalize
   * @returns Canonicalized value
   */
  private canonicalizeMetadataValue(value: any): any {
    if (value == null) {
      return value;
    }

    if (typeof value === "string") {
      // Normalize common string variations
      return value.trim().toLowerCase();
    }

    if (typeof value === "number") {
      // Ensure consistent number representation
      return Number(value);
    }

    if (Array.isArray(value)) {
      // Canonicalize array elements and sort for consistency
      return value.map(item => this.canonicalizeMetadataValue(item)).sort();
    }

    if (typeof value === "object") {
      // Recursively canonicalize nested objects
      const canonical: Record<string, any> = {};
      const sortedKeys = Object.keys(value).sort();

      for (const key of sortedKeys) {
        canonical[key] = this.canonicalizeMetadataValue(value[key]);
      }

      return canonical;
    }

    return value;
  }

  /**
   * Canonicalize URL for enhanced deterministic comparison
   * @param url - URL to canonicalize
   * @returns Canonicalized URL
   */
  private canonicalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);

      // Normalize the URL components
      urlObj.hostname = urlObj.hostname.toLowerCase();
      urlObj.protocol = urlObj.protocol.toLowerCase();

      // Remove default ports
      if (
        (urlObj.protocol === "http:" && urlObj.port === "80") ||
        (urlObj.protocol === "https:" && urlObj.port === "443")
      ) {
        urlObj.port = "";
      }

      // Normalize path
      urlObj.pathname = urlObj.pathname.replace(/\/+/g, "/"); // Remove duplicate slashes
      if (urlObj.pathname.endsWith("/") && urlObj.pathname.length > 1) {
        urlObj.pathname = urlObj.pathname.slice(0, -1); // Remove trailing slash
      }

      // Sort search parameters for canonical ordering
      const searchParams = new URLSearchParams(urlObj.search);
      const sortedParams = new URLSearchParams();
      const sortedKeys = Array.from(searchParams.keys()).sort();

      for (const key of sortedKeys) {
        const values = searchParams.getAll(key);
        for (const value of values.sort()) {
          sortedParams.append(key, value);
        }
      }

      urlObj.search = sortedParams.toString();

      // Remove fragment for canonical comparison (fragments don't affect server-side behavior)
      urlObj.hash = "";

      return urlObj.toString();
    } catch (error) {
      // If URL parsing fails, return the original URL
      return url;
    }
  }
}
