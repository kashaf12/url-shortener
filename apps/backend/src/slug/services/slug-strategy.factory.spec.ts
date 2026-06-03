import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { BadRequestException } from "@nestjs/common";
import { SlugStrategyFactory } from "./slug-strategy.factory";
import { NanoidSlugStrategy } from "../strategies/nanoid.strategy";
import { UuidSlugStrategy } from "../strategies/uuid.strategy";
import { ISlugGenerationStrategy } from "../strategies/slug-generation.interface";

describe("SlugStrategyFactory", () => {
  let factory: SlugStrategyFactory;
  let configService: jest.Mocked<ConfigService>;
  let nanoidStrategy: jest.Mocked<NanoidSlugStrategy>;
  let uuidStrategy: jest.Mocked<UuidSlugStrategy>;

  const createMockStrategy = (
    name: string
  ): jest.Mocked<ISlugGenerationStrategy> =>
    ({
      name,
      generate: jest.fn(),
      isValid: jest.fn(),
      validateDetailed: jest.fn(),
      getDefaultOptions: jest.fn(),
      getSupportedFeatures: jest.fn(),
      getMetadata: jest.fn(),
    }) as any;

  beforeEach(async () => {
    nanoidStrategy = createMockStrategy("nanoid");
    uuidStrategy = createMockStrategy("uuid");

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlugStrategyFactory,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: NanoidSlugStrategy,
          useValue: nanoidStrategy,
        },
        {
          provide: UuidSlugStrategy,
          useValue: uuidStrategy,
        },
      ],
    }).compile();

    configService = module.get(ConfigService);

    // Setup default configuration responses
    configService.get.mockImplementation((key: string, defaultValue?: any) => {
      const config = {
        SLUG_GENERATION_STRATEGY: "nanoid",
        DEFAULT_SLUG_LENGTH: 7,
        MIN_SLUG_LENGTH: 4,
        MAX_SLUG_LENGTH: 21,
        MAX_COLLISION_RETRIES: 5,
        AVAILABLE_SLUG_STRATEGIES: undefined,
      };
      return config[key] ?? defaultValue;
    });

    factory = module.get<SlugStrategyFactory>(SlugStrategyFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Constructor and Initialization", () => {
    it("should initialize with default configuration", () => {
      expect(configService.get).toHaveBeenCalledWith(
        "SLUG_GENERATION_STRATEGY",
        "nanoid"
      );
      expect(configService.get).toHaveBeenCalledWith("DEFAULT_SLUG_LENGTH", 7);
      expect(configService.get).toHaveBeenCalledWith("MIN_SLUG_LENGTH", 4);
      expect(configService.get).toHaveBeenCalledWith("MAX_SLUG_LENGTH", 21);
      expect(configService.get).toHaveBeenCalledWith(
        "MAX_COLLISION_RETRIES",
        5
      );
    });

    it("should register all provided strategies", () => {
      expect(factory.isStrategyAvailable("nanoid")).toBe(true);
      expect(factory.isStrategyAvailable("uuid")).toBe(true);
    });

    it("should use custom available strategies from environment", async () => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          if (key === "AVAILABLE_SLUG_STRATEGIES") return "nanoid";
          return (
            defaultValue ||
            {
              SLUG_GENERATION_STRATEGY: "nanoid",
              DEFAULT_SLUG_LENGTH: 7,
              MIN_SLUG_LENGTH: 4,
              MAX_SLUG_LENGTH: 21,
              MAX_COLLISION_RETRIES: 5,
            }[key]
          );
        }
      );

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SlugStrategyFactory,
          { provide: ConfigService, useValue: configService },
          { provide: NanoidSlugStrategy, useValue: nanoidStrategy },
          { provide: UuidSlugStrategy, useValue: uuidStrategy },
        ],
      }).compile();

      const testFactory = module.get<SlugStrategyFactory>(SlugStrategyFactory);

      expect(testFactory.isStrategyAvailable("nanoid")).toBe(true);
      expect(testFactory.getAvailableStrategies()).toEqual(["nanoid"]);
    });

    it("should throw error if default strategy is not available", async () => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          if (key === "SLUG_GENERATION_STRATEGY") return "invalid-strategy";
          if (key === "AVAILABLE_SLUG_STRATEGIES") return "nanoid,uuid";
          return (
            defaultValue ||
            {
              DEFAULT_SLUG_LENGTH: 7,
              MIN_SLUG_LENGTH: 4,
              MAX_SLUG_LENGTH: 21,
              MAX_COLLISION_RETRIES: 5,
            }[key]
          );
        }
      );

      await expect(
        Test.createTestingModule({
          providers: [
            SlugStrategyFactory,
            { provide: ConfigService, useValue: configService },
            { provide: NanoidSlugStrategy, useValue: nanoidStrategy },
            { provide: UuidSlugStrategy, useValue: uuidStrategy },
          ],
        }).compile()
      ).rejects.toThrow(
        /Default slug generation strategy 'invalid-strategy' is not available/
      );
    });
  });

  describe("generateSlug", () => {
    beforeEach(() => {
      nanoidStrategy.generate.mockReturnValue("nanoid-slug");
      uuidStrategy.generate.mockReturnValue("uuid-slug");
    });

    it("should generate slug with default strategy when no strategy specified", () => {
      const result = factory.generateSlug();

      expect(result).toBe("nanoid-slug");
      expect(nanoidStrategy.generate).toHaveBeenCalledWith({ length: 7 });
    });

    it("should generate slug with specified strategy", () => {
      const result = factory.generateSlug("uuid");

      expect(result).toBe("uuid-slug");
      expect(uuidStrategy.generate).toHaveBeenCalledWith({ length: 7 });
    });

    it("should generate slug with custom options", () => {
      const options = {
        length: 12,
        alphabetType: "readable" as const,
      };

      factory.generateSlug("nanoid", options);

      expect(nanoidStrategy.generate).toHaveBeenCalledWith({
        length: 12,
        alphabetType: "readable",
        alphabet: expect.any(String), // Should be resolved from alphabetType
      });
    });

    it("should throw error for invalid strategy", () => {
      expect(() => {
        factory.generateSlug("invalid-strategy");
      }).toThrow(BadRequestException);
    });

    it("should handle strategy generation errors", () => {
      nanoidStrategy.generate.mockImplementation(() => {
        throw new Error("Generation failed");
      });

      expect(() => {
        factory.generateSlug("nanoid");
      }).toThrow(BadRequestException);
    });

    describe("Options Preprocessing", () => {
      it("should clamp length to valid range", () => {
        // Test below minimum
        factory.generateSlug("nanoid", { length: 2 });
        expect(nanoidStrategy.generate).toHaveBeenCalledWith({ length: 4 });

        nanoidStrategy.generate.mockClear();

        // Test above maximum
        factory.generateSlug("nanoid", { length: 50 });
        expect(nanoidStrategy.generate).toHaveBeenCalledWith({ length: 21 });
      });

      it("should resolve alphabet from alphabetType", () => {
        factory.generateSlug("nanoid", { alphabetType: "alphanumeric" });

        expect(nanoidStrategy.generate).toHaveBeenCalledWith({
          length: 7,
          alphabetType: "alphanumeric",
          alphabet: expect.stringMatching(/^[0-9A-Za-z]+$/),
        });
      });

      it("should prioritize custom alphabet over alphabetType", () => {
        const customAlphabet = "ABC123";
        factory.generateSlug("nanoid", {
          alphabet: customAlphabet,
          alphabetType: "readable",
        });

        expect(nanoidStrategy.generate).toHaveBeenCalledWith({
          length: 7,
          alphabet: customAlphabet,
          alphabetType: "readable",
        });
      });

      it("should validate custom alphabet", () => {
        expect(() => {
          factory.generateSlug("nanoid", { alphabet: "A" }); // Too short
        }).toThrow(BadRequestException);

        expect(() => {
          factory.generateSlug("nanoid", { alphabet: "" }); // Empty
        }).toThrow(BadRequestException);
      });

      it("should resolve pattern from patternType", () => {
        factory.generateSlug("nanoid", { patternType: "urlSafe" });

        expect(nanoidStrategy.generate).toHaveBeenCalledWith({
          length: 7,
          patternType: "urlSafe",
          pattern: expect.any(RegExp),
        });
      });

      it("should prioritize custom pattern over patternType", () => {
        const customPattern = /^[A-Z]+$/;
        factory.generateSlug("nanoid", {
          pattern: customPattern,
          patternType: "alphanumeric",
        });

        expect(nanoidStrategy.generate).toHaveBeenCalledWith({
          length: 7,
          pattern: customPattern,
          patternType: "alphanumeric",
        });
      });

      it("should handle invalid alphabetType", () => {
        expect(() => {
          factory.generateSlug("nanoid", { alphabetType: "invalid" as any });
        }).toThrow(BadRequestException);
      });

      it("should handle invalid patternType", () => {
        expect(() => {
          factory.generateSlug("nanoid", { patternType: "invalid" as any });
        }).toThrow(BadRequestException);
      });

      it("should validate deduplication fields", () => {
        const validFields = ["field1", "field2"];
        factory.generateSlug("nanoid", { deduplicationFields: validFields });

        expect(nanoidStrategy.generate).toHaveBeenCalledWith({
          length: 7,
          deduplicationFields: validFields,
        });
      });

      it("should reject too many deduplication fields", () => {
        const tooManyFields = Array.from({ length: 15 }, (_, i) => `field${i}`);

        expect(() => {
          factory.generateSlug("nanoid", {
            deduplicationFields: tooManyFields,
          });
        }).toThrow(BadRequestException);
      });

      it("should handle all option combinations", () => {
        const complexOptions = {
          length: 10,
          alphabet: "ABCD1234",
          alphabetType: "readable" as const,
          pattern: /^[A-D1-4]+$/,
          patternType: "alphanumeric" as const,
          metadata: { source: "test" },
          deduplicate: true,
          deduplicationFields: ["source"],
          enhancedCanonical: true,
        };

        factory.generateSlug("nanoid", complexOptions);

        expect(nanoidStrategy.generate).toHaveBeenCalledWith({
          length: 10,
          alphabet: "ABCD1234", // Custom alphabet prioritized
          alphabetType: "readable",
          pattern: /^[A-D1-4]+$/, // Custom pattern prioritized
          patternType: "alphanumeric",
          metadata: { source: "test" },
          deduplicate: true,
          deduplicationFields: ["source"],
          enhancedCanonical: true,
        });
      });
    });
  });

  describe("validateSlugDetailed", () => {
    beforeEach(() => {
      nanoidStrategy.validateDetailed.mockReturnValue({
        isValid: true,
        errors: [],
        suggestions: undefined,
      });
      nanoidStrategy.isValid.mockReturnValue(true);
    });

    it("should validate slug with detailed strategy method", () => {
      const result = factory.validateSlugDetailed("test-slug", "nanoid", {
        length: 9,
      });

      expect(result).toEqual({
        isValid: true,
        errors: [],
        suggestions: undefined,
      });
      expect(nanoidStrategy.validateDetailed).toHaveBeenCalledWith(
        "test-slug",
        { length: 9 }
      );
    });

    it("should fallback to basic validation if detailed not available", () => {
      const mockStrategyBasic = createMockStrategy("basic");
      delete mockStrategyBasic.validateDetailed; // Remove detailed validation
      mockStrategyBasic.isValid.mockReturnValue(true);

      // Temporarily add strategy
      (factory as any).strategies.set("basic", mockStrategyBasic);
      (factory as any).availableStrategies.push("basic");

      const result = factory.validateSlugDetailed("test-slug", "basic");

      expect(result).toEqual({
        isValid: true,
        errors: [],
        suggestions: undefined,
      });
      expect(mockStrategyBasic.isValid).toHaveBeenCalledWith("test-slug", {
        length: 7,
      });
    });

    it("should return error result for failed basic validation", () => {
      const mockStrategyFail = createMockStrategy("fail");
      delete mockStrategyFail.validateDetailed;
      mockStrategyFail.isValid.mockReturnValue(false);

      (factory as any).strategies.set("fail", mockStrategyFail);
      (factory as any).availableStrategies.push("fail");

      const result = factory.validateSlugDetailed("bad-slug", "fail");

      expect(result).toEqual({
        isValid: false,
        errors: ["Slug failed basic validation"],
        suggestions: ["Check slug format and constraints"],
      });
    });

    it("should handle validation errors gracefully", () => {
      const result = factory.validateSlugDetailed(
        "test-slug",
        "invalid-strategy"
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringMatching(/Strategy 'invalid-strategy' is not available/)
      );
      expect(result.suggestions).toContain("Verify strategy name and options");
    });

    it("should use default strategy when none specified", () => {
      factory.validateSlugDetailed("test-slug");

      expect(nanoidStrategy.validateDetailed).toHaveBeenCalled();
    });
  });

  describe("validateSlug", () => {
    it("should return boolean result from detailed validation", () => {
      nanoidStrategy.validateDetailed.mockReturnValue({
        isValid: true,
        errors: [],
        suggestions: undefined,
      });

      const result = factory.validateSlug("test-slug", "nanoid");

      expect(result).toBe(true);
    });

    it("should return false for invalid slug", () => {
      nanoidStrategy.validateDetailed.mockReturnValue({
        isValid: false,
        errors: ["Invalid format"],
        suggestions: ["Use valid characters"],
      });

      const result = factory.validateSlug("invalid-slug", "nanoid");

      expect(result).toBe(false);
    });
  });

  describe("Collision Resolution Methods", () => {
    describe("getCollisionRetryContext", () => {
      it("should create collision retry context", () => {
        const context = factory.getCollisionRetryContext(
          3,
          "nanoid",
          8,
          "Previous collision error"
        );

        expect(context).toEqual({
          attempt: 3,
          maxAttempts: 5,
          currentLength: 8,
          strategy: "nanoid",
          lastError: "Previous collision error",
        });
      });

      it("should create context without error", () => {
        const context = factory.getCollisionRetryContext(1, "uuid", 7);

        expect(context).toEqual({
          attempt: 1,
          maxAttempts: 5,
          currentLength: 7,
          strategy: "uuid",
          lastError: undefined,
        });
      });
    });

    describe("getSuggestedStrategy", () => {
      it("should return null for early attempts", () => {
        const suggestion = factory.getSuggestedStrategy("nanoid", 2);
        expect(suggestion).toBeNull();
      });

      it("should suggest fallback strategy on final attempts", () => {
        const suggestion = factory.getSuggestedStrategy("nanoid", 4); // maxRetries - 1 = 4
        expect(suggestion).toBe("uuid"); // Should suggest uuid as fallback
      });

      it("should not suggest same strategy", () => {
        const suggestion = factory.getSuggestedStrategy("uuid", 4);
        expect(suggestion).toBe("nanoid"); // Should suggest nanoid as fallback
      });

      it("should return null if no fallback available", () => {
        // Mock single available strategy
        (factory as any).availableStrategies = ["nanoid"];

        const suggestion = factory.getSuggestedStrategy("nanoid", 4);
        expect(suggestion).toBeNull();
      });
    });

    describe("getSuggestedLength", () => {
      it("should increase length based on attempt", () => {
        expect(factory.getSuggestedLength(7, 1)).toBe(8);
        expect(factory.getSuggestedLength(7, 2)).toBe(9);
        expect(factory.getSuggestedLength(7, 3)).toBe(10);
      });

      it("should cap length increase at maximum", () => {
        expect(factory.getSuggestedLength(7, 5)).toBe(10); // Max increment is 3
      });

      it("should respect maximum length constraint", () => {
        expect(factory.getSuggestedLength(20, 5)).toBe(21); // Can't exceed max length
      });

      it("should handle length at maximum", () => {
        expect(factory.getSuggestedLength(21, 3)).toBe(21); // Already at max
      });
    });
  });

  describe("Strategy Management", () => {
    describe("getStrategy", () => {
      it("should return requested strategy", () => {
        const strategy = factory.getStrategy("nanoid");
        expect(strategy).toBe(nanoidStrategy);
      });

      it("should return default strategy when none specified", () => {
        const strategy = factory.getStrategy();
        expect(strategy).toBe(nanoidStrategy); // Default is nanoid
      });

      it("should throw error for unavailable strategy", () => {
        expect(() => {
          factory.getStrategy("unavailable");
        }).toThrow(BadRequestException);
      });

      it("should throw error for unregistered but listed strategy", () => {
        // Add to available list but not registered
        (factory as any).availableStrategies.push("unregistered");

        expect(() => {
          factory.getStrategy("unregistered");
        }).toThrow(BadRequestException);
      });
    });

    describe("isStrategyAvailable", () => {
      it("should return true for available strategies", () => {
        expect(factory.isStrategyAvailable("nanoid")).toBe(true);
        expect(factory.isStrategyAvailable("uuid")).toBe(true);
      });

      it("should return false for unavailable strategies", () => {
        expect(factory.isStrategyAvailable("invalid")).toBe(false);
      });

      it("should return false for registered but not listed strategies", () => {
        // Register strategy but don't add to available list
        const hiddenStrategy = createMockStrategy("hidden");
        (factory as any).strategies.set("hidden", hiddenStrategy);

        expect(factory.isStrategyAvailable("hidden")).toBe(false);
      });
    });

    describe("getAvailableStrategies", () => {
      it("should return array of available strategy names", () => {
        const strategies = factory.getAvailableStrategies();
        expect(strategies).toContain("nanoid");
        expect(strategies).toContain("uuid");
        expect(strategies).toHaveLength(2);
      });

      it("should return copy of array (not reference)", () => {
        const strategies1 = factory.getAvailableStrategies();
        const strategies2 = factory.getAvailableStrategies();

        expect(strategies1).toEqual(strategies2);
        expect(strategies1).not.toBe(strategies2);
      });
    });

    describe("getDefaultStrategy", () => {
      it("should return default strategy name", () => {
        expect(factory.getDefaultStrategy()).toBe("nanoid");
      });
    });

    describe("getConfiguration", () => {
      it("should return complete configuration object", () => {
        const config = factory.getConfiguration();

        expect(config).toEqual({
          defaultStrategy: "nanoid",
          defaultLength: 7,
          minLength: 4,
          maxLength: 21,
          maxRetries: 5,
          availableStrategies: ["nanoid", "uuid"],
        });
      });

      it("should return copy of available strategies", () => {
        const config1 = factory.getConfiguration();
        const config2 = factory.getConfiguration();

        expect(config1.availableStrategies).toEqual(
          config2.availableStrategies
        );
        expect(config1.availableStrategies).not.toBe(
          config2.availableStrategies
        );
      });
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle null options", () => {
      nanoidStrategy.generate.mockReturnValue("default-slug");

      const result = factory.generateSlug("nanoid", null);

      expect(result).toBe("default-slug");
      expect(nanoidStrategy.generate).toHaveBeenCalledWith({ length: 7 });
    });

    it("should handle undefined options", () => {
      nanoidStrategy.generate.mockReturnValue("default-slug");

      const result = factory.generateSlug("nanoid", undefined);

      expect(result).toBe("default-slug");
      expect(nanoidStrategy.generate).toHaveBeenCalledWith({ length: 7 });
    });

    it("should handle empty options object", () => {
      nanoidStrategy.generate.mockReturnValue("default-slug");

      const result = factory.generateSlug("nanoid", {});

      expect(result).toBe("default-slug");
      expect(nanoidStrategy.generate).toHaveBeenCalledWith({ length: 7 });
    });

    it("should handle concurrent slug generation", async () => {
      nanoidStrategy.generate
        .mockReturnValueOnce("slug1")
        .mockReturnValueOnce("slug2")
        .mockReturnValueOnce("slug3");

      const results = await Promise.all([
        Promise.resolve(factory.generateSlug("nanoid", { length: 8 })),
        Promise.resolve(factory.generateSlug("nanoid", { length: 9 })),
        Promise.resolve(factory.generateSlug("nanoid", { length: 10 })),
      ]);

      expect(results).toEqual(["slug1", "slug2", "slug3"]);
    });

    it("should handle extreme length values", () => {
      // Test very small values
      factory.generateSlug("nanoid", { length: -5 });
      expect(nanoidStrategy.generate).toHaveBeenCalledWith({ length: 4 });

      nanoidStrategy.generate.mockClear();

      // Test very large values
      factory.generateSlug("nanoid", { length: 1000 });
      expect(nanoidStrategy.generate).toHaveBeenCalledWith({ length: 21 });
    });

    it("should handle floating point lengths", () => {
      factory.generateSlug("nanoid", { length: 7.8 });
      expect(nanoidStrategy.generate).toHaveBeenCalledWith({ length: 7 });
    });

    it("should handle complex nested metadata", () => {
      const complexMetadata = {
        nested: { deep: { value: "test" } },
        array: [1, 2, 3],
        func: () => "test", // Should be serializable
      };

      factory.generateSlug("nanoid", { metadata: complexMetadata });

      expect(nanoidStrategy.generate).toHaveBeenCalledWith({
        length: 7,
        metadata: complexMetadata,
      });
    });
  });
});
