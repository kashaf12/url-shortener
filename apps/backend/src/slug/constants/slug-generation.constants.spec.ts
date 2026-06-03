import {
  MIN_SLUG_LENGTH,
  MAX_SLUG_LENGTH,
  DEFAULT_SLUG_LENGTH,
  ALPHANUMERIC_ALPHABET,
  URL_SAFE_ALPHABET,
  READABLE_ALPHABET,
  NANOID_DEFAULT_ALPHABET,
  ALPHABET_TYPES,
  AlphabetType,
  URL_SAFE_PATTERN,
  ALPHANUMERIC_PATTERN,
  READABLE_PATTERN,
  UUID_PATTERNS,
  PATTERN_TYPES,
  PatternType,
  MAX_COLLISION_RETRIES,
  COLLISION_LENGTH_INCREMENT,
  FALLBACK_STRATEGIES,
  ERROR_MESSAGES,
  clampSlugLength,
  isValidAlphabet,
  getAlphabetByType,
  getPatternByType,
  resolveAlphabet,
} from "./slug-generation.constants";

describe("Slug Generation Constants", () => {
  describe("Length Constants", () => {
    it("should have valid length constraints", () => {
      expect(MIN_SLUG_LENGTH).toBe(4);
      expect(MAX_SLUG_LENGTH).toBe(21);
      expect(DEFAULT_SLUG_LENGTH).toBe(7);
    });

    it("should have logical length relationships", () => {
      expect(MIN_SLUG_LENGTH).toBeLessThan(MAX_SLUG_LENGTH);
      expect(DEFAULT_SLUG_LENGTH).toBeGreaterThanOrEqual(MIN_SLUG_LENGTH);
      expect(DEFAULT_SLUG_LENGTH).toBeLessThanOrEqual(MAX_SLUG_LENGTH);
    });

    it("should be integers", () => {
      expect(Number.isInteger(MIN_SLUG_LENGTH)).toBe(true);
      expect(Number.isInteger(MAX_SLUG_LENGTH)).toBe(true);
      expect(Number.isInteger(DEFAULT_SLUG_LENGTH)).toBe(true);
    });

    it("should be positive numbers", () => {
      expect(MIN_SLUG_LENGTH).toBeGreaterThan(0);
      expect(MAX_SLUG_LENGTH).toBeGreaterThan(0);
      expect(DEFAULT_SLUG_LENGTH).toBeGreaterThan(0);
    });
  });

  describe("Alphabet Constants", () => {
    it("should define alphanumeric alphabet correctly", () => {
      expect(ALPHANUMERIC_ALPHABET).toBe(
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
      );
      expect(ALPHANUMERIC_ALPHABET).toHaveLength(62);
    });

    it("should define URL-safe alphabet correctly", () => {
      expect(URL_SAFE_ALPHABET).toBe(
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
      );
      expect(URL_SAFE_ALPHABET).toHaveLength(64);
    });

    it("should define readable alphabet correctly", () => {
      expect(READABLE_ALPHABET).toBe(
        "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz"
      );
      expect(READABLE_ALPHABET).toHaveLength(55); // 55 characters in the actual alphabet
    });

    it("should define Nanoid default alphabet correctly", () => {
      expect(NANOID_DEFAULT_ALPHABET).toBe(
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
      );
      expect(NANOID_DEFAULT_ALPHABET).toHaveLength(64);
    });

    it("should have URL-safe alphabet equal to Nanoid default", () => {
      expect(URL_SAFE_ALPHABET).toBe(NANOID_DEFAULT_ALPHABET);
    });

    it("should contain only unique characters in each alphabet", () => {
      const alphabets = [
        ALPHANUMERIC_ALPHABET,
        URL_SAFE_ALPHABET,
        READABLE_ALPHABET,
        NANOID_DEFAULT_ALPHABET,
      ];

      alphabets.forEach(alphabet => {
        const uniqueChars = new Set(alphabet).size;
        expect(uniqueChars).toBe(alphabet.length);
      });
    });

    it("should have readable alphabet exclude confusing characters", () => {
      const confusingChars = ["0", "O", "I", "l", "1"];
      confusingChars.forEach(char => {
        expect(READABLE_ALPHABET).not.toContain(char);
      });
    });

    it("should include numbers in alphanumeric alphabet", () => {
      for (let i = 0; i <= 9; i++) {
        expect(ALPHANUMERIC_ALPHABET).toContain(i.toString());
      }
    });

    it("should include uppercase letters in alphabets", () => {
      const alphabets = [
        ALPHANUMERIC_ALPHABET,
        URL_SAFE_ALPHABET,
        READABLE_ALPHABET,
      ];
      alphabets.forEach(alphabet => {
        expect(alphabet).toMatch(/[A-Z]/);
      });
    });

    it("should include lowercase letters in alphabets", () => {
      const alphabets = [
        ALPHANUMERIC_ALPHABET,
        URL_SAFE_ALPHABET,
        READABLE_ALPHABET,
      ];
      alphabets.forEach(alphabet => {
        expect(alphabet).toMatch(/[a-z]/);
      });
    });

    it("should include special characters only in URL-safe alphabets", () => {
      expect(URL_SAFE_ALPHABET).toContain("-");
      expect(URL_SAFE_ALPHABET).toContain("_");
      expect(NANOID_DEFAULT_ALPHABET).toContain("-");
      expect(NANOID_DEFAULT_ALPHABET).toContain("_");

      expect(ALPHANUMERIC_ALPHABET).not.toContain("-");
      expect(ALPHANUMERIC_ALPHABET).not.toContain("_");
      expect(READABLE_ALPHABET).not.toContain("-");
      expect(READABLE_ALPHABET).not.toContain("_");
    });
  });

  describe("Alphabet Type Mapping", () => {
    it("should map alphabet types correctly", () => {
      expect(ALPHABET_TYPES.alphanumeric).toBe(ALPHANUMERIC_ALPHABET);
      expect(ALPHABET_TYPES.urlSafe).toBe(URL_SAFE_ALPHABET);
      expect(ALPHABET_TYPES.readable).toBe(READABLE_ALPHABET);
    });

    it("should have all expected alphabet type keys", () => {
      const expectedKeys = ["alphanumeric", "urlSafe", "readable"];
      const actualKeys = Object.keys(ALPHABET_TYPES);

      expect(actualKeys).toEqual(expect.arrayContaining(expectedKeys));
      expect(actualKeys).toHaveLength(expectedKeys.length);
    });

    it("should be a const assertion", () => {
      // This test ensures the type is properly narrowed
      const testType: AlphabetType = "alphanumeric";
      expect(["alphanumeric", "urlSafe", "readable"]).toContain(testType);
    });
  });

  describe("Validation Patterns", () => {
    it("should define URL-safe pattern correctly", () => {
      expect(URL_SAFE_PATTERN).toEqual(/^[A-Za-z0-9_-]+$/);
    });

    it("should define alphanumeric pattern correctly", () => {
      expect(ALPHANUMERIC_PATTERN).toEqual(/^[A-Za-z0-9]+$/);
    });

    it("should define readable pattern correctly", () => {
      expect(READABLE_PATTERN).toEqual(
        /^[23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz]+$/
      );
    });

    it("should validate strings correctly with URL-safe pattern", () => {
      const validStrings = ["abc123", "ABC_123", "test-slug", "123_ABC-def"];
      const invalidStrings = ["abc 123", "test.slug", "slug!", "test@slug"];

      validStrings.forEach(str => {
        expect(URL_SAFE_PATTERN.test(str)).toBe(true);
      });

      invalidStrings.forEach(str => {
        expect(URL_SAFE_PATTERN.test(str)).toBe(false);
      });
    });

    it("should validate strings correctly with alphanumeric pattern", () => {
      const validStrings = ["abc123", "ABC123", "testslug", "123ABC"];
      const invalidStrings = ["abc-123", "test_slug", "slug!", "test slug"];

      validStrings.forEach(str => {
        expect(ALPHANUMERIC_PATTERN.test(str)).toBe(true);
      });

      invalidStrings.forEach(str => {
        expect(ALPHANUMERIC_PATTERN.test(str)).toBe(false);
      });
    });

    it("should validate strings correctly with readable pattern", () => {
      const validStrings = ["abc234", "ABCDEF", "testcase", "23456"]; // Using only chars from readable alphabet
      const invalidStrings = [
        "abc01",
        "testOslug",
        "slugI",
        "testL",
        "slug-test",
      ];

      validStrings.forEach(str => {
        expect(READABLE_PATTERN.test(str)).toBe(true);
      });

      invalidStrings.forEach(str => {
        expect(READABLE_PATTERN.test(str)).toBe(false);
      });
    });
  });

  describe("UUID Patterns", () => {
    it("should define UUID patterns correctly", () => {
      expect(UUID_PATTERNS.full).toEqual(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(UUID_PATTERNS.compact).toEqual(/^[0-9a-f]{32}$/i);
      expect(UUID_PATTERNS.short).toEqual(/^[0-9a-f]{8,12}$/i);
    });

    it("should validate full UUIDs correctly", () => {
      const validUUIDs = [
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
      ];

      const invalidUUIDs = [
        "550e8400-e29b-41d4-a716-44665544000", // Too short
        "550e8400-e29b-41d4-a716-4466554400000", // Too long
        "550e8400-e29b-41d4-a716-446655440000g", // Invalid character
        "550e8400e29b41d4a716446655440000", // No hyphens
      ];

      validUUIDs.forEach(uuid => {
        expect(UUID_PATTERNS.full.test(uuid)).toBe(true);
      });

      invalidUUIDs.forEach(uuid => {
        expect(UUID_PATTERNS.full.test(uuid)).toBe(false);
      });
    });

    it("should validate compact UUIDs correctly", () => {
      const validCompactUUIDs = [
        "550e8400e29b41d4a716446655440000",
        "6ba7b8109dad11d180b400c04fd430c8",
      ];

      const invalidCompactUUIDs = [
        "550e8400-e29b-41d4-a716-446655440000", // With hyphens
        "550e8400e29b41d4a716446655440000g", // Invalid character
        "550e8400e29b41d4a71644665544000", // Too short
      ];

      validCompactUUIDs.forEach(uuid => {
        expect(UUID_PATTERNS.compact.test(uuid)).toBe(true);
      });

      invalidCompactUUIDs.forEach(uuid => {
        expect(UUID_PATTERNS.compact.test(uuid)).toBe(false);
      });
    });

    it("should validate short UUIDs correctly", () => {
      const validShortUUIDs = [
        "550e8400", // 8 chars
        "550e8400e29", // 11 chars
        "550e8400e29b", // 12 chars
      ];

      const invalidShortUUIDs = [
        "550e840", // 7 chars (too short)
        "550e8400e29b1", // 13 chars (too long)
        "550e8400g29b", // Invalid character
      ];

      validShortUUIDs.forEach(uuid => {
        expect(UUID_PATTERNS.short.test(uuid)).toBe(true);
      });

      invalidShortUUIDs.forEach(uuid => {
        expect(UUID_PATTERNS.short.test(uuid)).toBe(false);
      });
    });
  });

  describe("Pattern Type Mapping", () => {
    it("should map pattern types correctly", () => {
      expect(PATTERN_TYPES.alphanumeric).toBe(ALPHANUMERIC_PATTERN);
      expect(PATTERN_TYPES.urlSafe).toBe(URL_SAFE_PATTERN);
      expect(PATTERN_TYPES.readable).toBe(READABLE_PATTERN);
    });

    it("should have all expected pattern type keys", () => {
      const expectedKeys = ["alphanumeric", "urlSafe", "readable"];
      const actualKeys = Object.keys(PATTERN_TYPES);

      expect(actualKeys).toEqual(expect.arrayContaining(expectedKeys));
      expect(actualKeys).toHaveLength(expectedKeys.length);
    });

    it("should be a const assertion", () => {
      const testType: PatternType = "alphanumeric";
      expect(["alphanumeric", "urlSafe", "readable"]).toContain(testType);
    });
  });

  describe("Collision Handling Constants", () => {
    it("should have reasonable collision retry limit", () => {
      expect(MAX_COLLISION_RETRIES).toBe(5);
      expect(MAX_COLLISION_RETRIES).toBeGreaterThan(0);
      expect(Number.isInteger(MAX_COLLISION_RETRIES)).toBe(true);
    });

    it("should have reasonable length increment", () => {
      expect(COLLISION_LENGTH_INCREMENT).toBe(1);
      expect(COLLISION_LENGTH_INCREMENT).toBeGreaterThan(0);
      expect(Number.isInteger(COLLISION_LENGTH_INCREMENT)).toBe(true);
    });

    it("should have valid fallback strategies", () => {
      expect(FALLBACK_STRATEGIES).toEqual(["nanoid", "uuid"]);
      expect(FALLBACK_STRATEGIES).toHaveLength(2);
    });

    it("should have fallback strategies as strings", () => {
      FALLBACK_STRATEGIES.forEach(strategy => {
        expect(typeof strategy).toBe("string");
        expect(strategy.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Error Messages", () => {
    it("should define error message functions", () => {
      expect(typeof ERROR_MESSAGES.INVALID_LENGTH).toBe("function");
      expect(typeof ERROR_MESSAGES.INVALID_ALPHABET).toBe("string");
      expect(typeof ERROR_MESSAGES.INVALID_PATTERN).toBe("string");
      expect(typeof ERROR_MESSAGES.INVALID_STRATEGY).toBe("function");
      expect(typeof ERROR_MESSAGES.COLLISION_EXHAUSTED).toBe("function");
    });

    it("should generate correct invalid length message", () => {
      const message = ERROR_MESSAGES.INVALID_LENGTH(4, 21);
      expect(message).toBe("Slug length must be between 4 and 21 characters");
    });

    it("should have correct invalid alphabet message", () => {
      expect(ERROR_MESSAGES.INVALID_ALPHABET).toBe(
        "Custom alphabet must contain at least 2 unique characters"
      );
    });

    it("should have correct invalid pattern message", () => {
      expect(ERROR_MESSAGES.INVALID_PATTERN).toBe(
        "Generated slug does not match the specified pattern"
      );
    });

    it("should generate correct invalid strategy message", () => {
      const message = ERROR_MESSAGES.INVALID_STRATEGY("custom", [
        "nanoid",
        "uuid",
      ]);
      expect(message).toBe(
        "Strategy 'custom' is not available. Available strategies: nanoid, uuid"
      );
    });

    it("should generate correct collision exhausted message", () => {
      const message = ERROR_MESSAGES.COLLISION_EXHAUSTED(5);
      expect(message).toBe(
        "Failed to generate unique slug after 5 attempts. Try increasing length or using a different strategy"
      );
    });

    it("should handle edge cases in error messages", () => {
      expect(ERROR_MESSAGES.INVALID_LENGTH(0, 0)).toBe(
        "Slug length must be between 0 and 0 characters"
      );
      expect(ERROR_MESSAGES.INVALID_STRATEGY("", [])).toBe(
        "Strategy '' is not available. Available strategies: "
      );
      expect(ERROR_MESSAGES.COLLISION_EXHAUSTED(0)).toBe(
        "Failed to generate unique slug after 0 attempts. Try increasing length or using a different strategy"
      );
    });
  });

  describe("Utility Functions", () => {
    describe("clampSlugLength", () => {
      it("should clamp length to valid range", () => {
        expect(clampSlugLength(3)).toBe(4); // Below minimum
        expect(clampSlugLength(7)).toBe(7); // Within range
        expect(clampSlugLength(25)).toBe(21); // Above maximum
      });

      it("should use custom min/max values", () => {
        expect(clampSlugLength(3, 5, 10)).toBe(5); // Below custom min
        expect(clampSlugLength(7, 5, 10)).toBe(7); // Within custom range
        expect(clampSlugLength(15, 5, 10)).toBe(10); // Above custom max
      });

      it("should handle float values", () => {
        expect(clampSlugLength(3.7)).toBe(4); // Floored and clamped
        expect(clampSlugLength(7.9)).toBe(7); // Floored
        expect(clampSlugLength(25.1)).toBe(21); // Floored and clamped
      });

      it("should handle edge cases", () => {
        expect(clampSlugLength(0)).toBe(4); // Zero
        expect(clampSlugLength(-5)).toBe(4); // Negative
        expect(clampSlugLength(Infinity)).toBe(4); // Infinity is not finite, should return min
        expect(clampSlugLength(-Infinity)).toBe(4); // Negative infinity
      });

      it("should handle NaN", () => {
        expect(clampSlugLength(NaN)).toBe(4); // NaN should be handled properly
      });
    });

    describe("isValidAlphabet", () => {
      it("should validate alphabet with sufficient characters", () => {
        expect(isValidAlphabet("ab")).toBe(true);
        expect(isValidAlphabet("0123456789")).toBe(true);
        expect(isValidAlphabet("abcABC")).toBe(true);
      });

      it("should reject alphabet with insufficient characters", () => {
        expect(isValidAlphabet("")).toBe(false);
        expect(isValidAlphabet("a")).toBe(false);
      });

      it("should reject duplicate characters", () => {
        expect(isValidAlphabet("aa")).toBe(false);
        expect(isValidAlphabet("aaa")).toBe(false);
        expect(isValidAlphabet("abba")).toBe(true); // 'abba' has 2 unique chars (a,b), so it's valid
      });

      it("should accept alphabet with unique characters only", () => {
        expect(isValidAlphabet("ab")).toBe(true);
        expect(isValidAlphabet("abc")).toBe(true);
        expect(isValidAlphabet("abcdef")).toBe(true);
      });

      it("should handle special characters", () => {
        expect(isValidAlphabet("!@")).toBe(true);
        expect(isValidAlphabet("a-")).toBe(true);
        expect(isValidAlphabet("1_")).toBe(true);
      });

      it("should handle edge cases", () => {
        expect(isValidAlphabet(null as any)).toBe(false);
        expect(isValidAlphabet(undefined as any)).toBe(false);
      });
    });

    describe("getAlphabetByType", () => {
      it("should return correct alphabet for each type", () => {
        expect(getAlphabetByType("alphanumeric")).toBe(ALPHANUMERIC_ALPHABET);
        expect(getAlphabetByType("urlSafe")).toBe(URL_SAFE_ALPHABET);
        expect(getAlphabetByType("readable")).toBe(READABLE_ALPHABET);
      });

      it("should return same reference as constant", () => {
        expect(getAlphabetByType("alphanumeric")).toBe(
          ALPHABET_TYPES.alphanumeric
        );
        expect(getAlphabetByType("urlSafe")).toBe(ALPHABET_TYPES.urlSafe);
        expect(getAlphabetByType("readable")).toBe(ALPHABET_TYPES.readable);
      });
    });

    describe("getPatternByType", () => {
      it("should return correct pattern for each type", () => {
        expect(getPatternByType("alphanumeric")).toBe(ALPHANUMERIC_PATTERN);
        expect(getPatternByType("urlSafe")).toBe(URL_SAFE_PATTERN);
        expect(getPatternByType("readable")).toBe(READABLE_PATTERN);
      });

      it("should return same reference as constant", () => {
        expect(getPatternByType("alphanumeric")).toBe(
          PATTERN_TYPES.alphanumeric
        );
        expect(getPatternByType("urlSafe")).toBe(PATTERN_TYPES.urlSafe);
        expect(getPatternByType("readable")).toBe(PATTERN_TYPES.readable);
      });

      it("should return RegExp objects", () => {
        expect(getPatternByType("alphanumeric")).toBeInstanceOf(RegExp);
        expect(getPatternByType("urlSafe")).toBeInstanceOf(RegExp);
        expect(getPatternByType("readable")).toBeInstanceOf(RegExp);
      });
    });

    describe("resolveAlphabet", () => {
      it("should prioritize custom alphabet", () => {
        const customAlphabet = "xy";
        expect(resolveAlphabet(customAlphabet, "alphanumeric")).toBe(
          customAlphabet
        );
        expect(resolveAlphabet(customAlphabet, "urlSafe")).toBe(customAlphabet);
        expect(resolveAlphabet(customAlphabet, "readable")).toBe(
          customAlphabet
        );
      });

      it("should use alphabet type when custom not provided", () => {
        expect(resolveAlphabet(undefined, "alphanumeric")).toBe(
          ALPHANUMERIC_ALPHABET
        );
        expect(resolveAlphabet(undefined, "urlSafe")).toBe(URL_SAFE_ALPHABET);
        expect(resolveAlphabet(undefined, "readable")).toBe(READABLE_ALPHABET);
      });

      it("should default to URL-safe alphabet", () => {
        expect(resolveAlphabet()).toBe(URL_SAFE_ALPHABET);
        expect(resolveAlphabet(undefined, undefined)).toBe(URL_SAFE_ALPHABET);
        expect(resolveAlphabet("", undefined)).toBe(URL_SAFE_ALPHABET); // Empty string is falsy
      });

      it("should validate custom alphabet", () => {
        expect(() => resolveAlphabet("a")).toThrow(
          ERROR_MESSAGES.INVALID_ALPHABET
        );
        expect(() => resolveAlphabet("")).not.toThrow(); // Empty string is falsy, uses default
        expect(() => resolveAlphabet("aa")).toThrow(
          ERROR_MESSAGES.INVALID_ALPHABET
        );
      });

      it("should handle invalid alphabet type gracefully", () => {
        expect(resolveAlphabet(undefined, "invalid" as AlphabetType)).toBe(
          URL_SAFE_ALPHABET
        );
      });

      it("should work with all predefined alphabets", () => {
        expect(() => resolveAlphabet(ALPHANUMERIC_ALPHABET)).not.toThrow();
        expect(() => resolveAlphabet(URL_SAFE_ALPHABET)).not.toThrow();
        expect(() => resolveAlphabet(READABLE_ALPHABET)).not.toThrow();
        expect(() => resolveAlphabet(NANOID_DEFAULT_ALPHABET)).not.toThrow();
      });
    });
  });

  describe("Integration tests", () => {
    it("should have consistent alphabet types and patterns", () => {
      // Test that each alphabet type has a corresponding pattern type
      Object.keys(ALPHABET_TYPES).forEach(key => {
        expect(PATTERN_TYPES).toHaveProperty(key);
      });

      Object.keys(PATTERN_TYPES).forEach(key => {
        expect(ALPHABET_TYPES).toHaveProperty(key);
      });
    });

    it("should have patterns that match their corresponding alphabets", () => {
      // Generate test strings from each alphabet and verify they match the pattern
      Object.keys(ALPHABET_TYPES).forEach(key => {
        const alphabet = ALPHABET_TYPES[key as AlphabetType];
        const pattern = PATTERN_TYPES[key as PatternType];

        // Test with single characters from the alphabet
        for (const char of alphabet) {
          expect(pattern.test(char)).toBe(true);
        }

        // Test with combinations
        const testString = alphabet.substring(0, 10);
        expect(pattern.test(testString)).toBe(true);
      });
    });

    it("should have valid default values within constraints", () => {
      expect(DEFAULT_SLUG_LENGTH).toBeGreaterThanOrEqual(MIN_SLUG_LENGTH);
      expect(DEFAULT_SLUG_LENGTH).toBeLessThanOrEqual(MAX_SLUG_LENGTH);

      expect(clampSlugLength(DEFAULT_SLUG_LENGTH)).toBe(DEFAULT_SLUG_LENGTH);
    });

    it("should have collision constants that make sense together", () => {
      expect(COLLISION_LENGTH_INCREMENT).toBeLessThan(
        MAX_SLUG_LENGTH - MIN_SLUG_LENGTH
      );
      expect(MAX_COLLISION_RETRIES * COLLISION_LENGTH_INCREMENT).toBeLessThan(
        MAX_SLUG_LENGTH
      );
    });

    it("should have fallback strategies that are valid identifiers", () => {
      FALLBACK_STRATEGIES.forEach(strategy => {
        expect(strategy).toMatch(/^[a-z]+$/); // Only lowercase letters
        expect(strategy.length).toBeGreaterThan(2);
      });
    });
  });

  describe("Performance", () => {
    it("should have efficient alphabet lookups", () => {
      const startTime = Date.now();

      for (let i = 0; i < 10000; i++) {
        getAlphabetByType("alphanumeric");
        getAlphabetByType("urlSafe");
        getAlphabetByType("readable");
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });

    it("should have efficient pattern lookups", () => {
      const startTime = Date.now();

      for (let i = 0; i < 10000; i++) {
        getPatternByType("alphanumeric");
        getPatternByType("urlSafe");
        getPatternByType("readable");
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });

    it("should have efficient alphabet validation", () => {
      const testAlphabets = [
        "ab",
        "abc",
        "abcd",
        "abcdef",
        "abcdefghij",
        ALPHANUMERIC_ALPHABET,
        URL_SAFE_ALPHABET,
        READABLE_ALPHABET,
      ];

      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        testAlphabets.forEach(alphabet => {
          isValidAlphabet(alphabet);
        });
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
