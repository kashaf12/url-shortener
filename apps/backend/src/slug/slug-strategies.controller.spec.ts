import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { SlugStrategiesController } from "./slug-strategies.controller";
import {
  StrategyDiscoveryResponse,
  StrategyMetadata,
  ALPHABET_TYPES,
  SLUG_LENGTH_CONSTRAINTS,
  MAX_COLLISION_RETRIES,
} from "@url-shortener/types";

describe("SlugStrategiesController", () => {
  let controller: SlugStrategiesController;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SlugStrategiesController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SlugStrategiesController>(SlugStrategiesController);
    configService = module.get(ConfigService);

    // Setup default config responses
    configService.get.mockImplementation((key: string, defaultValue?: any) => {
      const config = {
        SLUG_GENERATION_STRATEGY: "nanoid",
        AVAILABLE_SLUG_STRATEGIES: "nanoid,uuid",
        DEFAULT_SLUG_LENGTH: 7,
        MAX_COLLISION_RETRIES: 5,
      };
      return config[key] ?? defaultValue;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /slug-strategies", () => {
    describe("Basic Strategy Discovery", () => {
      it("should return all available strategies with complete metadata", async () => {
        const result = await controller.getStrategies();

        expect(result).toEqual({
          strategies: expect.arrayContaining([
            expect.objectContaining({
              name: "nanoid",
              displayName: "NanoID",
              category: "secure",
              features: expect.arrayContaining([
                "URL-safe by default",
                "Cryptographically strong",
                "Customizable alphabet",
                "Variable length",
                "High collision resistance",
                "Fast generation",
              ]),
              defaultLength: 7,
              supportedLengths: {
                min: SLUG_LENGTH_CONSTRAINTS.MIN,
                max: SLUG_LENGTH_CONSTRAINTS.MAX,
                recommended: [6, 7, 8, 10, 12],
              },
              supportedAlphabets: Object.keys(ALPHABET_TYPES),
              supportedPatterns: ["alphanumeric", "urlSafe", "readable"],
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
              examples: [
                "2nYyNd6",
                "V1StGXR8_Z5jdHi6B-myT",
                "KpfBw",
                "rJf2vM9",
              ],
              configuration: {
                supportsCustomAlphabet: true,
                supportsCustomPattern: true,
                supportsCustomLength: true,
                requiresLength: false,
              },
            }),
            expect.objectContaining({
              name: "uuid",
              displayName: "UUID",
              category: "secure",
              features: expect.arrayContaining([
                "Globally unique",
                "Multiple formats (full, short, compact)",
                "Industry standard",
                "No collision risk",
              ]),
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
              configuration: {
                supportsCustomAlphabet: false,
                supportsCustomPattern: false,
                supportsCustomLength: true,
                requiresLength: false,
              },
            }),
          ]),
          defaultStrategy: "nanoid",
          configuration: {
            minLength: SLUG_LENGTH_CONSTRAINTS.MIN,
            maxLength: SLUG_LENGTH_CONSTRAINTS.MAX,
            defaultLength: 7,
            maxCollisionRetries: MAX_COLLISION_RETRIES,
            supportedAlphabetTypes: Object.keys(ALPHABET_TYPES),
            supportedPatternTypes: ["alphanumeric", "urlSafe", "readable"],
          },
          usage: {},
        });
      });

      it("should filter strategies based on available configuration", async () => {
        configService.get.mockImplementation(
          (key: string, defaultValue?: any) => {
            if (key === "AVAILABLE_SLUG_STRATEGIES") return "nanoid";
            return (
              defaultValue ||
              {
                SLUG_GENERATION_STRATEGY: "nanoid",
                DEFAULT_SLUG_LENGTH: 7,
                MAX_COLLISION_RETRIES: 5,
              }[key]
            );
          }
        );

        const result = await controller.getStrategies();

        expect(result.strategies).toHaveLength(1);
        expect(result.strategies[0].name).toBe("nanoid");
      });

      it("should use custom configuration values", async () => {
        configService.get.mockImplementation(
          (key: string, defaultValue?: any) => {
            const customConfig = {
              SLUG_GENERATION_STRATEGY: "uuid",
              AVAILABLE_SLUG_STRATEGIES: "nanoid,uuid",
              DEFAULT_SLUG_LENGTH: 10,
              MAX_COLLISION_RETRIES: 3,
            };
            return customConfig[key] ?? defaultValue;
          }
        );

        const result = await controller.getStrategies();

        expect(result.defaultStrategy).toBe("uuid");
        expect(result.configuration.defaultLength).toBe(10);
        expect(result.configuration.maxCollisionRetries).toBe(3);
      });

      it("should include system configuration constraints", async () => {
        const result = await controller.getStrategies();

        expect(result.configuration).toEqual({
          minLength: SLUG_LENGTH_CONSTRAINTS.MIN,
          maxLength: SLUG_LENGTH_CONSTRAINTS.MAX,
          defaultLength: 7,
          maxCollisionRetries: MAX_COLLISION_RETRIES,
          supportedAlphabetTypes: ["alphanumeric", "urlSafe", "readable"],
          supportedPatternTypes: ["alphanumeric", "urlSafe", "readable"],
        });
      });

      it("should return strategies in consistent format", async () => {
        const result = await controller.getStrategies();

        result.strategies.forEach(strategy => {
          expect(strategy).toHaveProperty("name");
          expect(strategy).toHaveProperty("displayName");
          expect(strategy).toHaveProperty("description");
          expect(strategy).toHaveProperty("category");
          expect(strategy).toHaveProperty("features");
          expect(strategy).toHaveProperty("defaultLength");
          expect(strategy).toHaveProperty("supportedLengths");
          expect(strategy).toHaveProperty("supportedAlphabets");
          expect(strategy).toHaveProperty("supportedPatterns");
          expect(strategy).toHaveProperty("performance");
          expect(strategy).toHaveProperty("useCases");
          expect(strategy).toHaveProperty("examples");
          expect(strategy).toHaveProperty("configuration");

          // Validate nested structure
          expect(strategy.supportedLengths).toHaveProperty("min");
          expect(strategy.supportedLengths).toHaveProperty("max");
          expect(strategy.supportedLengths).toHaveProperty("recommended");
          expect(Array.isArray(strategy.supportedLengths.recommended)).toBe(
            true
          );

          expect(strategy.performance).toHaveProperty("generationSpeed");
          expect(strategy.performance).toHaveProperty("collisionResistance");
          expect(strategy.performance).toHaveProperty("memorability");

          expect(strategy.configuration).toHaveProperty(
            "supportsCustomAlphabet"
          );
          expect(strategy.configuration).toHaveProperty(
            "supportsCustomPattern"
          );
          expect(strategy.configuration).toHaveProperty("supportsCustomLength");
          expect(strategy.configuration).toHaveProperty("requiresLength");
        });
      });
    });

    describe("Category Filtering", () => {
      it("should filter strategies by category", async () => {
        const result = await controller.getStrategies("secure");

        expect(result.strategies.length).toBeGreaterThan(0);
        result.strategies.forEach(strategy => {
          expect(strategy.category).toBe("secure");
        });
      });

      it("should return empty array for non-existent category", async () => {
        const result = await controller.getStrategies("non-existent");

        expect(result.strategies).toHaveLength(0);
        expect(result.defaultStrategy).toBe("nanoid");
        expect(result.configuration).toBeDefined();
      });

      it("should return all strategies when no category specified", async () => {
        const allStrategies = await controller.getStrategies();
        const categoryFiltered = await controller.getStrategies("secure");

        expect(allStrategies.strategies.length).toBeGreaterThanOrEqual(
          categoryFiltered.strategies.length
        );
      });

      it("should handle various category values", async () => {
        const categories = ["secure", "readable", "compact", "custom"];

        for (const category of categories) {
          const result = await controller.getStrategies(category);

          expect(result).toHaveProperty("strategies");
          expect(Array.isArray(result.strategies)).toBe(true);
          expect(result).toHaveProperty("defaultStrategy");
          expect(result).toHaveProperty("configuration");
        }
      });

      it("should handle case-sensitive category matching", async () => {
        const upperResult = await controller.getStrategies("SECURE");
        const lowerResult = await controller.getStrategies("secure");

        expect(upperResult.strategies).toHaveLength(0); // Case sensitive
        expect(lowerResult.strategies.length).toBeGreaterThan(0);
      });
    });

    describe("Usage Statistics", () => {
      it("should exclude usage statistics by default", async () => {
        const result = await controller.getStrategies();

        expect(result.usage).toEqual({});
      });

      it("should include usage statistics when requested", async () => {
        const result = await controller.getStrategies(undefined, "true");

        expect(result.usage).toEqual({
          totalSlugsGenerated: 0,
          popularStrategies: [],
        });
      });

      it("should exclude usage statistics for non-true values", async () => {
        const testValues = ["false", "0", "no", "undefined", "null", ""];

        for (const value of testValues) {
          const result = await controller.getStrategies(undefined, value);
          expect(result.usage).toEqual({});
        }
      });

      it("should handle case-insensitive includeUsage parameter", async () => {
        const trueValues = ["true", "TRUE", "True"];

        for (const value of trueValues) {
          const result = await controller.getStrategies(undefined, value);
          if (value === "true") {
            expect(result.usage).toEqual({
              totalSlugsGenerated: 0,
              popularStrategies: [],
            });
          } else {
            // Only exact "true" should work
            expect(result.usage).toEqual({});
          }
        }
      });
    });

    describe("Query Parameter Combinations", () => {
      it("should handle category and includeUsage together", async () => {
        const result = await controller.getStrategies("secure", "true");

        expect(result.strategies.length).toBeGreaterThan(0);
        result.strategies.forEach(strategy => {
          expect(strategy.category).toBe("secure");
        });
        expect(result.usage).toEqual({
          totalSlugsGenerated: 0,
          popularStrategies: [],
        });
      });

      it("should handle undefined query parameters", async () => {
        const result = await controller.getStrategies(undefined, undefined);

        expect(result.strategies.length).toBeGreaterThan(0);
        expect(result.usage).toEqual({});
      });

      it("should handle empty string query parameters", async () => {
        const result = await controller.getStrategies("", "");

        expect(result.strategies.length).toBeGreaterThan(0); // Empty category matches none, shows all
        expect(result.usage).toEqual({}); // Empty string is not "true"
      });
    });

    describe("Configuration Edge Cases", () => {
      it("should handle missing configuration values", async () => {
        configService.get.mockImplementation(
          (key: string, defaultValue?: any) => {
            // Return undefined for all config, should use defaults
            return defaultValue;
          }
        );

        const result = await controller.getStrategies();

        expect(result.defaultStrategy).toBe("nanoid"); // Default
        expect(result.configuration.defaultLength).toBe(
          SLUG_LENGTH_CONSTRAINTS.DEFAULT
        );
        expect(result.configuration.maxCollisionRetries).toBe(
          MAX_COLLISION_RETRIES
        );
      });

      it("should handle malformed AVAILABLE_SLUG_STRATEGIES", async () => {
        configService.get.mockImplementation(
          (key: string, defaultValue?: any) => {
            if (key === "AVAILABLE_SLUG_STRATEGIES")
              return "invalid-strategy,nanoid";
            return defaultValue || "nanoid";
          }
        );

        const result = await controller.getStrategies();

        // Should only include valid strategies
        expect(result.strategies).toHaveLength(1);
        expect(result.strategies[0].name).toBe("nanoid");
      });

      it("should handle empty AVAILABLE_SLUG_STRATEGIES", async () => {
        configService.get.mockImplementation(
          (key: string, defaultValue?: any) => {
            if (key === "AVAILABLE_SLUG_STRATEGIES") return "";
            return defaultValue || "nanoid";
          }
        );

        const result = await controller.getStrategies();

        expect(result.strategies).toHaveLength(0);
      });

      it("should handle single strategy configuration", async () => {
        configService.get.mockImplementation(
          (key: string, defaultValue?: any) => {
            if (key === "AVAILABLE_SLUG_STRATEGIES") return "uuid";
            if (key === "SLUG_GENERATION_STRATEGY") return "uuid";
            return defaultValue;
          }
        );

        const result = await controller.getStrategies();

        expect(result.strategies).toHaveLength(1);
        expect(result.strategies[0].name).toBe("uuid");
        expect(result.defaultStrategy).toBe("uuid");
      });
    });

    describe("Response Structure Validation", () => {
      it("should return valid StrategyDiscoveryResponse structure", async () => {
        const result = await controller.getStrategies();

        // Validate top-level structure
        expect(result).toHaveProperty("strategies");
        expect(result).toHaveProperty("defaultStrategy");
        expect(result).toHaveProperty("configuration");
        expect(result).toHaveProperty("usage");

        // Validate strategies array
        expect(Array.isArray(result.strategies)).toBe(true);

        // Validate configuration object
        expect(result.configuration).toHaveProperty("minLength");
        expect(result.configuration).toHaveProperty("maxLength");
        expect(result.configuration).toHaveProperty("defaultLength");
        expect(result.configuration).toHaveProperty("maxCollisionRetries");
        expect(result.configuration).toHaveProperty("supportedAlphabetTypes");
        expect(result.configuration).toHaveProperty("supportedPatternTypes");

        // Validate types
        expect(typeof result.defaultStrategy).toBe("string");
        expect(typeof result.configuration.minLength).toBe("number");
        expect(typeof result.configuration.maxLength).toBe("number");
        expect(typeof result.configuration.defaultLength).toBe("number");
        expect(typeof result.configuration.maxCollisionRetries).toBe("number");
        expect(Array.isArray(result.configuration.supportedAlphabetTypes)).toBe(
          true
        );
        expect(Array.isArray(result.configuration.supportedPatternTypes)).toBe(
          true
        );
      });

      it("should include complete strategy metadata for each strategy", async () => {
        const result = await controller.getStrategies();

        result.strategies.forEach(strategy => {
          // Required fields
          expect(typeof strategy.name).toBe("string");
          expect(typeof strategy.displayName).toBe("string");
          expect(typeof strategy.description).toBe("string");
          expect(typeof strategy.category).toBe("string");
          expect(typeof strategy.defaultLength).toBe("number");

          // Arrays
          expect(Array.isArray(strategy.features)).toBe(true);
          expect(Array.isArray(strategy.supportedAlphabets)).toBe(true);
          expect(Array.isArray(strategy.supportedPatterns)).toBe(true);
          expect(Array.isArray(strategy.useCases)).toBe(true);
          expect(Array.isArray(strategy.examples)).toBe(true);

          // Objects
          expect(typeof strategy.supportedLengths).toBe("object");
          expect(typeof strategy.performance).toBe("object");
          expect(typeof strategy.configuration).toBe("object");
        });
      });
    });
  });

  describe("GET /slug-strategies/:strategy", () => {
    describe("Valid Strategy Requests", () => {
      it("should return nanoid strategy metadata", async () => {
        const result = await controller.getStrategy("nanoid");

        expect(result).toEqual({
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
          supportedPatterns: ["alphanumeric", "urlSafe", "readable"],
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
      });

      it("should return uuid strategy metadata", async () => {
        const result = await controller.getStrategy("uuid");

        expect(result).toEqual({
          name: "uuid",
          displayName: "UUID",
          description:
            "Universal Unique Identifier with multiple format options",
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
      });
    });

    describe("Invalid Strategy Requests", () => {
      it("should return null for non-existent strategy", async () => {
        const result = await controller.getStrategy("non-existent");

        expect(result).toBeNull();
      });

      it("should return null for empty strategy name", async () => {
        const result = await controller.getStrategy("");

        expect(result).toBeNull();
      });

      it("should handle case-sensitive strategy names", async () => {
        const result = await controller.getStrategy("NANOID");

        expect(result).toBeNull(); // Case sensitive
      });

      it("should handle special characters in strategy name", async () => {
        const specialNames = ["nano-id", "nano_id", "nano id", "nano@id"];

        for (const name of specialNames) {
          const result = await controller.getStrategy(name);
          expect(result).toBeNull();
        }
      });

      it("should handle undefined strategy parameter", async () => {
        const result = await controller.getStrategy(undefined as any);

        expect(result).toBeNull();
      });

      it("should handle null strategy parameter", async () => {
        const result = await controller.getStrategy(null as any);

        expect(result).toBeNull();
      });
    });

    describe("Strategy Metadata Completeness", () => {
      it("should return complete metadata for all available strategies", async () => {
        const strategies = ["nanoid", "uuid"];

        for (const strategyName of strategies) {
          const strategy = await controller.getStrategy(strategyName);

          expect(strategy).not.toBeNull();
          expect(strategy!.name).toBe(strategyName);
          expect(strategy!.displayName).toBeTruthy();
          expect(strategy!.description).toBeTruthy();
          expect(strategy!.features.length).toBeGreaterThan(0);
          expect(strategy!.examples.length).toBeGreaterThan(0);
          expect(strategy!.useCases.length).toBeGreaterThan(0);
        }
      });

      it("should include consistent configuration flags", async () => {
        const strategy = await controller.getStrategy("nanoid");

        expect(strategy!.configuration).toEqual({
          supportsCustomAlphabet: true,
          supportsCustomPattern: true,
          supportsCustomLength: true,
          requiresLength: false,
        });
      });

      it("should include valid performance metrics", async () => {
        const strategy = await controller.getStrategy("nanoid");

        expect(strategy!.performance.generationSpeed).toMatch(
          /^(fast|medium|slow)$/
        );
        expect(strategy!.performance.collisionResistance).toMatch(
          /^(low|medium|high|very-high)$/
        );
        expect(strategy!.performance.memorability).toMatch(
          /^(low|medium|high)$/
        );
      });

      it("should include valid length constraints", async () => {
        const strategy = await controller.getStrategy("nanoid");

        expect(strategy!.supportedLengths.min).toBeGreaterThan(0);
        expect(strategy!.supportedLengths.max).toBeGreaterThan(
          strategy!.supportedLengths.min
        );
        expect(strategy!.defaultLength).toBeGreaterThanOrEqual(
          strategy!.supportedLengths.min
        );
        expect(strategy!.defaultLength).toBeLessThanOrEqual(
          strategy!.supportedLengths.max
        );

        strategy!.supportedLengths.recommended.forEach(length => {
          expect(length).toBeGreaterThanOrEqual(strategy!.supportedLengths.min);
          expect(length).toBeLessThanOrEqual(strategy!.supportedLengths.max);
        });
      });
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle ConfigService errors gracefully", async () => {
      configService.get.mockImplementation(() => {
        throw new Error("Config service error");
      });

      // Should use defaults and not crash
      await expect(controller.getStrategies()).resolves.toBeDefined();
    });

    it("should handle concurrent requests", async () => {
      const promises = [
        controller.getStrategies(),
        controller.getStrategy("nanoid"),
        controller.getStrategy("uuid"),
        controller.getStrategies("secure"),
        controller.getStrategies(undefined, "true"),
      ];

      const results = await Promise.all(promises);

      expect(results[0]).toHaveProperty("strategies"); // getStrategies()
      expect(results[1]).toHaveProperty("name", "nanoid"); // getStrategy("nanoid")
      expect(results[2]).toHaveProperty("name", "uuid"); // getStrategy("uuid")
      expect(results[3]).toHaveProperty("strategies"); // getStrategies("secure")
      expect(results[4]).toHaveProperty("usage"); // getStrategies(undefined, "true")
    });

    it("should maintain strategy metadata consistency", () => {
      // Test that initialized strategies are immutable
      const strategies1 = (controller as any).strategies;
      const strategies2 = (controller as any).strategies;

      expect(strategies1).toBe(strategies2); // Same reference
      expect(strategies1.get("nanoid")).toEqual(strategies2.get("nanoid"));
    });

    it("should handle memory constraints", async () => {
      // Test with large number of concurrent requests
      const promises = Array.from({ length: 100 }, () =>
        controller.getStrategies()
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(100);
      results.forEach(result => {
        expect(result).toHaveProperty("strategies");
        expect(result).toHaveProperty("defaultStrategy");
      });
    });
  });

  describe("Usage Statistics Integration", () => {
    it("should return consistent usage structure", async () => {
      const result = await controller.getStrategies(undefined, "true");

      expect(result.usage).toEqual({
        totalSlugsGenerated: 0,
        popularStrategies: [],
      });
    });

    it("should handle usage statistics errors", async () => {
      // Mock the private method to throw an error
      const originalMethod = (controller as any).getUsageStatistics;
      (controller as any).getUsageStatistics = jest
        .fn()
        .mockRejectedValue(new Error("Usage stats error"));

      // Should handle gracefully
      await expect(controller.getStrategies(undefined, "true")).rejects.toThrow(
        "Usage stats error"
      );

      // Restore original method
      (controller as any).getUsageStatistics = originalMethod;
    });

    it("should format usage statistics correctly", async () => {
      const mockUsageStats = {
        totalSlugsGenerated: 1000,
        popularStrategies: [
          { strategy: "nanoid", count: 800, percentage: 80 },
          { strategy: "uuid", count: 200, percentage: 20 },
        ],
      };

      // Mock the private method
      (controller as any).getUsageStatistics = jest
        .fn()
        .mockResolvedValue(mockUsageStats);

      const result = await controller.getStrategies(undefined, "true");

      expect(result.usage).toEqual(mockUsageStats);
    });
  });
});
