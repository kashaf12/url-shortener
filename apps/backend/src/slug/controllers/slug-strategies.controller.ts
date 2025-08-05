import { Controller, Get, Query } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  StrategyMetadata,
  StrategyDiscoveryResponse,
  ALPHABET_TYPES,
  VALIDATION_PATTERNS,
  SLUG_LENGTH_CONSTRAINTS,
  MAX_COLLISION_RETRIES,
} from "@url-shortener/types";
import { PATTERN_TYPES } from "../constants/slug-generation.constants";

// StrategyDiscoveryResponse is now imported from @url-shortener/types

/**
 * Controller for slug strategy discovery and metadata
 *
 * This controller provides endpoints to:
 * - Discover available slug generation strategies
 * - Get detailed metadata about each strategy
 * - Get system configuration and constraints
 * - Get usage statistics (optional)
 */
@Controller("slug-strategies")
export class SlugStrategiesController {
  private readonly strategies: Map<string, StrategyMetadata>;

  constructor(private readonly configService: ConfigService) {
    this.strategies = new Map();
    this.initializeStrategies();
  }

  /**
   * Get all available slug generation strategies with metadata
   */
  @Get()
  async getStrategies(
    @Query("category") category?: string,
    @Query("includeUsage") includeUsage?: string
  ): Promise<StrategyDiscoveryResponse> {
    let strategies = Array.from(this.strategies.values());

    // Filter by category if requested
    if (category) {
      strategies = strategies.filter(s => s.category === category);
    }

    // Get system configuration
    const defaultStrategy = this.configService.get<string>(
      "SLUG_GENERATION_STRATEGY",
      "nanoid"
    );
    const availableStrategies = this.configService
      .get<string>("AVAILABLE_SLUG_STRATEGIES", "nanoid,uuid")
      .split(",");

    // Filter strategies to only include available ones
    strategies = strategies.filter(s => availableStrategies.includes(s.name));

    const response: StrategyDiscoveryResponse = {
      strategies,
      defaultStrategy,
      configuration: {
        minLength: SLUG_LENGTH_CONSTRAINTS.MIN,
        maxLength: SLUG_LENGTH_CONSTRAINTS.MAX,
        defaultLength: this.configService.get<number>(
          "DEFAULT_SLUG_LENGTH",
          SLUG_LENGTH_CONSTRAINTS.DEFAULT
        ),
        maxCollisionRetries: this.configService.get<number>(
          "MAX_COLLISION_RETRIES",
          MAX_COLLISION_RETRIES
        ),
        supportedAlphabetTypes: Object.keys(ALPHABET_TYPES),
        supportedPatternTypes: Object.keys(PATTERN_TYPES),
      },
      usage: {},
    };

    // Include usage statistics if requested
    if (includeUsage === "true") {
      response.usage = await this.getUsageStatistics();
    }

    return response;
  }

  /**
   * Get detailed metadata for a specific strategy
   */
  @Get(":strategy")
  async getStrategy(
    @Query("strategy") strategyName: string
  ): Promise<StrategyMetadata | null> {
    const strategy = this.strategies.get(strategyName);
    return strategy || null;
  }

  /**
   * Initialize strategy metadata
   */
  private initializeStrategies(): void {
    // Nanoid Strategy
    this.strategies.set("nanoid", {
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
      defaultLength: 7,
      supportedLengths: {
        min: SLUG_LENGTH_CONSTRAINTS.MIN,
        max: SLUG_LENGTH_CONSTRAINTS.MAX,
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
    });

    // UUID Strategy
    this.strategies.set("uuid", {
      name: "uuid",
      displayName: "UUID",
      description: "Universal Unique Identifier with multiple format options",
      category: "secure",
      features: [
        "Globally unique",
        "Multiple formats (full, short, compact)",
        "Industry standard",
        "No collision risk",
        "Time-based ordering (v1)",
        "Random-based (v4)",
      ],
      defaultLength: 8,
      supportedLengths: {
        min: 8,
        max: 32,
        recommended: [8, 12, 16, 32],
      },
      supportedAlphabets: ["alphanumeric"],
      supportedPatterns: ["alphanumeric"],
      performance: {
        generationSpeed: "medium",
        collisionResistance: "very-high",
        memorability: "low",
      },
      useCases: [
        "Enterprise applications",
        "Database primary keys",
        "Distributed systems",
        "Zero-collision requirements",
      ],
      examples: [
        "a3f5d8e2",
        "9b4c7a1f5e2d",
        "f47ac10b58cc4372a5670e02b2c3d479",
        "6ba7b810-9dad-11d1",
      ],
      configuration: {
        supportsCustomAlphabet: false,
        supportsCustomPattern: false,
        supportsCustomLength: true,
        requiresLength: false,
      },
    });

    // Add more strategies as they are implemented
    // this.strategies.set('base58', { ... });
    // this.strategies.set('base32', { ... });
  }

  /**
   * Get usage statistics for strategies
   */
  private async getUsageStatistics(): Promise<
    StrategyDiscoveryResponse["usage"]
  > {
    // This would typically query the database for actual usage statistics
    // For now, return empty statistics
    return {
      totalSlugsGenerated: 0,
      popularStrategies: [],
    };
  }
}
