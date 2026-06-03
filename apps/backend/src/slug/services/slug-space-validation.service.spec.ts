import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { Repository, SelectQueryBuilder, UpdateQueryBuilder } from "typeorm";
import { SlugSpaceValidationService } from "./slug-space-validation.service";
import { SlugSpaceUsage } from "../entities/slug-space-usage.entity";
import { SlugGenerationOptions } from "../strategies/slug-generation.interface";

describe("SlugSpaceValidationService", () => {
  let service: SlugSpaceValidationService;
  let repository: jest.Mocked<Repository<SlugSpaceUsage>>;
  let configService: jest.Mocked<ConfigService>;
  let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<SlugSpaceUsage>>;
  let mockUpdateQueryBuilder: jest.Mocked<UpdateQueryBuilder<SlugSpaceUsage>>;

  // Test data helpers
  const createMockSpaceUsage = (
    overrides: Partial<SlugSpaceUsage> = {}
  ): SlugSpaceUsage => {
    const baseUsage: SlugSpaceUsage = {
      id: "test-id",
      strategy: "nanoid",
      alphabet_hash: "abc123",
      alphabet:
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_",
      length: 7,
      namespace: null,
      usage_count: 100,
      total_space: 1000000,
      usage_percentage: 0.0001,
      warning_threshold: 0.75,
      critical_threshold: 0.9,
      is_warning: false,
      is_critical: false,
      is_exhausted: false,
      warning_reached_at: null,
      critical_reached_at: null,
      exhausted_at: null,
      last_calculated_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
      isApproachingExhaustion: jest.fn(),
      isCriticallyFull: jest.fn(),
      getRemainingSpace: jest.fn(),
      getUtilizationPercentage: jest.fn(),
      getSpaceKey: jest.fn(),
      shouldPreventGeneration: jest.fn(),
      getRecommendedAction: jest.fn(),
      ...overrides,
    } as SlugSpaceUsage;

    // Setup method implementations
    baseUsage.isApproachingExhaustion = jest.fn(
      () =>
        Number(baseUsage.usage_percentage) >=
        Number(baseUsage.warning_threshold)
    );
    baseUsage.isCriticallyFull = jest.fn(
      () =>
        Number(baseUsage.usage_percentage) >=
        Number(baseUsage.critical_threshold)
    );
    baseUsage.getRemainingSpace = jest.fn(
      () => baseUsage.total_space - baseUsage.usage_count
    );
    baseUsage.getUtilizationPercentage = jest.fn(
      () => Number(baseUsage.usage_percentage) * 100
    );
    baseUsage.shouldPreventGeneration = jest.fn(
      () =>
        baseUsage.is_exhausted ||
        Number(baseUsage.usage_percentage) >=
          Number(baseUsage.critical_threshold)
    );
    baseUsage.getRecommendedAction = jest.fn(() => {
      if (baseUsage.is_exhausted) return "exhausted";
      if ((baseUsage.isCriticallyFull as jest.Mock)()) return "critical";
      if ((baseUsage.isApproachingExhaustion as jest.Mock)()) return "warning";
      return "continue";
    });

    return baseUsage;
  };

  beforeEach(async () => {
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
      delete: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    } as any;

    mockUpdateQueryBuilder = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlugSpaceValidationService,
        {
          provide: getRepositoryToken(SlugSpaceUsage),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SlugSpaceValidationService>(
      SlugSpaceValidationService
    );
    repository = module.get(getRepositoryToken(SlugSpaceUsage));
    configService = module.get(ConfigService);

    // Setup default config responses
    configService.get.mockImplementation((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        DEFAULT_SLUG_LENGTH: 7,
        SLUG_SPACE_WARNING_THRESHOLD: 0.75,
        SLUG_SPACE_CRITICAL_THRESHOLD: 0.9,
        SPACE_USAGE_STALE_MINUTES: 15,
      };
      return config[key] ?? defaultValue;
    });

    repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validateSlugGeneration", () => {
    describe("New Space Configuration", () => {
      beforeEach(() => {
        mockQueryBuilder.getOne.mockResolvedValue(null); // No existing record
      });

      it("should create new space usage record for new configuration", async () => {
        const mockCreatedUsage = createMockSpaceUsage({
          usage_count: 0,
          total_space: 64 ** 7, // nanoid default alphabet size ^ length
        });

        repository.create.mockReturnValue(mockCreatedUsage);
        repository.save.mockResolvedValue(mockCreatedUsage);

        const options: SlugGenerationOptions = { length: 7 };
        const result = await service.validateSlugGeneration("nanoid", options);

        expect(repository.create).toHaveBeenCalledWith({
          strategy: "nanoid",
          alphabet: expect.any(String),
          alphabet_hash: expect.any(String),
          length: 7,
          namespace: undefined,
          usage_count: 0,
          total_space: expect.any(Number),
          usage_percentage: 0,
          warning_threshold: 0.75,
          critical_threshold: 0.9,
          last_calculated_at: expect.any(Date),
        });
        expect(repository.save).toHaveBeenCalledWith(mockCreatedUsage);
        expect(result.canGenerate).toBe(true);
        expect(result.spaceInfo.strategy).toBe("nanoid");
      });

      it("should handle all alphabet types", async () => {
        const alphabetTypes = ["alphanumeric", "urlSafe", "readable"] as const;

        for (const alphabetType of alphabetTypes) {
          const mockUsage = createMockSpaceUsage();
          repository.create.mockReturnValue(mockUsage);
          repository.save.mockResolvedValue(mockUsage);

          const options: SlugGenerationOptions = { alphabetType, length: 8 };
          await service.validateSlugGeneration("nanoid", options);

          expect(repository.create).toHaveBeenCalledWith(
            expect.objectContaining({
              alphabet: expect.any(String),
              length: 8,
            })
          );

          jest.clearAllMocks();
        }
      });

      it("should handle custom alphabet", async () => {
        const customAlphabet = "ABCD1234";
        const mockUsage = createMockSpaceUsage({
          alphabet: customAlphabet,
          total_space: 8 ** 6, // custom alphabet size ^ length
        });

        repository.create.mockReturnValue(mockUsage);
        repository.save.mockResolvedValue(mockUsage);

        const options: SlugGenerationOptions = {
          alphabet: customAlphabet,
          length: 6,
        };

        await service.validateSlugGeneration("nanoid", options);

        expect(repository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            alphabet: customAlphabet,
            total_space: 8 ** 6,
          })
        );
      });

      it("should calculate total space correctly for different lengths", async () => {
        const testCases = [
          { length: 4, alphabetSize: 10, expectedSpace: 10000 },
          { length: 6, alphabetSize: 26, expectedSpace: 308915776 },
          { length: 3, alphabetSize: 2, expectedSpace: 8 },
        ];

        for (const testCase of testCases) {
          const customAlphabet = "A".repeat(testCase.alphabetSize);
          const mockUsage = createMockSpaceUsage({
            total_space: testCase.expectedSpace,
          });

          repository.create.mockReturnValue(mockUsage);
          repository.save.mockResolvedValue(mockUsage);

          const options: SlugGenerationOptions = {
            alphabet: customAlphabet,
            length: testCase.length,
          };

          await service.validateSlugGeneration("nanoid", options);

          // Verify the service calculated the space correctly by checking
          // what was passed to repository.create
          const createCall = repository.create.mock.calls[0][0];
          const actualSpace = (service as any).calculateTotalSpace(
            customAlphabet,
            testCase.length
          );
          expect(actualSpace).toBe(testCase.expectedSpace);

          jest.clearAllMocks();
        }
      });

      it("should handle namespace-specific configurations", async () => {
        const mockUsage = createMockSpaceUsage({
          namespace: "user-123",
        });

        repository.create.mockReturnValue(mockUsage);
        repository.save.mockResolvedValue(mockUsage);

        const options: SlugGenerationOptions = { length: 7 };
        await service.validateSlugGeneration("nanoid", options, "user-123");

        expect(repository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            namespace: "user-123",
          })
        );
      });
    });

    describe("Existing Space Configuration", () => {
      it("should return existing space usage when current", async () => {
        const recentTime = new Date();
        recentTime.setMinutes(recentTime.getMinutes() - 5); // 5 minutes ago

        const existingUsage = createMockSpaceUsage({
          last_calculated_at: recentTime,
        });

        mockQueryBuilder.getOne.mockResolvedValue(existingUsage);

        const options: SlugGenerationOptions = { length: 7 };
        const result = await service.validateSlugGeneration("nanoid", options);

        expect(result.canGenerate).toBe(true);
        expect(result.spaceInfo.usedSpace).toBe(100);
        expect(repository.save).not.toHaveBeenCalled(); // Should not update
      });

      it("should recalculate when data is stale", async () => {
        const staleTime = new Date();
        staleTime.setMinutes(staleTime.getMinutes() - 30); // 30 minutes ago

        const staleUsage = createMockSpaceUsage({
          last_calculated_at: staleTime,
          usage_count: 50, // Old count
        });

        mockQueryBuilder.getOne
          .mockResolvedValueOnce(staleUsage) // First call - find existing
          .mockResolvedValueOnce(staleUsage); // Second call - find for recalculation

        const updatedUsage = createMockSpaceUsage({
          ...staleUsage,
          usage_count: 150,
        }); // New count
        repository.save.mockResolvedValue(updatedUsage);

        const options: SlugGenerationOptions = { length: 7 };
        await service.validateSlugGeneration("nanoid", options);

        expect(repository.save).toHaveBeenCalled();
        expect(staleUsage.last_calculated_at).toBeInstanceOf(Date);
      });
    });

    describe("Space Status Detection", () => {
      it("should detect warning state", async () => {
        const warningUsage = createMockSpaceUsage({
          usage_percentage: 0.8, // 80% > 75% warning threshold
          is_warning: true,
        });

        mockQueryBuilder.getOne.mockResolvedValue(warningUsage);

        const result = await service.validateSlugGeneration("nanoid", {});

        expect(result.warnings).toContain(
          expect.stringMatching(/approaching capacity.*80\.00%/)
        );
        expect(result.recommendations).toContain(
          "Monitor usage closely and prepare space expansion plan"
        );
      });

      it("should detect critical state", async () => {
        const criticalUsage = createMockSpaceUsage({
          usage_percentage: 0.95, // 95% > 90% critical threshold
          is_critical: true,
          is_warning: true,
        });

        mockQueryBuilder.getOne.mockResolvedValue(criticalUsage);

        const result = await service.validateSlugGeneration("nanoid", {});

        expect(result.warnings).toContain(
          expect.stringMatching(/critically full.*95\.00%/)
        );
        expect(result.recommendations).toContain(
          "Consider increasing slug length or using a larger alphabet"
        );
        expect(result.recommendations).toContain(
          "Consider using namespaces to partition the slug space"
        );
      });

      it("should detect exhausted state", async () => {
        const exhaustedUsage = createMockSpaceUsage({
          usage_percentage: 0.99,
          is_exhausted: true,
          is_critical: true,
          is_warning: true,
        });

        exhaustedUsage.shouldPreventGeneration = jest.fn(() => true);
        mockQueryBuilder.getOne.mockResolvedValue(exhaustedUsage);

        const result = await service.validateSlugGeneration("nanoid", {});

        expect(result.canGenerate).toBe(false);
        expect(result.warnings).toContain(
          expect.stringMatching(/exhausted.*99\.00%/)
        );
      });

      it("should generate length-specific recommendations", async () => {
        const shortLengthUsage = createMockSpaceUsage({
          length: 6,
          usage_percentage: 0.95,
          is_critical: true,
        });

        mockQueryBuilder.getOne.mockResolvedValue(shortLengthUsage);

        const result = await service.validateSlugGeneration("nanoid", {
          length: 6,
        });

        expect(result.recommendations).toContain(
          expect.stringMatching(/Increase length from 6 to 7/)
        );
      });

      it("should not suggest length increase for long slugs", async () => {
        const longLengthUsage = createMockSpaceUsage({
          length: 15,
          usage_percentage: 0.95,
          is_critical: true,
        });

        mockQueryBuilder.getOne.mockResolvedValue(longLengthUsage);

        const result = await service.validateSlugGeneration("nanoid", {
          length: 15,
        });

        expect(result.recommendations).not.toContain(
          expect.stringMatching(/Increase length/)
        );
      });
    });

    describe("Edge Cases", () => {
      it("should handle zero-size alphabet", async () => {
        const zeroSpaceUsage = createMockSpaceUsage({
          alphabet: "",
          total_space: 0,
          usage_percentage: 0,
        });

        repository.create.mockReturnValue(zeroSpaceUsage);
        repository.save.mockResolvedValue(zeroSpaceUsage);
        mockQueryBuilder.getOne.mockResolvedValue(null);

        const options: SlugGenerationOptions = { alphabet: "", length: 5 };
        const result = await service.validateSlugGeneration("nanoid", options);

        expect(result.spaceInfo.totalSpace).toBe(0);
      });

      it("should handle very large spaces (overflow protection)", async () => {
        const largeAlphabet = "A".repeat(100);

        // Mock the private method to test overflow protection
        const calculateTotalSpace = (service as any).calculateTotalSpace.bind(
          service
        );
        const result = calculateTotalSpace(largeAlphabet, 10);

        expect(result).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
      });

      it("should handle null namespace in queries", async () => {
        mockQueryBuilder.getOne.mockResolvedValue(null);

        await service.validateSlugGeneration("nanoid", {}, undefined);

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          "space.namespace IS NULL"
        );
      });

      it("should handle specific namespace in queries", async () => {
        mockQueryBuilder.getOne.mockResolvedValue(null);

        await service.validateSlugGeneration("nanoid", {}, "test-namespace");

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          "space.namespace = :namespace",
          { namespace: "test-namespace" }
        );
      });
    });
  });

  describe("trackSlugCreation", () => {
    beforeEach(() => {
      repository.createQueryBuilder.mockReturnValue(
        mockUpdateQueryBuilder as any
      );
    });

    it("should increment usage count successfully", async () => {
      mockUpdateQueryBuilder.execute.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });
      mockQueryBuilder.getOne.mockResolvedValue(
        createMockSpaceUsage({ usage_count: 101 })
      );

      const options: SlugGenerationOptions = { length: 7 };
      await service.trackSlugCreation("nanoid", options);

      expect(mockUpdateQueryBuilder.update).toHaveBeenCalledWith(
        SlugSpaceUsage
      );
      expect(mockUpdateQueryBuilder.set).toHaveBeenCalledWith({
        usage_count: expect.any(Function),
        usage_percentage: expect.any(Function),
        updated_at: expect.any(Date),
      });
      expect(mockUpdateQueryBuilder.where).toHaveBeenCalledWith(
        "strategy = :strategy",
        { strategy: "nanoid" }
      );
    });

    it("should handle namespace-specific tracking", async () => {
      mockUpdateQueryBuilder.execute.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });
      mockQueryBuilder.getOne.mockResolvedValue(createMockSpaceUsage());

      const options: SlugGenerationOptions = { length: 8 };
      await service.trackSlugCreation("nanoid", options, "user-456");

      expect(mockUpdateQueryBuilder.andWhere).toHaveBeenCalledWith(
        "namespace = :namespace",
        { namespace: "user-456" }
      );
    });

    it("should handle null namespace tracking", async () => {
      mockUpdateQueryBuilder.execute.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });
      mockQueryBuilder.getOne.mockResolvedValue(createMockSpaceUsage());

      const options: SlugGenerationOptions = { length: 8 };
      await service.trackSlugCreation("nanoid", options, null);

      expect(mockUpdateQueryBuilder.andWhere).toHaveBeenCalledWith(
        "namespace IS NULL"
      );
    });

    it("should update status flags when needed", async () => {
      mockUpdateQueryBuilder.execute.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });

      const usageBecomingCritical = createMockSpaceUsage({
        usage_percentage: 0.91, // Above critical threshold
        is_critical: false, // But flag not set yet
      });

      mockQueryBuilder.getOne.mockResolvedValue(usageBecomingCritical);
      repository.save.mockResolvedValue(usageBecomingCritical);

      await service.trackSlugCreation("nanoid", {});

      // Should save to update the status flags
      expect(repository.save).toHaveBeenCalled();
    });

    it("should handle tracking errors gracefully", async () => {
      mockUpdateQueryBuilder.execute.mockRejectedValue(
        new Error("Database error")
      );

      // Should not throw, just log
      await expect(
        service.trackSlugCreation("nanoid", {})
      ).resolves.not.toThrow();
    });

    it("should handle all alphabet and length combinations", async () => {
      const testCombinations = [
        { alphabetType: "alphanumeric" as const, length: 6 },
        { alphabetType: "readable" as const, length: 8 },
        { alphabet: "CUSTOM123", length: 10 },
      ];

      mockUpdateQueryBuilder.execute.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });
      mockQueryBuilder.getOne.mockResolvedValue(createMockSpaceUsage());

      for (const options of testCombinations) {
        await service.trackSlugCreation("nanoid", options);

        expect(mockUpdateQueryBuilder.andWhere).toHaveBeenCalledWith(
          "length = :length",
          { length: options.length }
        );

        jest.clearAllMocks();
      }
    });
  });

  describe("getSpaceUsageStats", () => {
    it("should return aggregated stats for all strategies", async () => {
      const mockSpaceUsages = [
        createMockSpaceUsage({
          strategy: "nanoid",
          usage_percentage: 0.1,
          is_warning: false,
          is_critical: false,
          is_exhausted: false,
        }),
        createMockSpaceUsage({
          strategy: "nanoid",
          usage_percentage: 0.8,
          is_warning: true,
          is_critical: false,
          is_exhausted: false,
        }),
        createMockSpaceUsage({
          strategy: "uuid",
          usage_percentage: 0.95,
          is_warning: true,
          is_critical: true,
          is_exhausted: false,
        }),
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockSpaceUsages);

      const stats = await service.getSpaceUsageStats();

      expect(stats).toHaveLength(2); // nanoid and uuid

      const nanoidStats = stats.find(s => s.strategy === "nanoid");
      expect(nanoidStats).toEqual({
        strategy: "nanoid",
        alphabetHash: "",
        length: 0,
        totalConfigurations: 2,
        averageUsage: 45, // (10 + 80) / 2
        maxUsage: 80,
        warningCount: 1,
        criticalCount: 0,
        exhaustedCount: 0,
      });

      const uuidStats = stats.find(s => s.strategy === "uuid");
      expect(uuidStats).toEqual({
        strategy: "uuid",
        alphabetHash: "",
        length: 0,
        totalConfigurations: 1,
        averageUsage: 95,
        maxUsage: 95,
        warningCount: 1,
        criticalCount: 1,
        exhaustedCount: 0,
      });
    });

    it("should filter by specific strategy", async () => {
      const nanoidUsages = [createMockSpaceUsage({ strategy: "nanoid" })];
      mockQueryBuilder.getMany.mockResolvedValue(nanoidUsages);

      await service.getSpaceUsageStats("nanoid");

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        "space.strategy = :strategy",
        { strategy: "nanoid" }
      );
    });

    it("should handle empty results", async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const stats = await service.getSpaceUsageStats();

      expect(stats).toEqual([]);
    });

    it("should handle percentage calculations correctly", async () => {
      const mockUsages = [
        createMockSpaceUsage({
          strategy: "test",
          usage_percentage: 0.333333,
        }),
        createMockSpaceUsage({
          strategy: "test",
          usage_percentage: 0.666666,
        }),
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockUsages);

      const stats = await service.getSpaceUsageStats();

      expect(stats[0].averageUsage).toBeCloseTo(49.9999, 4);
      expect(stats[0].maxUsage).toBeCloseTo(66.6666, 4);
    });
  });

  describe("getSpacesNeedingAttention", () => {
    it("should return spaces with warning, critical, or exhausted status", async () => {
      const needingAttention = [
        createMockSpaceUsage({ is_warning: true, usage_percentage: 0.8 }),
        createMockSpaceUsage({ is_critical: true, usage_percentage: 0.95 }),
        createMockSpaceUsage({ is_exhausted: true, usage_percentage: 0.99 }),
      ];

      repository.find.mockResolvedValue(needingAttention);

      const result = await service.getSpacesNeedingAttention();

      expect(repository.find).toHaveBeenCalledWith({
        where: [
          { is_warning: true },
          { is_critical: true },
          { is_exhausted: true },
        ],
        order: { usage_percentage: "DESC" },
      });
      expect(result).toHaveLength(3);
    });

    it("should return empty array when no spaces need attention", async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.getSpacesNeedingAttention();

      expect(result).toEqual([]);
    });
  });

  describe("recalculateAllSpaceUsage", () => {
    it("should recalculate all space usage records", async () => {
      const mockSpaces = [
        createMockSpaceUsage({ id: "space1", usage_count: 50 }),
        createMockSpaceUsage({ id: "space2", usage_count: 150 }),
        createMockSpaceUsage({ id: "space3", usage_count: 250 }),
      ];

      repository.find.mockResolvedValue(mockSpaces);
      repository.save.mockResolvedValue({} as any);

      await service.recalculateAllSpaceUsage();

      expect(repository.find).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledTimes(3);

      // Each space should have updated timestamp
      mockSpaces.forEach(space => {
        expect(space.last_calculated_at).toBeInstanceOf(Date);
      });
    });

    it("should handle recalculation errors gracefully", async () => {
      const mockSpaces = [
        createMockSpaceUsage({ id: "space1" }),
        createMockSpaceUsage({ id: "space2" }),
      ];

      repository.find.mockResolvedValue(mockSpaces);
      repository.save
        .mockResolvedValueOnce({} as any) // First save succeeds
        .mockRejectedValueOnce(new Error("Save failed")); // Second save fails

      // Should not throw
      await expect(service.recalculateAllSpaceUsage()).resolves.not.toThrow();
    });

    it("should handle empty space list", async () => {
      repository.find.mockResolvedValue([]);

      await service.recalculateAllSpaceUsage();

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("cleanupSpaceUsage", () => {
    beforeEach(() => {
      repository.createQueryBuilder.mockReturnValue(
        mockUpdateQueryBuilder as any
      );
    });

    it("should delete old unused records", async () => {
      mockUpdateQueryBuilder.execute.mockResolvedValue({
        affected: 5,
        raw: [],
        generatedMaps: [],
      });

      const deletedCount = await service.cleanupSpaceUsage(30);

      expect(mockUpdateQueryBuilder.delete).toHaveBeenCalled();
      expect(mockUpdateQueryBuilder.where).toHaveBeenCalledWith(
        "usage_count = 0 AND created_at < :cutoffDate",
        { cutoffDate: expect.any(Date) }
      );
      expect(deletedCount).toBe(5);
    });

    it("should use default days when not specified", async () => {
      mockUpdateQueryBuilder.execute.mockResolvedValue({
        affected: 3,
        raw: [],
        generatedMaps: [],
      });

      await service.cleanupSpaceUsage();

      expect(mockUpdateQueryBuilder.where).toHaveBeenCalledWith(
        "usage_count = 0 AND created_at < :cutoffDate",
        { cutoffDate: expect.any(Date) }
      );
    });

    it("should handle custom cleanup period", async () => {
      mockUpdateQueryBuilder.execute.mockResolvedValue({
        affected: 10,
        raw: [],
        generatedMaps: [],
      });

      const deletedCount = await service.cleanupSpaceUsage(60);

      expect(deletedCount).toBe(10);
    });

    it("should handle zero affected rows", async () => {
      mockUpdateQueryBuilder.execute.mockResolvedValue({
        affected: 0,
        raw: [],
        generatedMaps: [],
      });

      const deletedCount = await service.cleanupSpaceUsage();

      expect(deletedCount).toBe(0);
    });

    it("should handle undefined affected count", async () => {
      mockUpdateQueryBuilder.execute.mockResolvedValue({
        raw: [],
        generatedMaps: [],
      });

      const deletedCount = await service.cleanupSpaceUsage();

      expect(deletedCount).toBe(0);
    });
  });

  describe("Private Methods Edge Cases", () => {
    describe("calculateTotalSpace", () => {
      it("should handle empty alphabet", () => {
        const result = (service as any).calculateTotalSpace("", 5);
        expect(result).toBe(0);
      });

      it("should handle zero length", () => {
        const result = (service as any).calculateTotalSpace("ABC", 0);
        expect(result).toBe(0);
      });

      it("should handle negative length", () => {
        const result = (service as any).calculateTotalSpace("ABC", -1);
        expect(result).toBe(0);
      });

      it("should handle overflow scenarios", () => {
        // Test with large alphabet and length that would overflow
        const largeAlphabet = "A".repeat(1000);
        const result = (service as any).calculateTotalSpace(largeAlphabet, 20);

        expect(result).toBe(Number.MAX_SAFE_INTEGER);
      });

      it("should calculate exact values for small spaces", () => {
        expect((service as any).calculateTotalSpace("AB", 3)).toBe(8); // 2^3
        expect((service as any).calculateTotalSpace("ABC", 2)).toBe(9); // 3^2
        expect((service as any).calculateTotalSpace("ABCD", 1)).toBe(4); // 4^1
      });
    });

    describe("resolveAlphabet", () => {
      it("should resolve from alphabetType", () => {
        const result = (service as any).resolveAlphabet({
          alphabetType: "alphanumeric",
        });
        expect(result).toMatch(/^[0-9A-Za-z]+$/);
      });

      it("should prioritize custom alphabet", () => {
        const custom = "CUSTOM123";
        const result = (service as any).resolveAlphabet({
          alphabet: custom,
          alphabetType: "readable",
        });
        expect(result).toBe(custom);
      });

      it("should use default when no alphabet specified", () => {
        const result = (service as any).resolveAlphabet({});
        expect(result).toBeTruthy();
        expect(result.length).toBeGreaterThan(0);
      });
    });

    describe("resolveLength", () => {
      it("should use provided length", () => {
        const result = (service as any).resolveLength({ length: 10 });
        expect(result).toBe(10);
      });

      it("should use default when no length specified", () => {
        const result = (service as any).resolveLength({});
        expect(result).toBe(7); // Default from config
      });

      it("should clamp to valid range", () => {
        expect((service as any).resolveLength({ length: 2 })).toBe(4); // Min
        expect((service as any).resolveLength({ length: 25 })).toBe(21); // Max
      });
    });

    describe("createAlphabetHash", () => {
      it("should create consistent hash for same alphabet", () => {
        const alphabet = "ABC123";
        const hash1 = (service as any).createAlphabetHash(alphabet);
        const hash2 = (service as any).createAlphabetHash(alphabet);

        expect(hash1).toBe(hash2);
        expect(hash1).toHaveLength(64); // SHA-256 hex length
      });

      it("should create different hashes for different alphabets", () => {
        const hash1 = (service as any).createAlphabetHash("ABC");
        const hash2 = (service as any).createAlphabetHash("DEF");

        expect(hash1).not.toBe(hash2);
      });
    });

    describe("updateSpaceStatus", () => {
      it("should update status flags correctly", () => {
        const spaceUsage = createMockSpaceUsage({
          usage_percentage: 0.85, // Between warning and critical
          warning_threshold: 0.75,
          critical_threshold: 0.9,
          is_warning: false,
          is_critical: false,
          is_exhausted: false,
        });

        const changed = (service as any).updateSpaceStatus(spaceUsage);

        expect(changed).toBe(true);
        expect(spaceUsage.is_warning).toBe(true);
        expect(spaceUsage.is_critical).toBe(false);
        expect(spaceUsage.warning_reached_at).toBeInstanceOf(Date);
      });

      it("should handle status flag transitions", () => {
        const spaceUsage = createMockSpaceUsage({
          usage_percentage: 0.5, // Below warning threshold
          warning_threshold: 0.75,
          critical_threshold: 0.9,
          is_warning: true, // Currently warning but should not be
          is_critical: false,
          warning_reached_at: new Date(),
        });

        const changed = (service as any).updateSpaceStatus(spaceUsage);

        expect(changed).toBe(true);
        expect(spaceUsage.is_warning).toBe(false);
        expect(spaceUsage.warning_reached_at).toBeNull();
      });

      it("should not change status when no update needed", () => {
        const spaceUsage = createMockSpaceUsage({
          usage_percentage: 0.85,
          warning_threshold: 0.75,
          critical_threshold: 0.9,
          is_warning: true,
          is_critical: false,
          is_exhausted: false,
        });

        const changed = (service as any).updateSpaceStatus(spaceUsage);

        expect(changed).toBe(false);
      });
    });
  });

  describe("Configuration and Thresholds", () => {
    it("should use custom warning threshold", async () => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          if (key === "SLUG_SPACE_WARNING_THRESHOLD") return 0.6;
          return defaultValue;
        }
      );

      // Re-create service to pick up new config
      const module = await Test.createTestingModule({
        providers: [
          SlugSpaceValidationService,
          { provide: getRepositoryToken(SlugSpaceUsage), useValue: repository },
          { provide: ConfigService, useValue: configService },
        ],
      }).compile();

      const newService = module.get<SlugSpaceValidationService>(
        SlugSpaceValidationService
      );

      const threshold = (newService as any).getWarningThreshold();
      expect(threshold).toBe(0.6);
    });

    it("should use custom critical threshold", () => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          if (key === "SLUG_SPACE_CRITICAL_THRESHOLD") return 0.8;
          return defaultValue;
        }
      );

      const threshold = (service as any).getCriticalThreshold();
      expect(threshold).toBe(0.8);
    });

    it("should use custom stale threshold for updates", async () => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          if (key === "SPACE_USAGE_STALE_MINUTES") return 5;
          return defaultValue;
        }
      );

      const veryStaleTime = new Date();
      veryStaleTime.setMinutes(veryStaleTime.getMinutes() - 10); // 10 minutes ago

      const staleUsage = createMockSpaceUsage({
        last_calculated_at: veryStaleTime,
      });

      mockQueryBuilder.getOne
        .mockResolvedValueOnce(staleUsage)
        .mockResolvedValueOnce(staleUsage);
      repository.save.mockResolvedValue(staleUsage);

      await service.validateSlugGeneration("nanoid", {});

      expect(repository.save).toHaveBeenCalled(); // Should recalculate due to 5min threshold
    });
  });
});
