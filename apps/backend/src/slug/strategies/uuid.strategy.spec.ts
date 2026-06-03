import { UuidSlugStrategy } from "./uuid.strategy";
import { SlugGenerationOptions } from "./slug-generation.interface";
import { v4 as uuidv4, v7 as uuidv7 } from "uuid";

// Mock uuid functions
jest.mock("uuid", () => ({
  v4: jest.fn(),
  v7: jest.fn(),
}));

describe("UuidSlugStrategy", () => {
  let strategy: UuidSlugStrategy;
  const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>;
  const mockUuidv7 = uuidv7 as jest.MockedFunction<typeof uuidv7>;

  beforeEach(() => {
    strategy = new UuidSlugStrategy();
    jest.clearAllMocks();

    // Default mock implementations
    mockUuidv4.mockReturnValue("550e8400-e29b-41d4-a716-446655440000");
    mockUuidv7.mockReturnValue("01234567-89ab-7def-8123-456789abcdef");
  });

  describe("generate", () => {
    describe("Basic Generation", () => {
      it("should generate slug with default v4 UUID", () => {
        mockUuidv4.mockReturnValue("550e8400-e29b-41d4-a716-446655440000");

        const result = strategy.generate();

        expect(result).toBe("550e8400"); // Short format (8 chars) by default
        expect(mockUuidv4).toHaveBeenCalledWith();
        expect(mockUuidv7).not.toHaveBeenCalled();
      });

      it("should generate slug with specified v4 version", () => {
        mockUuidv4.mockReturnValue("12345678-1234-4234-8234-123456789abc");

        const result = strategy.generate({ version: "v4" });

        expect(result).toBe("12345678"); // Short format
        expect(mockUuidv4).toHaveBeenCalledWith();
      });

      it("should generate slug with v7 version", () => {
        mockUuidv7.mockReturnValue("01234567-89ab-7def-8123-456789abcdef");

        const result = strategy.generate({ version: "v7" });

        expect(result).toBe("01234567"); // Short format
        expect(mockUuidv7).toHaveBeenCalledWith();
      });

      it("should handle unknown version and default to v4", () => {
        mockUuidv4.mockReturnValue("550e8400-e29b-41d4-a716-446655440000");

        const result = strategy.generate({ version: "unknown" as any });

        expect(result).toBe("550e8400");
        expect(mockUuidv4).toHaveBeenCalledWith();
      });
    });

    describe("Length and Format Processing", () => {
      it("should generate short format (8 chars) for length <= 8", () => {
        mockUuidv4.mockReturnValue("12345678-1234-4234-8234-123456789abc");

        const testLengths = [4, 6, 8];
        for (const length of testLengths) {
          const result = strategy.generate({ length });
          expect(result).toBe("12345678");
          mockUuidv4.mockClear();
        }
      });

      it("should generate medium format (12 chars) for length <= 12", () => {
        mockUuidv4.mockReturnValue("abcdef12-3456-4789-abcd-ef123456789a");

        const testLengths = [10, 12];
        for (const length of testLengths) {
          const result = strategy.generate({ length });
          expect(result).toBe("abcdef123456");
          mockUuidv4.mockClear();
        }
      });

      it("should generate compact format (32 chars) for length <= 32", () => {
        mockUuidv4.mockReturnValue("12345678-abcd-4ef0-1234-56789abcdef0");

        const testLengths = [20, 32];
        for (const length of testLengths) {
          const result = strategy.generate({ length });
          expect(result).toBe("12345678abcd4ef012345656789abcdef0");
          mockUuidv4.mockClear();
        }
      });

      it("should generate full format (36 chars) for length > 32", () => {
        mockUuidv4.mockReturnValue("12345678-abcd-4ef0-1234-56789abcdef0");

        const result = strategy.generate({ length: 36 });

        expect(result).toBe("12345678-abcd-4ef0-1234-56789abcdef0");
      });

      it("should clamp length to valid range", () => {
        mockUuidv4.mockReturnValue("12345678-1234-4234-8234-123456789abc");

        // Below minimum (4)
        let result = strategy.generate({ length: 2 });
        expect(result).toBe("12345678"); // Short format for clamped length 4

        // Above maximum (21) - should still work but clamp
        mockUuidv4.mockClear();
        result = strategy.generate({ length: 50 });
        expect(result).toBe("12345678123442348234123456789abc"); // Compact format
      });

      it("should handle exact length adjustment", () => {
        mockUuidv4.mockReturnValue("12345678-1234-4234-8234-123456789abc");

        const result = strategy.generate({ length: 10 });

        expect(result.length).toBe(12); // Medium format length, not truncated to 10
        expect(result).toBe("123456781234");
      });

      it("should truncate when slug is longer than requested length", () => {
        mockUuidv4.mockReturnValue("12345678-1234-4234-8234-123456789abc");

        // Request shorter than what format provides
        const result = strategy.generate({ length: 6 });

        expect(result.length).toBe(8); // Short format minimum
      });
    });

    describe("Format Determination", () => {
      it("should determine format correctly based on length", () => {
        mockUuidv4.mockReturnValue("12345678-1234-4234-8234-123456789abc");

        // Test format determination via private method access
        const determineFormat = (strategy as any).determineFormat.bind(
          strategy
        );

        expect(determineFormat(undefined)).toBe("short");
        expect(determineFormat(4)).toBe("short");
        expect(determineFormat(8)).toBe("short");
        expect(determineFormat(10)).toBe("medium");
        expect(determineFormat(12)).toBe("medium");
        expect(determineFormat(20)).toBe("compact");
        expect(determineFormat(32)).toBe("compact");
        expect(determineFormat(36)).toBe("full");
        expect(determineFormat(40)).toBe("full");
      });

      it("should format UUID according to specifications", () => {
        const formatUuid = (strategy as any).formatUuid.bind(strategy);
        const testUuid = "12345678-abcd-4ef0-1234-56789abcdef0";

        expect(formatUuid(testUuid, "short")).toBe("12345678");
        expect(formatUuid(testUuid, "medium")).toBe("12345678abcd");
        expect(formatUuid(testUuid, "compact")).toBe(
          "12345678abcd4ef01234556789abcdef0"
        );
        expect(formatUuid(testUuid, "full")).toBe(
          "12345678-abcd-4ef0-1234-56789abcdef0"
        );
      });
    });

    describe("Pattern Validation", () => {
      it("should validate pattern after generation", () => {
        mockUuidv4.mockReturnValue("12345678-abcd-4ef0-1234-56789abcdef0");

        const result = strategy.generate({
          pattern: /^[0-9a-f]{8}$/, // Only matches short format
        });

        expect(result).toBe("12345678");
      });

      it("should throw error when pattern cannot be satisfied", () => {
        mockUuidv4.mockReturnValue("12345678-abcd-4ef0-1234-56789abcdef0");

        expect(() => {
          strategy.generate({
            pattern: /^[XYZ]+$/, // Impossible pattern for UUID
          });
        }).toThrow("Generated UUID slug does not match required pattern");
      });

      it("should resolve pattern from patternType", () => {
        mockUuidv4.mockReturnValue("12345678-abcd-4ef0-1234-56789abcdef0");

        const result = strategy.generate({
          patternType: "alphanumeric",
        });

        expect(result).toBe("12345678");
      });
    });

    describe("Edge Cases and Error Handling", () => {
      it("should handle undefined options", () => {
        mockUuidv4.mockReturnValue("default12-3456-4789-abcd-ef123456789a");

        const result = strategy.generate(undefined);

        expect(result).toBe("default12");
        expect(mockUuidv4).toHaveBeenCalledWith();
      });

      it("should handle empty options object", () => {
        mockUuidv4.mockReturnValue("empty123-4567-4890-abcd-ef123456789a");

        const result = strategy.generate({});

        expect(result).toBe("empty123");
      });

      it("should handle all undefined option values", () => {
        mockUuidv4.mockReturnValue("allnull1-2345-4678-abcd-ef123456789a");

        const result = strategy.generate({
          length: undefined,
          version: undefined,
          pattern: undefined,
          patternType: undefined,
        });

        expect(result).toBe("allnull1");
      });

      it("should handle UUID generation errors", () => {
        mockUuidv4.mockImplementation(() => {
          throw new Error("UUID generation failed");
        });

        expect(() => {
          strategy.generate();
        }).toThrow("UUID generation failed");
      });

      it("should handle length adjustment edge cases", () => {
        const adjustSlugLength = (strategy as any).adjustSlugLength.bind(
          strategy
        );

        expect(adjustSlugLength("12345678", 8)).toBe("12345678"); // Same length
        expect(adjustSlugLength("123456789", 6)).toBe("123456"); // Truncate
        expect(adjustSlugLength("1234", 8)).toBe("1234"); // Don't pad for UUID
      });
    });

    describe("Convenience Methods", () => {
      it("should generate short UUID slug", () => {
        mockUuidv4.mockReturnValue("short123-4567-4890-abcd-ef123456789a");

        const result = strategy.generateShort();

        expect(result).toBe("short123");
        expect(mockUuidv4).toHaveBeenCalledWith();
      });

      it("should generate short UUID slug with v7", () => {
        mockUuidv7.mockReturnValue("shortv71-2345-7678-a123-456789abcdef");

        const result = strategy.generateShort("v7");

        expect(result).toBe("shortv71");
        expect(mockUuidv7).toHaveBeenCalledWith();
      });

      it("should generate medium UUID slug", () => {
        mockUuidv4.mockReturnValue("medium12-3456-4789-abcd-ef123456789a");

        const result = strategy.generateMedium();

        expect(result).toBe("medium123456");
      });

      it("should generate medium UUID slug with v7", () => {
        mockUuidv7.mockReturnValue("mediumv7-1234-7567-8901-23456789abcd");

        const result = strategy.generateMedium("v7");

        expect(result).toBe("mediumv71234");
        expect(mockUuidv7).toHaveBeenCalledWith();
      });

      it("should generate time-ordered UUID slug", () => {
        mockUuidv7.mockReturnValue("time1234-5678-7901-2345-6789abcdef01");

        const result = strategy.generateTimeOrdered();

        expect(result).toBe("time1234");
        expect(mockUuidv7).toHaveBeenCalledWith();
      });

      it("should generate time-ordered UUID slug with custom length", () => {
        mockUuidv7.mockReturnValue("timelong-1234-7567-8901-23456789abcd");

        const result = strategy.generateTimeOrdered(12);

        expect(result).toBe("timelong1234");
      });

      it("should generate compact UUID slug", () => {
        mockUuidv4.mockReturnValue("compact1-2345-4678-9012-3456789abcde");

        const result = strategy.generateCompact();

        expect(result).toBe("compact1234546789012345636789abcde");
      });

      it("should generate compact UUID slug with v7", () => {
        mockUuidv7.mockReturnValue("compactv-7123-7456-7890-123456789abc");

        const result = strategy.generateCompact("v7");

        expect(result).toBe("compactv712377456789012345636789abc");
        expect(mockUuidv7).toHaveBeenCalledWith();
      });

      it("should generate full UUID slug", () => {
        mockUuidv4.mockReturnValue("full1234-5678-4901-2345-6789abcdef01");

        const result = strategy.generateFull();

        expect(result).toBe("full1234-5678-4901-2345-6789abcdef01");
      });

      it("should generate full UUID slug with v7", () => {
        mockUuidv7.mockReturnValue("fullv712-3456-7789-0123-456789abcdef");

        const result = strategy.generateFull("v7");

        expect(result).toBe("fullv712-3456-7789-0123-456789abcdef");
        expect(mockUuidv7).toHaveBeenCalledWith();
      });
    });
  });

  describe("isValid", () => {
    it("should validate valid UUID formats", () => {
      const validSlugs = [
        "12345678", // Short format
        "123456789abc", // Medium format
        "123456789abcdef0123456789abcdef0", // Compact format
        "12345678-1234-4567-8901-23456789abcd", // Full format
      ];

      for (const slug of validSlugs) {
        expect(strategy.isValid(slug)).toBe(true);
      }
    });

    it("should reject invalid UUID formats", () => {
      const invalidSlugs = [
        "1234567", // Too short for any format
        "123456789abcdefg", // Invalid hex character 'g'
        "12345678-1234-4567-8901", // Incomplete full format
        "12345678-1234-4567-8901-23456789abcde", // Invalid full format length
        "xyz", // Non-hex characters
        "", // Empty
      ];

      for (const slug of invalidSlugs) {
        expect(strategy.isValid(slug)).toBe(false);
      }
    });

    it("should validate against custom pattern", () => {
      expect(
        strategy.isValid("12345678", {
          pattern: /^[0-9a-f]{8}$/,
        })
      ).toBe(true);

      expect(
        strategy.isValid("12345678", {
          pattern: /^[A-Z]+$/,
        })
      ).toBe(false);
    });

    it("should handle edge case inputs", () => {
      expect(strategy.isValid(null as any)).toBe(false);
      expect(strategy.isValid(undefined as any)).toBe(false);
      expect(strategy.isValid(123 as any)).toBe(false);
      expect(strategy.isValid({} as any)).toBe(false);
    });
  });

  describe("validateDetailed", () => {
    it("should return detailed validation for valid options", () => {
      const result = strategy.validateDetailed({ length: 12, version: "v4" });

      expect(result).toEqual({
        isValid: true,
        errors: [],
        suggestions: [],
      });
    });

    it("should return errors for invalid length", () => {
      const result = strategy.validateDetailed({ length: 2 }); // Below minimum

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Slug length must be between 4 and 21 characters"
      );
      expect(result.suggestions).toContain("Try length between 4 and 21");
    });

    it("should return errors for invalid version", () => {
      const result = strategy.validateDetailed({ version: "v5" as any });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("UUID version must be v4 or v7");
      expect(result.suggestions).toContain(
        "Use v4 for random UUIDs or v7 for time-ordered UUIDs"
      );
    });

    it("should return errors for unsupported custom alphabet", () => {
      const result = strategy.validateDetailed({ alphabet: "CUSTOM123" });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Custom alphabets are not supported by UUID strategy"
      );
      expect(result.suggestions).toContain(
        "UUID strategy uses fixed hexadecimal characters"
      );
    });

    it("should handle multiple validation errors", () => {
      const result = strategy.validateDetailed({
        length: 50, // Invalid
        version: "v10" as any, // Invalid
        alphabet: "CUSTOM", // Invalid
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it("should validate existing slug with detailed errors", () => {
      // Access private method for testing
      const result = (strategy as any).validateSlugDetailed("xy", {
        length: 8,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Slug length must be between 4 and 21 characters"
      );
      expect(result.suggestions).toContain(
        expect.stringMatching(/Current length: 2.*Use format options/)
      );
    });

    it("should validate UUID format compatibility", () => {
      const result = (strategy as any).validateSlugDetailed("not-hex-chars");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Slug does not match any valid UUID format"
      );
      expect(result.suggestions).toContain(
        "UUID slugs must contain only hexadecimal characters (0-9, a-f) and optionally hyphens"
      );
    });
  });

  describe("getDefaultOptions", () => {
    it("should return default configuration", () => {
      const defaults = strategy.getDefaultOptions();

      expect(defaults).toEqual({
        length: 8,
        version: "v4",
      });
    });
  });

  describe("getSupportedFeatures", () => {
    it("should return all supported features", () => {
      const features = strategy.getSupportedFeatures();

      expect(features).toContain("guaranteed-uniqueness");
      expect(features).toContain("multiple-formats");
      expect(features).toContain("version-selection");
      expect(features).toContain("time-ordered");
      expect(features).toContain("zero-collision");
      expect(features).toContain("industry-standard");
    });
  });

  describe("getMetadata", () => {
    it("should return comprehensive strategy metadata", () => {
      const metadata = strategy.getMetadata();

      expect(metadata.name).toBe("uuid");
      expect(metadata.displayName).toBe("UUID");
      expect(metadata.category).toBe("secure");
      expect(metadata.defaultLength).toBe(8);
      expect(metadata.supportedLengths.min).toBe(8);
      expect(metadata.supportedLengths.max).toBe(36);
      expect(metadata.supportedLengths.recommended).toEqual([
        8, 12, 16, 32, 36,
      ]);
      expect(metadata.features).toContain("Globally unique");
      expect(metadata.features).toContain(
        "Multiple formats (full, short, compact)"
      );
      expect(metadata.performance.generationSpeed).toBe("medium");
      expect(metadata.performance.collisionResistance).toBe("very-high");
      expect(metadata.useCases).toContain("Enterprise applications");
      expect(metadata.useCases).toContain("Zero-collision requirements");
      expect(metadata.examples).toHaveLength(4);
      expect(metadata.configuration.supportsCustomAlphabet).toBe(false);
      expect(metadata.configuration.supportsCustomPattern).toBe(false);
      expect(metadata.configuration.supportsCustomLength).toBe(true);
    });
  });

  describe("UUID Format Validation Helper", () => {
    it("should validate various UUID formats", () => {
      const isValidUuidFormat = (strategy as any).isValidUuidFormat.bind(
        strategy
      );

      // Valid formats
      expect(isValidUuidFormat("12345678")).toBe(true); // Short
      expect(isValidUuidFormat("123456789abc")).toBe(true); // Medium
      expect(isValidUuidFormat("123456789abcdef0123456789abcdef0")).toBe(true); // Compact
      expect(isValidUuidFormat("12345678-1234-4567-8901-23456789abcd")).toBe(
        true
      ); // Full

      // Invalid formats
      expect(isValidUuidFormat("1234567")).toBe(false); // Too short
      expect(isValidUuidFormat("12345678g")).toBe(false); // Invalid hex
      expect(isValidUuidFormat("12345678-1234-4567")).toBe(false); // Incomplete
    });

    it("should handle edge cases in format validation", () => {
      const isValidUuidFormat = (strategy as any).isValidUuidFormat.bind(
        strategy
      );

      expect(isValidUuidFormat("")).toBe(false);
      expect(isValidUuidFormat("ABCDEF12")).toBe(true); // Uppercase hex
      expect(isValidUuidFormat("abcdef12")).toBe(true); // Lowercase hex
      expect(isValidUuidFormat("ABCDEF12abcdef12")).toBe(true); // Mixed case
    });
  });

  describe("Integration Tests", () => {
    it("should handle complex generation scenario", () => {
      mockUuidv7.mockReturnValue("complex1-2345-7678-9012-3456789abcde");

      const complexOptions: SlugGenerationOptions = {
        version: "v7",
        length: 16,
        pattern: /^[a-z0-9]+$/,
        metadata: { test: "value" },
      };

      const result = strategy.generate(complexOptions);

      expect(result).toBe("complex123457678"); // Medium format for length 16
      expect(mockUuidv7).toHaveBeenCalledWith();
    });

    it("should maintain consistency across multiple generations", () => {
      const results = [];

      for (let i = 0; i < 5; i++) {
        mockUuidv4.mockReturnValueOnce(
          `uuid${i}123-4567-4890-abcd-ef123456789a`
        );
        results.push(strategy.generate({ length: 8 }));
      }

      expect(results).toEqual([
        "uuid0123",
        "uuid1123",
        "uuid2123",
        "uuid3123",
        "uuid4123",
      ]);
      expect(mockUuidv4).toHaveBeenCalledTimes(5);
    });

    it("should work with all documented examples", () => {
      const metadata = strategy.getMetadata();
      const examples = metadata.examples;

      for (const example of examples) {
        const isValid = strategy.isValid(example);
        expect(isValid).toBe(true);
      }
    });

    it("should handle time-ordered UUID properties", () => {
      const timeBasedUuids = [
        "01234567-89ab-7def-8123-456789abcdef",
        "01234568-89ab-7def-8123-456789abcdef",
        "01234569-89ab-7def-8123-456789abcdef",
      ];

      mockUuidv7
        .mockReturnValueOnce(timeBasedUuids[0])
        .mockReturnValueOnce(timeBasedUuids[1])
        .mockReturnValueOnce(timeBasedUuids[2]);

      const results = [];
      for (let i = 0; i < 3; i++) {
        results.push(strategy.generateTimeOrdered(8));
      }

      // Results should maintain some temporal relationship
      expect(results).toEqual(["01234567", "01234568", "01234569"]);
    });
  });

  describe("Error Handling and Robustness", () => {
    it("should handle uuid module errors gracefully", () => {
      mockUuidv4.mockImplementation(() => {
        throw new Error("UUID module error");
      });

      expect(() => {
        strategy.generate();
      }).toThrow("UUID module error");
    });

    it("should validate strategy consistency", () => {
      expect(strategy.name).toBe("uuid");
      expect(typeof strategy.generate).toBe("function");
      expect(typeof strategy.isValid).toBe("function");
      expect(typeof strategy.getMetadata).toBe("function");
    });

    it("should handle concurrent slug generation", async () => {
      const uuids = [
        "concurrent-1234-4567-8901-23456789abc1",
        "concurrent-1234-4567-8901-23456789abc2",
        "concurrent-1234-4567-8901-23456789abc3",
      ];

      mockUuidv4
        .mockReturnValueOnce(uuids[0])
        .mockReturnValueOnce(uuids[1])
        .mockReturnValueOnce(uuids[2]);

      const results = await Promise.all([
        Promise.resolve(strategy.generate({ length: 8 })),
        Promise.resolve(strategy.generate({ length: 8 })),
        Promise.resolve(strategy.generate({ length: 8 })),
      ]);

      expect(results).toEqual(["concurrent", "concurrent", "concurrent"]);
    });

    it("should handle version validation edge cases", () => {
      const validVersions = ["v4", "v7"];
      const invalidVersions = [
        "v1",
        "v2",
        "v3",
        "v5",
        "v6",
        "v8",
        "invalid",
        "",
        null,
        undefined,
      ];

      for (const version of validVersions) {
        const result = strategy.validateDetailed({
          version: version as "v4" | "v7",
        });
        expect(result.isValid).toBe(true);
      }

      for (const version of invalidVersions) {
        const result = strategy.validateDetailed({ version: version as any });
        if (version && version !== "v4" && version !== "v7") {
          expect(result.isValid).toBe(false);
        }
      }
    });

    it("should maintain UUID format integrity", () => {
      const uuids = [
        "00000000-0000-4000-8000-000000000000", // Min values
        "ffffffff-ffff-4fff-bfff-ffffffffffff", // Max values
        "12345678-90ab-4cde-af01-23456789abcd", // Mixed values
      ];

      for (const uuid of uuids) {
        mockUuidv4.mockReturnValueOnce(uuid);

        const shortResult = strategy.generate({ length: 8 });
        expect(shortResult).toHaveLength(8);
        expect(/^[0-9a-f]{8}$/i.test(shortResult)).toBe(true);

        mockUuidv4.mockReturnValueOnce(uuid);
        const fullResult = strategy.generate({ length: 36 });
        expect(fullResult).toBe(uuid);
      }
    });
  });
});
