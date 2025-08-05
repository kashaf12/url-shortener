import { Module } from "@nestjs/common";
import { DeduplicationService } from "./services/deduplication.service";

/**
 * Deduplication Module - URL and metadata deduplication services
 *
 * This module provides:
 * - URL + metadata hash generation for deduplication
 * - Selective metadata field inclusion
 * - Deterministic hashing for consistent results
 * - Performance optimized for large metadata objects
 *
 * Exports:
 * - DeduplicationService: Main service for URL + metadata deduplication
 */
@Module({
  providers: [DeduplicationService],
  exports: [DeduplicationService],
})
export class DeduplicationModule {}
