import { NanoidSlugStrategy } from "./nanoid.strategy";
import { SlugGenerationOptions } from "./slug-generation.interface";
import { nanoid, customAlphabet } from "nanoid";

// Mock nanoid functions
jest.mock("nanoid", () => ({
  nanoid: jest.fn(),
  customAlphabet: jest.fn(),
}));

describe("NanoidSlugStrategy", () => {
  let strategy: NanoidSlugStrategy;
  const mockNanoid = nanoid as jest.MockedFunction<typeof nanoid>;
  const mockCustomAlphabet = customAlphabet as jest.MockedFunction<
    typeof customAlphabet
  >;

  beforeEach(() => {
    strategy = new NanoidSlugStrategy();
    jest.clearAllMocks();

    // Default mock implementations
    mockNanoid.mockReturnValue("nanoid123");
    mockCustomAlphabet.mockReturnValue(() => "custom123");
  });

  describe("generate", () => {
    describe("Basic Generation", () => {
      it("should generate slug with default nanoid", () => {
        mockNanoid.mockReturnValue("abc12def");

        const result = strategy.generate();

        expect(result).toBe("abc12def");
        expect(mockNanoid).toHaveBeenCalledWith(7); // Default length
        expect(mockCustomAlphabet).not.toHaveBeenCalled();
      });

      it("should generate slug with specified length", () => {
        mockNanoid.mockReturnValue("abcd1234");

        const result = strategy.generate({ length: 8 });

        expect(result).toBe("abcd1234");
        expect(mockNanoid).toHaveBeenCalledWith(8);
      });

      it("should generate slug with custom alphabet", () => {
        const customFunc = jest.fn().mockReturnValue("CUSTOM123");
        mockCustomAlphabet.mockReturnValue(customFunc);

        const result = strategy.generate({
          alphabet: "ABCD1234",
          length: 8,
        });

        expect(result).toBe("CUSTOM123");
        expect(mockCustomAlphabet).toHaveBeenCalledWith("ABCD1234", 8);
        expect(customFunc).toHaveBeenCalledWith();
        expect(mockNanoid).not.toHaveBeenCalled();
      });
    });

    describe("Length Processing", () => {
      it("should clamp length to minimum", () => {
        mockNanoid.mockReturnValue("abcd");

        const result = strategy.generate({ length: 2 }); // Below minimum

        expect(result).toBe("abcd");
        expect(mockNanoid).toHaveBeenCalledWith(4); // Clamped to minimum
      });

      it("should clamp length to maximum", () => {
        mockNanoid.mockReturnValue("a".repeat(21));

        const result = strategy.generate({ length: 50 }); // Above maximum

        expect(result).toBe("a".repeat(21));
        expect(mockNanoid).toHaveBeenCalledWith(21); // Clamped to maximum
      });

      it("should handle floating point lengths", () => {
        mockNanoid.mockReturnValue("slug12");

        const result = strategy.generate({ length: 6.7 });

        expect(result).toBe("slug12");
        expect(mockNanoid).toHaveBeenCalledWith(6); // Floored
      });

      it("should handle negative lengths", () => {
        mockNanoid.mockReturnValue("abcd");

        const result = strategy.generate({ length: -5 });

        expect(result).toBe("abcd");
        expect(mockNanoid).toHaveBeenCalledWith(4); // Clamped to minimum
      });
    });

    describe("Alphabet Processing", () => {
      it("should resolve alphabet from alphabetType", () => {
        const customFunc = jest.fn().mockReturnValue("readable123");
        mockCustomAlphabet.mockReturnValue(customFunc);

        strategy.generate({ alphabetType: "readable", length: 8 });

        expect(mockCustomAlphabet).toHaveBeenCalledWith(
          expect.stringMatching(
            /^[23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz]+$/
          ),
          8
        );
      });

      it("should prioritize custom alphabet over alphabetType", () => {
        const customFunc = jest.fn().mockReturnValue("priority123");
        mockCustomAlphabet.mockReturnValue(customFunc);

        strategy.generate({
          alphabet: "PRIORITY",
          alphabetType: "readable", // Should be ignored
          length: 8,
        });

        expect(mockCustomAlphabet).toHaveBeenCalledWith("PRIORITY", 8);
      });

      it("should validate custom alphabet", () => {
        expect(() => {
          strategy.generate({ alphabet: "A" }); // Single character
        }).toThrow("Custom alphabet must contain at least 2 unique characters");

        expect(() => {
          strategy.generate({ alphabet: "" }); // Empty
        }).toThrow("Custom alphabet must contain at least 2 unique characters");
      });

      it("should handle all alphabetTypes", () => {
        const alphabetTypes = ["alphanumeric", "urlSafe", "readable"] as const;
        const customFunc = jest.fn().mockReturnValue("test123");
        mockCustomAlphabet.mockReturnValue(customFunc);

        for (const alphabetType of alphabetTypes) {
          strategy.generate({ alphabetType });

          // Should have called customAlphabet with appropriate alphabet
          expect(mockCustomAlphabet).toHaveBeenCalledWith(
            expect.any(String),
            7
          );

          mockCustomAlphabet.mockClear();
        }
      });
    });

    describe("Pattern Validation", () => {
      it("should validate pattern after generation with default nanoid", () => {
        mockNanoid.mockReturnValue("123abc"); // Contains numbers and letters

        const result = strategy.generate({
          pattern: /^[a-z]+$/, // Only lowercase letters
        });

        // Should attempt to generate with compatible alphabet
        expect(mockCustomAlphabet).toHaveBeenCalled();
      });

      it("should validate pattern with custom alphabet", () => {
        const customFunc = jest
          .fn()
          .mockReturnValueOnce("123ABC") // First try - doesn't match pattern
          .mockReturnValueOnce("abcdef"); // Fallback try - matches
        mockCustomAlphabet.mockReturnValue(customFunc);

        const result = strategy.generate({
          alphabet: "ABC123def",
          pattern: /^[a-z]+$/, // Only lowercase letters
        });

        expect(result).toBe("abcdef");
        expect(customFunc).toHaveBeenCalledTimes(2);
      });

      it("should throw error when pattern cannot be satisfied", () => {
        const customFunc = jest.fn().mockReturnValue("123ABC");
        mockCustomAlphabet.mockReturnValue(customFunc);

        expect(() => {
          strategy.generate({
            alphabet: "123ABC", // No lowercase letters
            pattern: /^[a-z]+$/, // Requires lowercase letters
          });
        }).toThrow("Unable to generate slug matching pattern");
      });

      it("should resolve pattern from patternType", () => {
        mockNanoid.mockReturnValue("slug123");

        strategy.generate({ patternType: "alphanumeric" });

        // Should use default nanoid since generated slug matches alphanumeric pattern
        expect(mockNanoid).toHaveBeenCalled();
      });

      it("should prioritize custom pattern over patternType", () => {
        const customFunc = jest.fn().mockReturnValue("PATTERN");
        mockCustomAlphabet.mockReturnValue(customFunc);
        mockNanoid.mockReturnValue("invalid123");

        const result = strategy.generate({
          pattern: /^[A-Z]+$/, // Custom pattern - uppercase only
          patternType: "readable", // Should be ignored
          alphabet: "ABCDEFG",
        });

        expect(result).toBe("PATTERN");
      });

      it("should handle complex regex patterns", () => {
        const customFunc = jest.fn().mockReturnValue("Aa1Bb2");
        mockCustomAlphabet.mockReturnValue(customFunc);

        const complexPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/; // Must have lower, upper, and digit

        const result = strategy.generate({
          alphabet: "ABCabc123",
          pattern: complexPattern,
        });

        expect(result).toBe("Aa1Bb2");
      });
    });

    describe("Edge Cases", () => {
      it("should handle undefined options", () => {
        mockNanoid.mockReturnValue("default123");

        const result = strategy.generate(undefined);

        expect(result).toBe("default123");
        expect(mockNanoid).toHaveBeenCalledWith(7);
      });

      it("should handle empty options object", () => {
        mockNanoid.mockReturnValue("empty123");

        const result = strategy.generate({});

        expect(result).toBe("empty123");
        expect(mockNanoid).toHaveBeenCalledWith(7);
      });

      it("should handle options with all undefined values", () => {
        mockNanoid.mockReturnValue("undef123");

        const result = strategy.generate({
          length: undefined,
          alphabet: undefined,
          alphabetType: undefined,
          pattern: undefined,
          patternType: undefined,
        });

        expect(result).toBe("undef123");
        expect(mockNanoid).toHaveBeenCalledWith(7);
      });

      it("should handle nanoid generation errors", () => {
        mockNanoid.mockImplementation(() => {
          throw new Error("Nanoid generation failed");
        });

        expect(() => {
          strategy.generate();
        }).toThrow("Nanoid generation failed");
      });

      it("should handle custom alphabet generation errors", () => {
        const customFunc = jest.fn().mockImplementation(() => {
          throw new Error("Custom generation failed");
        });
        mockCustomAlphabet.mockReturnValue(customFunc);

        expect(() => {
          strategy.generate({ alphabet: "ABC123" });
        }).toThrow("Custom generation failed");
      });
    });

    describe("Convenience Methods", () => {
      it("should generate secure slug with longer length", () => {
        mockNanoid.mockReturnValue("secure12345");

        const result = strategy.generateSecure();

        expect(result).toBe("secure12345");
        expect(mockNanoid).toHaveBeenCalledWith(11); // Default secure length
      });

      it("should generate secure slug with custom length", () => {
        mockNanoid.mockReturnValue("sec123456789");

        const result = strategy.generateSecure(12);

        expect(result).toBe("sec123456789");
        expect(mockNanoid).toHaveBeenCalledWith(12);
      });

      it("should generate readable slug", () => {
        const customFunc = jest.fn().mockReturnValue("readable");
        mockCustomAlphabet.mockReturnValue(customFunc);

        const result = strategy.generateReadable();

        expect(result).toBe("readable");
        expect(mockCustomAlphabet).toHaveBeenCalledWith(
          expect.stringMatching(
            /^[23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz]+$/
          ),
          8
        );
      });

      it("should generate readable slug with custom length", () => {
        const customFunc = jest.fn().mockReturnValue("read12");
        mockCustomAlphabet.mockReturnValue(customFunc);

        const result = strategy.generateReadable(6);

        expect(result).toBe("read12");
        expect(mockCustomAlphabet).toHaveBeenCalledWith(expect.any(String), 6);
      });

      it("should generate custom alphabet slug", () => {
        const customFunc = jest.fn().mockReturnValue("CUSTOMIZED");
        mockCustomAlphabet.mockReturnValue(customFunc);

        const result = strategy.generateCustom("CUSTOM123", 10);

        expect(result).toBe("CUSTOMIZED");
        expect(mockCustomAlphabet).toHaveBeenCalledWith("CUSTOM123", 10);
      });

      it("should generate custom alphabet slug with default length", () => {
        const customFunc = jest.fn().mockReturnValue("CUSTOM");
        mockCustomAlphabet.mockReturnValue(customFunc);

        const result = strategy.generateCustom("CUSTOM123");

        expect(result).toBe("CUSTOM");
        expect(mockCustomAlphabet).toHaveBeenCalledWith("CUSTOM123", 7);
      });
    });
  });

  describe("isValid", () => {
    it("should validate valid slug", () => {
      const result = strategy.isValid("valid-slug-123");

      expect(result).toBe(true);
    });

    it("should reject slug below minimum length", () => {
      const result = strategy.isValid("abc"); // Length 3, minimum is 4

      expect(result).toBe(false);
    });

    it("should reject slug above maximum length", () => {
      const longSlug = "a".repeat(25); // Above maximum of 21
      const result = strategy.isValid(longSlug);

      expect(result).toBe(false);
    });

    it("should validate with custom pattern", () => {
      const result = strategy.isValid("UPPERCASE", {
        pattern: /^[A-Z]+$/,
      });

      expect(result).toBe(true);
    });

    it("should reject slug not matching pattern", () => {
      const result = strategy.isValid("lowercase", {
        pattern: /^[A-Z]+$/,
      });

      expect(result).toBe(false);
    });

    it("should validate with patternType", () => {
      const result = strategy.isValid("alphanumeric123", {
        patternType: "alphanumeric",
      });

      expect(result).toBe(true);
    });

    it("should validate with custom alphabet compatibility", () => {
      const result = strategy.isValid("ABC123", {
        alphabet: "ABC123DEF",
      });

      expect(result).toBe(true);
    });

    it("should reject slug incompatible with alphabet", () => {
      const result = strategy.isValid("xyz", {
        alphabet: "ABC123", // Doesn't contain x, y, z
      });

      expect(result).toBe(false);
    });

    it("should handle edge case inputs", () => {
      expect(strategy.isValid("")).toBe(false);
      expect(strategy.isValid(null as any)).toBe(false);
      expect(strategy.isValid(undefined as any)).toBe(false);
      expect(strategy.isValid(123 as any)).toBe(false);
    });
  });

  describe("validateDetailed", () => {
    it("should return detailed validation for valid options", () => {
      const result = strategy.validateDetailed({
        length: 8,
        alphabet: "ABC123",
      });

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

    it("should return errors for invalid alphabet", () => {
      const result = strategy.validateDetailed({ alphabet: "A" }); // Single character

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Custom alphabet must contain at least 2 unique characters"
      );
      expect(result.suggestions).toContain(
        "Ensure alphabet has at least 2 unique characters"
      );
    });

    it("should handle multiple validation errors", () => {
      const result = strategy.validateDetailed({
        length: 50, // Invalid
        alphabet: "X", // Invalid
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it("should validate existing slug with detailed errors", () => {
      // Access private method through type assertion for testing
      const result = (strategy as any).validateSlugDetailed("ab", {
        length: 8,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Slug length must be between 4 and 21 characters"
      );
      expect(result.suggestions).toContain(
        expect.stringMatching(/Current length: 2.*between 4 and 21/)
      );
    });

    it("should provide pattern-specific suggestions", () => {
      const result = (strategy as any).validateSlugDetailed("invalid@slug", {
        patternType: "alphanumeric",
      });

      expect(result.isValid).toBe(false);
      expect(result.suggestions).toContain(
        "Slug contains invalid characters for pattern"
      );
    });
  });

  describe("getDefaultOptions", () => {
    it("should return default configuration", () => {
      const defaults = strategy.getDefaultOptions();

      expect(defaults).toEqual({
        length: 7,
        alphabetType: "urlSafe",
        patternType: "urlSafe",
      });
    });
  });

  describe("getSupportedFeatures", () => {
    it("should return all supported features", () => {
      const features = strategy.getSupportedFeatures();

      expect(features).toContain("variable-length");
      expect(features).toContain("custom-alphabet");
      expect(features).toContain("pattern-validation");
      expect(features).toContain("high-collision-resistance");
      expect(features).toContain("url-safe");
      expect(features).toContain("fast-generation");
      expect(features).toContain("alphabet-types");
      expect(features).toContain("pattern-types");
    });
  });

  describe("getMetadata", () => {
    it("should return comprehensive strategy metadata", () => {
      const metadata = strategy.getMetadata();

      expect(metadata.name).toBe("nanoid");
      expect(metadata.displayName).toBe("NanoID");
      expect(metadata.category).toBe("secure");
      expect(metadata.defaultLength).toBe(7);
      expect(metadata.supportedLengths.min).toBe(4);
      expect(metadata.supportedLengths.max).toBe(21);
      expect(metadata.supportedLengths.recommended).toEqual([6, 7, 8, 10, 12]);
      expect(metadata.features).toContain("URL-safe by default");
      expect(metadata.features).toContain("Cryptographically strong");
      expect(metadata.performance.generationSpeed).toBe("fast");
      expect(metadata.performance.collisionResistance).toBe("very-high");
      expect(metadata.useCases).toContain("General purpose URL shortening");
      expect(metadata.examples).toHaveLength(4);
      expect(metadata.configuration.supportsCustomAlphabet).toBe(true);
      expect(metadata.configuration.supportsCustomPattern).toBe(true);
    });
  });

  describe("Pattern Compatibility Helper", () => {
    it("should find compatible alphabet for simple patterns", () => {
      const getPatternCompatibleAlphabet = (
        strategy as any
      ).getPatternCompatibleAlphabet.bind(strategy);

      const numericPattern = /^[0-9]+$/;
      const result = getPatternCompatibleAlphabet(numericPattern);

      expect(result).toContain("0");
      expect(result).toContain("9");
      expect(result).not.toContain("A");
    });

    it("should return null for impossible patterns", () => {
      const getPatternCompatibleAlphabet = (
        strategy as any
      ).getPatternCompatibleAlphabet.bind(strategy);

      const impossiblePattern = /^[γδθ]+$/; // Greek letters not in any standard alphabet
      const result = getPatternCompatibleAlphabet(impossiblePattern);

      expect(result).toBeNull();
    });

    it("should filter alphabet to pattern-compatible characters", () => {
      const getPatternCompatibleAlphabet = (
        strategy as any
      ).getPatternCompatibleAlphabet.bind(strategy);

      const uppercasePattern = /^[A-Z]+$/;
      const result = getPatternCompatibleAlphabet(uppercasePattern);

      expect(result).toMatch(/^[A-Z]*$/); // Only uppercase letters
    });
  });

  describe("Alphabet Compatibility Helper", () => {
    it("should check slug compatibility with alphabet", () => {
      const isSlugCompatibleWithAlphabet = (
        strategy as any
      ).isSlugCompatibleWithAlphabet.bind(strategy);

      expect(isSlugCompatibleWithAlphabet("ABC123", "ABC123DEF")).toBe(true);
      expect(isSlugCompatibleWithAlphabet("XYZ", "ABC123")).toBe(false);
    });

    it("should handle empty inputs", () => {
      const isSlugCompatibleWithAlphabet = (
        strategy as any
      ).isSlugCompatibleWithAlphabet.bind(strategy);

      expect(isSlugCompatibleWithAlphabet("", "ABC")).toBe(true); // Empty slug is compatible
      expect(isSlugCompatibleWithAlphabet("ABC", "")).toBe(false); // No alphabet means incompatible
    });

    it("should handle special characters", () => {
      const isSlugCompatibleWithAlphabet = (
        strategy as any
      ).isSlugCompatibleWithAlphabet.bind(strategy);

      const specialAlphabet = "ABC-_123";
      expect(isSlugCompatibleWithAlphabet("A-B_1", specialAlphabet)).toBe(true);
      expect(isSlugCompatibleWithAlphabet("A@B", specialAlphabet)).toBe(false);
    });
  });

  describe("Integration Tests", () => {
    it("should handle complex generation scenario", () => {
      const customFunc = jest.fn().mockReturnValue("Complex123");
      mockCustomAlphabet.mockReturnValue(customFunc);

      const complexOptions: SlugGenerationOptions = {
        length: 10,
        alphabet: "Complex123ABC",
        pattern: /^[A-Za-z0-9]+$/,
        metadata: { test: "value" },
        deduplicate: true,
      };

      const result = strategy.generate(complexOptions);

      expect(result).toBe("Complex123");
      expect(mockCustomAlphabet).toHaveBeenCalledWith("Complex123ABC", 10);
    });

    it("should maintain consistency across multiple generations", () => {
      const results = [];

      for (let i = 0; i < 5; i++) {
        mockNanoid.mockReturnValueOnce(`slug${i}`);
        results.push(strategy.generate({ length: 8 }));
      }

      expect(results).toEqual(["slug0", "slug1", "slug2", "slug3", "slug4"]);
      expect(mockNanoid).toHaveBeenCalledTimes(5);
      results.forEach(() => {
        expect(mockNanoid).toHaveBeenCalledWith(8);
      });
    });

    it("should handle performance requirements", () => {
      // Test that strategy doesn't perform unnecessary computations
      mockNanoid.mockReturnValue("performance");

      const startTime = process.hrtime.bigint();

      for (let i = 0; i < 100; i++) {
        strategy.generate({ length: 7 });
      }

      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1000000;

      // Should complete 100 generations in under 100ms (very generous)
      expect(durationMs).toBeLessThan(100);
    });

    it("should work with all documented examples", () => {
      const metadata = strategy.getMetadata();
      const examples = metadata.examples;

      for (const example of examples) {
        const isValid = strategy.isValid(example);
        expect(isValid).toBe(true);
      }
    });
  });

  describe("Error Handling and Robustness", () => {
    it("should handle nanoid module errors gracefully", () => {
      mockNanoid.mockImplementation(() => {
        throw new Error("Module error");
      });

      expect(() => {
        strategy.generate();
      }).toThrow("Module error");
    });

    it("should validate inputs thoroughly", () => {
      const invalidInputs = [
        { length: NaN },
        { length: Infinity },
        { alphabet: null },
        { pattern: "not-a-regex" as any },
      ];

      for (const invalidInput of invalidInputs) {
        expect(() => {
          strategy.generate(invalidInput);
        }).toThrow();
      }
    });

    it("should maintain strategy consistency", () => {
      expect(strategy.name).toBe("nanoid");
      expect(typeof strategy.generate).toBe("function");
      expect(typeof strategy.isValid).toBe("function");
      expect(typeof strategy.getMetadata).toBe("function");
    });
  });
});
