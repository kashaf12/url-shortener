import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { BadRequestException } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { SlugGenerationService } from "./slug-generation.service";
import { SlugStrategyFactory } from "./slug-strategy.factory";
import { SlugSpaceValidationService } from "./slug-space-validation.service";
import { CustomSlugValidationService } from "./custom-slug-validation.service";
import { SpaceValidationResult } from "@url-shortener/types";

describe("SlugGenerationService", () => {
  let service: SlugGenerationService;
  let strategyFactory: jest.Mocked<SlugStrategyFactory>;
  let spaceValidationService: jest.Mocked<SlugSpaceValidationService>;
  let customSlugValidationService: jest.Mocked<CustomSlugValidationService>;
  let configService: jest.Mocked<ConfigService>;
  let mockLogger: jest.Mocked<any>;

  // Mock collision checker function
  const mockCollisionChecker = jest.fn();

  beforeEach(async () => {
    const mockStrategy = {
      generateSlug: jest.fn(),
      validateSlugGeneration: jest.fn(),
      trackSlugCreation: jest.fn(),
    };

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlugGenerationService,
        {
          provide: SlugStrategyFactory,
          useValue: {
            generateSlug: jest.fn(),
          },
        },
        {
          provide: SlugSpaceValidationService,
          useValue: {
            validateSlugGeneration: jest.fn(),
            trackSlugCreation: jest.fn(),
            getSpaceUsageStats: jest.fn(),
            getSpacesNeedingAttention: jest.fn(),
            recalculateAllSpaceUsage: jest.fn(),
            cleanupSpaceUsage: jest.fn(),
          },
        },
        {
          provide: CustomSlugValidationService,
          useValue: {
            validateCustomSlug: jest.fn(),
            generateSlugSuggestions: jest.fn(),
            isSlugAvailable: jest.fn(),
            getReservedSlugs: jest.fn(),
            addReservedSlug: jest.fn(),
            removeReservedSlug: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<SlugGenerationService>(SlugGenerationService);
    strategyFactory = module.get(SlugStrategyFactory);
    spaceValidationService = module.get(SlugSpaceValidationService);
    customSlugValidationService = module.get(CustomSlugValidationService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockCollisionChecker.mockClear();
  });

  describe("generateSlug", () => {
    describe("Custom Slug Processing", () => {
      it("should process valid custom slug successfully", async () => {
        const request = { customSlug: "my-custom-slug" };
        const validationResult = {
          isValid: true,
          slug: "my-custom-slug",
          errors: [],
          warnings: [],
          suggestions: [],
        };

        customSlugValidationService.validateCustomSlug.mockResolvedValue(
          validationResult
        );

        const result = await service.generateSlug(
          request,
          mockCollisionChecker
        );

        expect(result).toEqual({
          slug: "my-custom-slug",
          wasCustomSlug: true,
          length: 14,
          namespace: undefined,
        });
        expect(
          customSlugValidationService.validateCustomSlug
        ).toHaveBeenCalledWith("my-custom-slug", mockCollisionChecker, {
          namespace: undefined,
          patternType: undefined,
          pattern: undefined,
          autoNormalize: true,
        });
      });

      it("should process custom slug with all options", async () => {
        const request = {
          customSlug: "Custom_Slug",
          namespace: "test-namespace",
          patternType: "urlSafe" as const,
          pattern: "^[a-zA-Z0-9_-]+$",
        };

        const validationResult = {
          isValid: true,
          slug: "custom-slug",
          errors: [],
          warnings: [],
          suggestions: [],
        };

        customSlugValidationService.validateCustomSlug.mockResolvedValue(
          validationResult
        );

        const result = await service.generateSlug(
          request,
          mockCollisionChecker
        );

        expect(result).toEqual({
          slug: "custom-slug",
          wasCustomSlug: true,
          length: 11,
          namespace: "test-namespace",
        });
        expect(
          customSlugValidationService.validateCustomSlug
        ).toHaveBeenCalledWith("Custom_Slug", mockCollisionChecker, {
          namespace: "test-namespace",
          patternType: "urlSafe",
          pattern: new RegExp("^[a-zA-Z0-9_-]+$"),
          autoNormalize: true,
        });
      });

      it("should throw BadRequestException for invalid custom slug", async () => {
        const request = { customSlug: "invalid@slug!" };
        const validationResult = {
          isValid: false,
          slug: "invalid@slug!",
          errors: ["Contains invalid characters", "Too short"],
          warnings: ["Potentially confusing"],
          suggestions: ["invalid-slug", "invalid-slug-1"],
        };

        customSlugValidationService.validateCustomSlug.mockResolvedValue(
          validationResult
        );

        await expect(
          service.generateSlug(request, mockCollisionChecker)
        ).rejects.toThrow(BadRequestException);

        const call =
          customSlugValidationService.validateCustomSlug.mock.calls[0];
        expect(call[0]).toBe("invalid@slug!");
      });

      it("should handle custom slug validation with namespace collision", async () => {
        const request = {
          customSlug: "taken-slug",
          namespace: "user-123",
        };

        const validationResult = {
          isValid: false,
          slug: "taken-slug",
          errors: ["Slug is already in use in namespace 'user-123'"],
          warnings: [],
          suggestions: ["taken-slug-1", "taken-slug-new"],
        };

        customSlugValidationService.validateCustomSlug.mockResolvedValue(
          validationResult
        );

        await expect(
          service.generateSlug(request, mockCollisionChecker)
        ).rejects.toThrow(BadRequestException);

        expect(
          customSlugValidationService.validateCustomSlug
        ).toHaveBeenCalledWith("taken-slug", mockCollisionChecker, {
          namespace: "user-123",
          patternType: undefined,
          pattern: undefined,
          autoNormalize: true,
        });
      });
    });

    describe("Generated Slug Processing", () => {
      const mockSpaceValidation: SpaceValidationResult = {
        canGenerate: true,
        spaceInfo: {
          strategy: "nanoid",
          totalSpace: 1000000,
          usedSpace: 100,
          availableSpace: 999900,
          usagePercentage: 0.01,
          estimatedCollisionRate: 0.001,
        },
        warnings: [],
        recommendations: [],
      };

      beforeEach(() => {
        configService.get.mockImplementation(
          (key: string, defaultValue?: any) => {
            switch (key) {
              case "SLUG_GENERATION_STRATEGY":
                return "nanoid";
              case "MAX_COLLISION_RETRIES":
                return 5;
              default:
                return defaultValue;
            }
          }
        );
      });

      it("should generate unique slug successfully", async () => {
        const request = { length: 8, slugStrategy: "nanoid" };

        spaceValidationService.validateSlugGeneration.mockResolvedValue(
          mockSpaceValidation
        );
        strategyFactory.generateSlug.mockReturnValue("abc12345");
        mockCollisionChecker.mockResolvedValue(false); // No collision

        const result = await service.generateSlug(
          request,
          mockCollisionChecker
        );

        expect(result).toEqual({
          slug: "abc12345",
          spaceValidation: mockSpaceValidation,
          wasCustomSlug: false,
          strategy: "nanoid",
          length: 8,
          namespace: undefined,
        });

        expect(
          spaceValidationService.validateSlugGeneration
        ).toHaveBeenCalledWith("nanoid", { length: 8 }, undefined);
        expect(strategyFactory.generateSlug).toHaveBeenCalledWith("nanoid", {
          length: 8,
        });
        expect(mockCollisionChecker).toHaveBeenCalledWith(
          "abc12345",
          undefined
        );
      });

      it("should handle all strategy and length combinations", async () => {
        const strategies = ["nanoid", "uuid"];
        const lengths = [4, 7, 10, 15, 21];

        for (const strategy of strategies) {
          for (const length of lengths) {
            const request = { length, slugStrategy: strategy };

            spaceValidationService.validateSlugGeneration.mockResolvedValue(
              mockSpaceValidation
            );
            strategyFactory.generateSlug.mockReturnValue(`slug${length}`);
            mockCollisionChecker.mockResolvedValue(false);

            const result = await service.generateSlug(
              request,
              mockCollisionChecker
            );

            expect(result.strategy).toBe(strategy);
            expect(result.length).toBe(length);
            expect(result.wasCustomSlug).toBe(false);

            jest.clearAllMocks();
            mockCollisionChecker.mockClear();
          }
        }
      });

      it("should retry on collision and succeed", async () => {
        const request = { length: 7 };

        spaceValidationService.validateSlugGeneration.mockResolvedValue(
          mockSpaceValidation
        );
        strategyFactory.generateSlug
          .mockReturnValueOnce("collision") // First attempt - collision
          .mockReturnValueOnce("success"); // Second attempt - success

        mockCollisionChecker
          .mockResolvedValueOnce(true) // First slug has collision
          .mockResolvedValueOnce(false); // Second slug is unique

        const result = await service.generateSlug(
          request,
          mockCollisionChecker
        );

        expect(result.slug).toBe("success");
        expect(strategyFactory.generateSlug).toHaveBeenCalledTimes(2);
        expect(mockCollisionChecker).toHaveBeenCalledTimes(2);
        expect(mockLogger.warn).toHaveBeenCalledWith(
          "Slug collision detected, retrying",
          expect.objectContaining({
            slug: "collision",
            attempt: 1,
            maxRetries: 5,
          })
        );
      });

      it("should apply adaptive retry (increase length) after multiple collisions", async () => {
        const request = { length: 7 };

        spaceValidationService.validateSlugGeneration.mockResolvedValue(
          mockSpaceValidation
        );
        strategyFactory.generateSlug
          .mockReturnValueOnce("coll1") // Attempt 1
          .mockReturnValueOnce("coll2") // Attempt 2
          .mockReturnValueOnce("coll3") // Attempt 3 - should increase length
          .mockReturnValueOnce("success"); // Attempt 4 with increased length

        mockCollisionChecker
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false);

        const result = await service.generateSlug(
          request,
          mockCollisionChecker
        );

        expect(result.slug).toBe("success");
        expect(strategyFactory.generateSlug).toHaveBeenNthCalledWith(
          3,
          "nanoid",
          {
            length: 8, // Increased from 7
          }
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
          "Increasing slug length due to collisions",
          expect.objectContaining({
            newLength: 8,
            attempt: 3,
          })
        );
      });

      it("should handle maximum length clamping in adaptive retry", async () => {
        const request = { length: 12 }; // Start high

        spaceValidationService.validateSlugGeneration.mockResolvedValue(
          mockSpaceValidation
        );

        // Mock multiple collisions
        for (let i = 0; i < 5; i++) {
          strategyFactory.generateSlug.mockReturnValueOnce(`coll${i}`);
          mockCollisionChecker.mockResolvedValueOnce(true);
        }

        await expect(
          service.generateSlug(request, mockCollisionChecker)
        ).rejects.toThrow(BadRequestException);

        // Should not increase length beyond 12 (limit in implementation)
        expect(strategyFactory.generateSlug).toHaveBeenNthCalledWith(
          3,
          "nanoid",
          {
            length: 12, // Should stay at max
          }
        );
      });

      it("should throw error after max collision retries", async () => {
        const request = { length: 7 };

        spaceValidationService.validateSlugGeneration.mockResolvedValue(
          mockSpaceValidation
        );

        // Mock all attempts with collisions
        for (let i = 0; i < 5; i++) {
          strategyFactory.generateSlug.mockReturnValueOnce(`collision${i}`);
          mockCollisionChecker.mockResolvedValueOnce(true);
        }

        await expect(
          service.generateSlug(request, mockCollisionChecker)
        ).rejects.toThrow(BadRequestException);

        expect(mockCollisionChecker).toHaveBeenCalledTimes(5);
      });

      it("should handle space exhaustion", async () => {
        const request = { length: 4 };
        const exhaustedSpaceValidation: SpaceValidationResult = {
          canGenerate: false,
          spaceInfo: {
            strategy: "nanoid",
            totalSpace: 1000,
            usedSpace: 999,
            availableSpace: 1,
            usagePercentage: 99.9,
            estimatedCollisionRate: 0.95,
          },
          warnings: ["Space nearly exhausted"],
          recommendations: ["Increase slug length", "Use different strategy"],
        };

        spaceValidationService.validateSlugGeneration.mockResolvedValue(
          exhaustedSpaceValidation
        );

        await expect(
          service.generateSlug(request, mockCollisionChecker)
        ).rejects.toThrow(BadRequestException);

        expect(strategyFactory.generateSlug).not.toHaveBeenCalled();
      });

      it("should log warnings for approaching space exhaustion", async () => {
        const request = { length: 6 };
        const warningSpaceValidation: SpaceValidationResult = {
          canGenerate: true,
          spaceInfo: {
            strategy: "nanoid",
            totalSpace: 1000000,
            usedSpace: 850000,
            availableSpace: 150000,
            usagePercentage: 85,
            estimatedCollisionRate: 0.15,
          },
          warnings: ["Space usage is high"],
          recommendations: ["Consider increasing length"],
        };

        spaceValidationService.validateSlugGeneration.mockResolvedValue(
          warningSpaceValidation
        );
        strategyFactory.generateSlug.mockReturnValue("warnslug");
        mockCollisionChecker.mockResolvedValue(false);

        await service.generateSlug(request, mockCollisionChecker);

        expect(mockLogger.warn).toHaveBeenCalledWith(
          "Slug space approaching exhaustion",
          expect.objectContaining({
            strategy: "nanoid",
            warnings: ["Space usage is high"],
            recommendations: ["Consider increasing length"],
          })
        );
      });

      it("should handle generation errors gracefully", async () => {
        const request = { length: 7 };

        spaceValidationService.validateSlugGeneration.mockResolvedValue(
          mockSpaceValidation
        );
        strategyFactory.generateSlug.mockImplementation(() => {
          throw new Error("Strategy generation failed");
        });

        await expect(
          service.generateSlug(request, mockCollisionChecker)
        ).rejects.toThrow("Strategy generation failed");

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Error during slug generation",
          expect.objectContaining({
            attempt: 1,
            strategy: "nanoid",
            error: "Strategy generation failed",
          })
        );
      });

      it("should handle all alphabet types", async () => {
        const alphabetTypes = ["alphanumeric", "urlSafe", "readable"] as const;

        for (const alphabetType of alphabetTypes) {
          const request = { alphabetType, length: 8 };

          spaceValidationService.validateSlugGeneration.mockResolvedValue(
            mockSpaceValidation
          );
          strategyFactory.generateSlug.mockReturnValue(`slug-${alphabetType}`);
          mockCollisionChecker.mockResolvedValue(false);

          await service.generateSlug(request, mockCollisionChecker);

          expect(strategyFactory.generateSlug).toHaveBeenCalledWith("nanoid", {
            alphabetType,
            length: 8,
          });

          jest.clearAllMocks();
          mockCollisionChecker.mockClear();
        }
      });

      it("should handle namespace-based generation", async () => {
        const request = {
          length: 8,
          namespace: "user-12345",
        };

        spaceValidationService.validateSlugGeneration.mockResolvedValue(
          mockSpaceValidation
        );
        strategyFactory.generateSlug.mockReturnValue("nsslug12");
        mockCollisionChecker.mockResolvedValue(false);

        const result = await service.generateSlug(
          request,
          mockCollisionChecker
        );

        expect(result.namespace).toBe("user-12345");
        expect(
          spaceValidationService.validateSlugGeneration
        ).toHaveBeenCalledWith("nanoid", { length: 8 }, "user-12345");
        expect(mockCollisionChecker).toHaveBeenCalledWith(
          "nsslug12",
          "user-12345"
        );
      });

      it("should handle custom patterns and metadata", async () => {
        const request = {
          length: 10,
          pattern: "^[a-z]+$",
          patternType: "alphanumeric" as const,
          metadata: { source: "api", userId: "123" },
          deduplicate: true,
          deduplicationFields: ["source"],
        };

        spaceValidationService.validateSlugGeneration.mockResolvedValue(
          mockSpaceValidation
        );
        strategyFactory.generateSlug.mockReturnValue("customslug");
        mockCollisionChecker.mockResolvedValue(false);

        await service.generateSlug(request, mockCollisionChecker);

        expect(strategyFactory.generateSlug).toHaveBeenCalledWith("nanoid", {
          length: 10,
          pattern: new RegExp("^[a-z]+$"),
          patternType: "alphanumeric",
          metadata: { source: "api", userId: "123" },
          deduplicate: true,
          deduplicationFields: ["source"],
        });
      });
    });

    describe("Edge Cases and Error Handling", () => {
      it("should throw error for missing custom slug", async () => {
        const request = { customSlug: "" };

        await expect(
          service.generateSlug(request, mockCollisionChecker)
        ).rejects.toThrow(BadRequestException);
      });

      it("should handle null and undefined inputs", async () => {
        const requests = [{ customSlug: null }, { customSlug: undefined }, {}];

        for (const request of requests) {
          const mockSpaceValidation: SpaceValidationResult = {
            canGenerate: true,
            spaceInfo: {
              strategy: "nanoid",
              totalSpace: 1000000,
              usedSpace: 100,
              availableSpace: 999900,
              usagePercentage: 0.01,
              estimatedCollisionRate: 0.001,
            },
            warnings: [],
            recommendations: [],
          };

          spaceValidationService.validateSlugGeneration.mockResolvedValue(
            mockSpaceValidation
          );
          strategyFactory.generateSlug.mockReturnValue("generatedslug");
          mockCollisionChecker.mockResolvedValue(false);

          const result = await service.generateSlug(
            request,
            mockCollisionChecker
          );
          expect(result.wasCustomSlug).toBe(false);

          jest.clearAllMocks();
          mockCollisionChecker.mockClear();
        }
      });

      it("should handle concurrent generation requests", async () => {
        const request = { length: 7 };
        const mockSpaceValidation: SpaceValidationResult = {
          canGenerate: true,
          spaceInfo: {
            strategy: "nanoid",
            totalSpace: 1000000,
            usedSpace: 100,
            availableSpace: 999900,
            usagePercentage: 0.01,
            estimatedCollisionRate: 0.001,
          },
          warnings: [],
          recommendations: [],
        };

        spaceValidationService.validateSlugGeneration.mockResolvedValue(
          mockSpaceValidation
        );

        // Different slugs for concurrent requests
        strategyFactory.generateSlug
          .mockReturnValueOnce("slug001")
          .mockReturnValueOnce("slug002")
          .mockReturnValueOnce("slug003");

        mockCollisionChecker.mockResolvedValue(false);

        const promises = [
          service.generateSlug(request, mockCollisionChecker),
          service.generateSlug(request, mockCollisionChecker),
          service.generateSlug(request, mockCollisionChecker),
        ];

        const results = await Promise.all(promises);

        expect(results).toHaveLength(3);
        expect(results[0].slug).toBe("slug001");
        expect(results[1].slug).toBe("slug002");
        expect(results[2].slug).toBe("slug003");
      });
    });
  });

  describe("processCustomSlug", () => {
    it("should process custom slug with all validation options", async () => {
      const request = {
        customSlug: "test-slug",
        namespace: "ns1",
        patternType: "urlSafe" as const,
        pattern: "^[a-zA-Z0-9_-]+$",
      };

      const validationResult = {
        isValid: true,
        slug: "test-slug",
        errors: [],
        warnings: [],
        suggestions: [],
      };

      customSlugValidationService.validateCustomSlug.mockResolvedValue(
        validationResult
      );

      const result = await service.processCustomSlug(
        request,
        mockCollisionChecker
      );

      expect(result).toEqual({
        slug: "test-slug",
        wasCustomSlug: true,
        length: 9,
        namespace: "ns1",
      });
    });

    it("should throw error when customSlug is missing", async () => {
      const request = {};

      await expect(
        service.processCustomSlug(request, mockCollisionChecker)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("Utility Methods", () => {
    describe("trackSlugCreation", () => {
      it("should track slug creation successfully", async () => {
        const options = { length: 8 };
        spaceValidationService.trackSlugCreation.mockResolvedValue(undefined);

        await service.trackSlugCreation("nanoid", options, "namespace");

        expect(spaceValidationService.trackSlugCreation).toHaveBeenCalledWith(
          "nanoid",
          options,
          "namespace"
        );
      });

      it("should handle tracking errors gracefully", async () => {
        const options = { length: 8 };
        spaceValidationService.trackSlugCreation.mockRejectedValue(
          new Error("Tracking failed")
        );

        // Should not throw, just log
        await service.trackSlugCreation("nanoid", options);

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Failed to track slug creation",
          expect.objectContaining({
            strategy: "nanoid",
            error: "Tracking failed",
          })
        );
      });
    });

    describe("getSpaceValidation", () => {
      it("should return space validation info", async () => {
        const mockValidation: SpaceValidationResult = {
          canGenerate: true,
          spaceInfo: {
            strategy: "nanoid",
            totalSpace: 1000000,
            usedSpace: 100,
            availableSpace: 999900,
            usagePercentage: 0.01,
            estimatedCollisionRate: 0.001,
          },
          warnings: [],
          recommendations: [],
        };

        spaceValidationService.validateSlugGeneration.mockResolvedValue(
          mockValidation
        );

        const result = await service.getSpaceValidation(
          "nanoid",
          { length: 8 },
          "namespace"
        );

        expect(result).toBe(mockValidation);
        expect(
          spaceValidationService.validateSlugGeneration
        ).toHaveBeenCalledWith("nanoid", { length: 8 }, "namespace");
      });
    });

    describe("getSpaceUsageStats", () => {
      it("should return space usage statistics", async () => {
        const mockStats = { totalStrategies: 2, totalUsage: 50 };
        spaceValidationService.getSpaceUsageStats.mockResolvedValue(mockStats);

        const result = await service.getSpaceUsageStats("nanoid");

        expect(result).toBe(mockStats);
        expect(spaceValidationService.getSpaceUsageStats).toHaveBeenCalledWith(
          "nanoid"
        );
      });
    });

    describe("Reserved Slug Management", () => {
      it("should get reserved slugs list", () => {
        const mockReservedSlugs = ["api", "admin", "www"];
        customSlugValidationService.getReservedSlugs.mockReturnValue(
          mockReservedSlugs
        );

        const result = service.getReservedSlugs();

        expect(result).toBe(mockReservedSlugs);
      });

      it("should add reserved slug", () => {
        service.addReservedSlug("new-reserved");

        expect(
          customSlugValidationService.addReservedSlug
        ).toHaveBeenCalledWith("new-reserved");
      });

      it("should remove reserved slug", () => {
        service.removeReservedSlug("old-reserved");

        expect(
          customSlugValidationService.removeReservedSlug
        ).toHaveBeenCalledWith("old-reserved");
      });
    });

    describe("generateSlugSuggestions", () => {
      it("should generate slug suggestions", async () => {
        const mockSuggestions = ["test-1", "test-2", "test-new"];
        customSlugValidationService.generateSlugSuggestions.mockResolvedValue(
          mockSuggestions
        );

        const result = await service.generateSlugSuggestions(
          "test",
          mockCollisionChecker,
          "namespace",
          3
        );

        expect(result).toBe(mockSuggestions);
        expect(
          customSlugValidationService.generateSlugSuggestions
        ).toHaveBeenCalledWith("test", mockCollisionChecker, "namespace", 3);
      });
    });

    describe("isSlugAvailable", () => {
      it("should check slug availability", async () => {
        customSlugValidationService.isSlugAvailable.mockResolvedValue(true);

        const result = await service.isSlugAvailable(
          "available-slug",
          mockCollisionChecker,
          "namespace"
        );

        expect(result).toBe(true);
        expect(
          customSlugValidationService.isSlugAvailable
        ).toHaveBeenCalledWith(
          "available-slug",
          mockCollisionChecker,
          "namespace"
        );
      });
    });

    describe("Space Management Methods", () => {
      it("should get spaces needing attention", async () => {
        const mockSpaces = [{ strategy: "nanoid", usagePercentage: 85 }];
        spaceValidationService.getSpacesNeedingAttention.mockResolvedValue(
          mockSpaces
        );

        const result = await service.getSpacesNeedingAttention();

        expect(result).toBe(mockSpaces);
      });

      it("should recalculate all space usage", async () => {
        spaceValidationService.recalculateAllSpaceUsage.mockResolvedValue(
          undefined
        );

        await service.recalculateAllSpaceUsage();

        expect(
          spaceValidationService.recalculateAllSpaceUsage
        ).toHaveBeenCalled();
      });

      it("should cleanup space usage", async () => {
        spaceValidationService.cleanupSpaceUsage.mockResolvedValue(10);

        const result = await service.cleanupSpaceUsage(30);

        expect(result).toBe(10);
        expect(spaceValidationService.cleanupSpaceUsage).toHaveBeenCalledWith(
          30
        );
      });

      it("should cleanup with default days", async () => {
        spaceValidationService.cleanupSpaceUsage.mockResolvedValue(5);

        const result = await service.cleanupSpaceUsage();

        expect(result).toBe(5);
        expect(spaceValidationService.cleanupSpaceUsage).toHaveBeenCalledWith(
          30
        );
      });
    });
  });

  describe("buildSlugGenerationOptions", () => {
    it("should build options with all parameters", () => {
      const request = {
        length: 8,
        alphabet: "custom123",
        alphabetType: "alphanumeric" as const,
        pattern: "^[a-z]+$",
        patternType: "readable" as const,
        metadata: { key: "value" },
        deduplicate: true,
        deduplicationFields: ["field1"],
      };

      // Access private method through type assertion
      const options = (service as any).buildSlugGenerationOptions(request);

      expect(options).toEqual({
        length: 8,
        alphabet: "custom123",
        alphabetType: "alphanumeric",
        pattern: new RegExp("^[a-z]+$"),
        patternType: "readable",
        metadata: { key: "value" },
        deduplicate: true,
        deduplicationFields: ["field1"],
      });
    });

    it("should handle minimal options", () => {
      const request = {};

      const options = (service as any).buildSlugGenerationOptions(request);

      expect(options).toEqual({});
    });

    it("should convert pattern string to RegExp", () => {
      const request = { pattern: "^[0-9]+$" };

      const options = (service as any).buildSlugGenerationOptions(request);

      expect(options.pattern).toBeInstanceOf(RegExp);
      expect(options.pattern.source).toBe("^[0-9]+$");
    });
  });
});
