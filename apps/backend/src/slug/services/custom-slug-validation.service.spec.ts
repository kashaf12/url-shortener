import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { CustomSlugValidationService } from "./custom-slug-validation.service";
import { SlugCollisionCheckerFn } from "../interfaces/slug-collision-checker.interface";
import { CustomSlugValidationResult } from "@url-shortener/types";

describe("CustomSlugValidationService", () => {
  let service: CustomSlugValidationService;
  let configService: jest.Mocked<ConfigService>;
  let mockCollisionChecker: jest.MockedFunction<SlugCollisionCheckerFn>;

  beforeEach(async () => {
    mockCollisionChecker = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomSlugValidationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest
              .fn()
              .mockImplementation((key: string, defaultValue?: any) => {
                if (key === "RESERVED_SLUGS") {
                  return "api,admin,www,app,docs,health,status,metrics,dashboard";
                }
                return defaultValue;
              }),
          },
        },
      ],
    }).compile();

    service = module.get<CustomSlugValidationService>(
      CustomSlugValidationService
    );
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validateCustomSlug", () => {
    beforeEach(() => {
      mockCollisionChecker.mockResolvedValue(false); // No collision by default
    });

    describe("Valid Slug Cases", () => {
      it("should validate simple valid slug", async () => {
        const result = await service.validateCustomSlug(
          "valid-slug",
          mockCollisionChecker
        );

        expect(result).toEqual({
          isValid: true,
          slug: "valid-slug",
          errors: [],
          warnings: [],
          suggestions: [],
          normalizedSlug: undefined,
        });
      });

      it("should validate slug with numbers", async () => {
        const result = await service.validateCustomSlug(
          "slug123",
          mockCollisionChecker
        );

        expect(result.isValid).toBe(true);
        expect(result.slug).toBe("slug123");
      });

      it("should validate slug with underscores", async () => {
        const result = await service.validateCustomSlug(
          "slug_with_underscores",
          mockCollisionChecker
        );

        expect(result.isValid).toBe(true);
        expect(result.slug).toBe("slug_with_underscores");
      });

      it("should validate minimum length slug", async () => {
        const result = await service.validateCustomSlug(
          "abcd", // Minimum length is 4
          mockCollisionChecker
        );

        expect(result.isValid).toBe(true);
        expect(result.slug).toBe("abcd");
      });

      it("should validate maximum length slug", async () => {
        const maxLengthSlug = "a".repeat(21); // Maximum length is 21
        const result = await service.validateCustomSlug(
          maxLengthSlug,
          mockCollisionChecker
        );

        expect(result.isValid).toBe(true);
        expect(result.slug).toBe(maxLengthSlug);
      });
    });

    describe("Auto-normalization", () => {
      it("should normalize slug when autoNormalize is true", async () => {
        const result = await service.validateCustomSlug(
          "  Mixed_CASE Slug  ",
          mockCollisionChecker,
          { autoNormalize: true }
        );

        expect(result.isValid).toBe(true);
        expect(result.slug).toBe("mixed-case-slug");
        expect(result.normalizedSlug).toBe("mixed-case-slug");
      });

      it("should not normalize when autoNormalize is false", async () => {
        const result = await service.validateCustomSlug(
          "Mixed_CASE",
          mockCollisionChecker,
          { autoNormalize: false }
        );

        expect(result.slug).toBe("Mixed_CASE");
        expect(result.normalizedSlug).toBeUndefined();
      });

      it("should normalize special characters", async () => {
        const result = await service.validateCustomSlug(
          "slug@with#special$chars",
          mockCollisionChecker,
          { autoNormalize: true }
        );

        expect(result.slug).toBe("slugwithspecialchars");
        expect(result.normalizedSlug).toBe("slugwithspecialchars");
      });

      it("should handle multiple spaces and underscores", async () => {
        const result = await service.validateCustomSlug(
          "slug   with    spaces___and___underscores",
          mockCollisionChecker,
          { autoNormalize: true }
        );

        expect(result.slug).toBe("slug-with-spaces-and-underscores");
      });

      it("should remove leading and trailing hyphens", async () => {
        const result = await service.validateCustomSlug(
          "--leading-and-trailing--",
          mockCollisionChecker,
          { autoNormalize: true }
        );

        expect(result.slug).toBe("leading-and-trailing");
      });

      it("should truncate to max length during normalization", async () => {
        const longSlug = "a".repeat(30) + "-suffix";
        const result = await service.validateCustomSlug(
          longSlug,
          mockCollisionChecker,
          { autoNormalize: true }
        );

        expect(result.slug.length).toBe(21);
        expect(result.slug).toBe("a".repeat(21));
      });
    });

    describe("Length Validation", () => {
      it("should reject slug below minimum length", async () => {
        const result = await service.validateCustomSlug(
          "ab", // Below minimum of 4
          mockCollisionChecker
        );

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          "Slug must be at least 4 characters long"
        );
        expect(result.suggestions).toContain("Consider using: ab00");
      });

      it("should reject empty slug", async () => {
        const result = await service.validateCustomSlug(
          "",
          mockCollisionChecker
        );

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Slug cannot be empty");
      });

      it("should reject slug above maximum length", async () => {
        const longSlug = "a".repeat(25); // Above maximum of 21
        const result = await service.validateCustomSlug(
          longSlug,
          mockCollisionChecker
        );

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          "Slug cannot be longer than 21 characters"
        );
        expect(result.suggestions).toContain(
          `Consider using: ${"a".repeat(21)}`
        );
      });
    });

    describe("Basic Requirements Validation", () => {
      it("should reject non-string input", async () => {
        const result = await service.validateCustomSlug(
          123 as any,
          mockCollisionChecker
        );

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Slug must be a string");
      });

      it("should reject null input", async () => {
        const result = await service.validateCustomSlug(
          null as any,
          mockCollisionChecker
        );

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Slug cannot be empty");
      });

      it("should reject undefined input", async () => {
        const result = await service.validateCustomSlug(
          undefined as any,
          mockCollisionChecker
        );

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Slug cannot be empty");
      });

      it("should reject slug with leading/trailing whitespace", async () => {
        const result = await service.validateCustomSlug(
          "  valid-slug  ",
          mockCollisionChecker
        );

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          "Slug cannot have leading or trailing whitespace"
        );
      });
    });

    describe("Pattern Validation", () => {
      it("should validate against default URL-safe pattern", async () => {
        const result = await service.validateCustomSlug(
          "invalid@characters!",
          mockCollisionChecker
        );

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Slug contains invalid characters");
        expect(result.suggestions).toContain(
          "Only letters, numbers, hyphens, and underscores are allowed"
        );
      });

      it("should validate against alphanumeric pattern", async () => {
        const result = await service.validateCustomSlug(
          "slug-with-hyphen",
          mockCollisionChecker,
          { patternType: "alphanumeric" }
        );

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Slug contains invalid characters");
        expect(result.suggestions).toContain(
          "Only letters and numbers are allowed"
        );
        expect(result.suggestions).toContain("Try: slugwithhyphen");
      });

      it("should validate against readable pattern", async () => {
        const result = await service.validateCustomSlug(
          "slug0O1Il", // Contains confusing characters
          mockCollisionChecker,
          { patternType: "readable" }
        );

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Slug contains invalid characters");
        expect(result.suggestions).toContain(
          "Only readable characters are allowed (excludes 0, O, I, l, 1)"
        );
      });

      it("should validate against custom regex pattern", async () => {
        const customPattern = /^[A-Z]+$/; // Only uppercase letters
        const result = await service.validateCustomSlug(
          "lowercase",
          mockCollisionChecker,
          { pattern: customPattern }
        );

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Slug contains invalid characters");
      });

      it("should pass validation with matching custom pattern", async () => {
        const customPattern = /^[A-Z]+$/;
        const result = await service.validateCustomSlug(
          "UPPERCASE",
          mockCollisionChecker,
          { pattern: customPattern }
        );

        expect(result.isValid).toBe(true);
      });

      it("should prioritize custom pattern over patternType", async () => {
        const customPattern = /^[0-9]+$/; // Only numbers
        const result = await service.validateCustomSlug(
          "123456",
          mockCollisionChecker,
          {
            pattern: customPattern,
            patternType: "alphanumeric", // This should be ignored
          }
        );

        expect(result.isValid).toBe(true);
      });
    });

    describe("Reserved Words Validation", () => {
      const reservedWords = [
        "api",
        "admin",
        "www",
        "app",
        "docs",
        "health",
        "status",
        "metrics",
        "dashboard",
      ];

      it.each(reservedWords)(
        "should reject reserved word: %s",
        async reservedWord => {
          const result = await service.validateCustomSlug(
            reservedWord,
            mockCollisionChecker
          );

          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            `'${reservedWord}' is a reserved slug and cannot be used`
          );
          expect(result.suggestions).toContain(`${reservedWord}-link`);
          expect(result.suggestions).toContain(`${reservedWord}-url`);
          expect(result.suggestions).toContain(`my-${reservedWord}`);
        }
      );

      it("should handle case-insensitive reserved words", async () => {
        const result = await service.validateCustomSlug(
          "API", // Uppercase version of reserved word
          mockCollisionChecker
        );

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          "'API' is a reserved slug and cannot be used"
        );
      });

      it("should allow reserved words when allowReservedWords is true", async () => {
        const result = await service.validateCustomSlug(
          "api",
          mockCollisionChecker,
          { allowReservedWords: true }
        );

        expect(result.isValid).toBe(true);
        expect(result.errors.length).toBe(0);
        expect(result.errors).not.toContain(
          expect.stringMatching(/reserved slug/)
        );
      });

      it("should warn about partial reserved word matches", async () => {
        const result = await service.validateCustomSlug(
          "api-endpoint",
          mockCollisionChecker
        );

        expect(result.isValid).toBe(true); // Not fully reserved
        expect(result.warnings).toContain(
          "Slug contains reserved word 'api' which may cause confusion"
        );
      });

      it("should handle multiple partial reserved word matches", async () => {
        const result = await service.validateCustomSlug(
          "admin-api-docs",
          mockCollisionChecker
        );

        expect(result.warnings).toContain(
          "Slug contains reserved word 'admin' which may cause confusion"
        );
        expect(result.warnings).toContain(
          "Slug contains reserved word 'api' which may cause confusion"
        );
        expect(result.warnings).toContain(
          "Slug contains reserved word 'docs' which may cause confusion"
        );
      });
    });

    describe("Security Validation", () => {
      it("should reject directory traversal patterns", async () => {
        const traversalPatterns = [
          "../parent",
          "./current",
          "..\\windows",
          ".\\windows",
        ];

        for (const pattern of traversalPatterns) {
          const result = await service.validateCustomSlug(
            pattern,
            mockCollisionChecker
          );

          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            "Slug cannot contain directory traversal patterns"
          );
        }
      });

      it("should warn about suspicious script patterns", async () => {
        const suspiciousPatterns = [
          "javascript",
          "script-tag",
          "eval-code",
          "alert-message",
          "confirm-dialog",
          "prompt-input",
          "onload-event",
          "onerror-handler",
          "vbscript-code",
        ];

        for (const pattern of suspiciousPatterns) {
          const result = await service.validateCustomSlug(
            pattern,
            mockCollisionChecker
          );

          if (pattern.length >= 4) {
            // Only if it meets length requirements
            expect(result.warnings.length).toBeGreaterThan(0);
            expect(
              result.warnings.some(w =>
                w.includes("potentially suspicious pattern")
              )
            ).toBe(true);
          }
        }
      });

      it("should warn about very short slugs", async () => {
        const shortSlugs = ["ab", "xyz", "test"]; // Length 2-4

        for (const slug of shortSlugs) {
          const result = await service.validateCustomSlug(
            slug,
            mockCollisionChecker
          );

          if (slug.length <= 2) {
            expect(result.warnings).toContain(
              "Very short slugs may conflict with common abbreviations or cause confusion"
            );
          }
        }
      });
    });

    describe("Collision Detection", () => {
      it("should reject slug with collision", async () => {
        // Mock collision checker: 'taken-slug' collides, but suggestions don't
        mockCollisionChecker.mockImplementation((slug: string) => {
          return Promise.resolve(slug === "taken-slug");
        });

        const result = await service.validateCustomSlug(
          "taken-slug",
          mockCollisionChecker
        );

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Slug 'taken-slug' is already in use");
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(mockCollisionChecker).toHaveBeenCalledWith(
          "taken-slug",
          undefined
        );
      });

      it("should handle collision with namespace", async () => {
        mockCollisionChecker.mockResolvedValue(true);

        const result = await service.validateCustomSlug(
          "taken-slug",
          mockCollisionChecker,
          { namespace: "user-123" }
        );

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          "Slug 'taken-slug' is already in use in namespace 'user-123'"
        );
        expect(mockCollisionChecker).toHaveBeenCalledWith(
          "taken-slug",
          "user-123"
        );
      });

      it("should pass when no collision detected", async () => {
        mockCollisionChecker.mockResolvedValue(false);

        const result = await service.validateCustomSlug(
          "available-slug",
          mockCollisionChecker
        );

        expect(result.isValid).toBe(true);
        expect(mockCollisionChecker).toHaveBeenCalledWith(
          "available-slug",
          undefined
        );
      });
    });

    describe("Comprehensive Edge Cases", () => {
      it("should handle multiple validation errors", async () => {
        const result = await service.validateCustomSlug(
          "ab", // Too short, also matches reserved abbreviation warning
          mockCollisionChecker
        );

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.suggestions.length).toBeGreaterThan(0);
      });

      it("should generate suggestions for invalid slugs", async () => {
        const result = await service.validateCustomSlug(
          "invalid@slug!",
          mockCollisionChecker
        );

        expect(result.isValid).toBe(false);
        expect(result.suggestions.length).toBeGreaterThan(0);
      });

      it("should remove duplicate suggestions", async () => {
        mockCollisionChecker
          .mockResolvedValueOnce(true) // Collision for original
          .mockResolvedValue(false); // No collision for suggestions

        const result = await service.validateCustomSlug(
          "taken-slug",
          mockCollisionChecker
        );

        const uniqueSuggestions = [...new Set(result.suggestions)];
        expect(result.suggestions.length).toBe(uniqueSuggestions.length);
      });

      it("should handle collision checker throwing error", async () => {
        mockCollisionChecker.mockRejectedValue(new Error("Database error"));

        await expect(
          service.validateCustomSlug("test-slug", mockCollisionChecker)
        ).rejects.toThrow("Database error");
      });

      it("should validate with all options combined", async () => {
        const result = await service.validateCustomSlug(
          "Valid_Test_Slug",
          mockCollisionChecker,
          {
            pattern: /^[A-Za-z_]+$/,
            patternType: "alphanumeric", // Should be ignored due to custom pattern
            allowReservedWords: true,
            autoNormalize: false,
            namespace: "test-namespace",
          }
        );

        expect(result.isValid).toBe(true);
        expect(result.slug).toBe("Valid_Test_Slug");
        expect(result.normalizedSlug).toBeUndefined(); // autoNormalize is false
        expect(mockCollisionChecker).toHaveBeenCalledWith(
          "Valid_Test_Slug",
          "test-namespace"
        );
      });
    });
  });

  describe("isSlugAvailable", () => {
    it("should return true when slug is available", async () => {
      mockCollisionChecker.mockResolvedValue(false);

      const result = await service.isSlugAvailable(
        "available-slug",
        mockCollisionChecker
      );

      expect(result).toBe(true);
      expect(mockCollisionChecker).toHaveBeenCalledWith(
        "available-slug",
        undefined
      );
    });

    it("should return false when slug is taken", async () => {
      mockCollisionChecker.mockResolvedValue(true);

      const result = await service.isSlugAvailable(
        "taken-slug",
        mockCollisionChecker
      );

      expect(result).toBe(false);
    });

    it("should check availability with namespace", async () => {
      mockCollisionChecker.mockResolvedValue(false);

      const result = await service.isSlugAvailable(
        "namespaced-slug",
        mockCollisionChecker,
        "user-namespace"
      );

      expect(result).toBe(true);
      expect(mockCollisionChecker).toHaveBeenCalledWith(
        "namespaced-slug",
        "user-namespace"
      );
    });
  });

  describe("generateSlugSuggestions", () => {
    beforeEach(() => {
      mockCollisionChecker.mockResolvedValue(false); // All suggestions available by default
    });

    it("should generate numbered suggestions", async () => {
      const suggestions = await service.generateSlugSuggestions(
        "base-slug",
        mockCollisionChecker
      );

      expect(suggestions).toContain("base-slug-1");
      expect(suggestions).toContain("base-slug-2");
      expect(suggestions.length).toBeLessThanOrEqual(5); // Default count
    });

    it("should generate custom count of suggestions", async () => {
      const suggestions = await service.generateSlugSuggestions(
        "base-slug",
        mockCollisionChecker,
        undefined,
        3
      );

      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it("should clean base slug for suggestions", async () => {
      const suggestions = await service.generateSlugSuggestions(
        "Base@Slug!",
        mockCollisionChecker
      );

      suggestions.forEach(suggestion => {
        expect(suggestion).toMatch(/^baseslug-/);
      });
    });

    it("should generate random suffix suggestions", async () => {
      // Mock first few numbered suggestions as taken
      mockCollisionChecker
        .mockResolvedValueOnce(true) // base-slug-1 taken
        .mockResolvedValueOnce(true) // base-slug-2 taken
        .mockResolvedValueOnce(true) // base-slug-3 taken
        .mockResolvedValueOnce(true) // base-slug-4 taken
        .mockResolvedValueOnce(true) // base-slug-5 taken
        .mockResolvedValue(false); // Random suggestions available

      const suggestions = await service.generateSlugSuggestions(
        "popular-slug",
        mockCollisionChecker,
        undefined,
        5
      );

      // Should contain random suffixed suggestions
      const hasRandomSuggestions = suggestions.some(
        s => s.startsWith("popular-slug-") && !/popular-slug-\d+$/.test(s)
      );
      expect(hasRandomSuggestions).toBe(true);
    });

    it("should generate variation suggestions", async () => {
      // Mock numbered and random suggestions as taken
      mockCollisionChecker.mockImplementation(async (slug: string) => {
        if (slug.match(/base-slug-\d+/) || slug.match(/base-slug-[a-z]{3}/)) {
          return true; // Numbered and random variations taken
        }
        return false; // Variations available
      });

      const suggestions = await service.generateSlugSuggestions(
        "base-slug",
        mockCollisionChecker,
        undefined,
        5
      );

      const expectedVariations = [
        "base-slug-new",
        "base-slug-v2",
        "my-base-slug",
        "base-slug-link",
        "base-slug-url",
      ];
      const hasVariations = suggestions.some(s =>
        expectedVariations.includes(s)
      );
      expect(hasVariations).toBe(true);
    });

    it("should respect namespace in suggestions", async () => {
      const suggestions = await service.generateSlugSuggestions(
        "slug",
        mockCollisionChecker,
        "test-namespace",
        3
      );

      // Verify collision checker was called with namespace for each suggestion
      const calls = mockCollisionChecker.mock.calls;
      calls.forEach(call => {
        expect(call[1]).toBe("test-namespace");
      });
    });

    it("should handle case where all suggestions are taken", async () => {
      mockCollisionChecker.mockResolvedValue(true); // Everything is taken

      const suggestions = await service.generateSlugSuggestions(
        "impossible-slug",
        mockCollisionChecker,
        undefined,
        3
      );

      expect(suggestions).toHaveLength(0);
    });

    it("should handle mixed availability scenarios", async () => {
      let callCount = 0;
      mockCollisionChecker.mockImplementation(async (slug: string) => {
        callCount++;
        // Make every other suggestion available
        return callCount % 2 === 1;
      });

      const suggestions = await service.generateSlugSuggestions(
        "mixed-slug",
        mockCollisionChecker,
        undefined,
        5
      );

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });
  });

  describe("normalizeSlug", () => {
    it("should convert to lowercase", () => {
      const result = service.normalizeSlug("MixedCASE");
      expect(result).toBe("mixedcase");
    });

    it("should trim whitespace", () => {
      const result = service.normalizeSlug("  slug  ");
      expect(result).toBe("slug");
    });

    it("should replace spaces with hyphens", () => {
      const result = service.normalizeSlug("slug with spaces");
      expect(result).toBe("slug-with-spaces");
    });

    it("should replace underscores with hyphens", () => {
      const result = service.normalizeSlug("slug_with_underscores");
      expect(result).toBe("slug-with-underscores");
    });

    it("should remove non-URL-safe characters", () => {
      const result = service.normalizeSlug("slug@with#special$chars%");
      expect(result).toBe("slugwithspecialchars");
    });

    it("should collapse multiple hyphens", () => {
      const result = service.normalizeSlug("slug---with---multiple---hyphens");
      expect(result).toBe("slug-with-multiple-hyphens");
    });

    it("should remove leading and trailing hyphens", () => {
      const result = service.normalizeSlug("---leading-and-trailing---");
      expect(result).toBe("leading-and-trailing");
    });

    it("should truncate to maximum length", () => {
      const longSlug = "a".repeat(30);
      const result = service.normalizeSlug(longSlug);
      expect(result.length).toBe(21);
      expect(result).toBe("a".repeat(21));
    });

    it("should handle complex normalization", () => {
      const result = service.normalizeSlug(
        "  ___Complex@Example#With$Everything!!!   "
      );
      expect(result).toBe("complex-example-with-everything");
    });

    it("should handle empty result after normalization", () => {
      const result = service.normalizeSlug("@#$%^&*()");
      expect(result).toBe("");
    });

    it("should handle only special characters", () => {
      const result = service.normalizeSlug("---___---");
      expect(result).toBe("");
    });
  });

  describe("Reserved Slug Management", () => {
    it("should return list of reserved slugs", () => {
      const reserved = service.getReservedSlugs();

      expect(reserved).toContain("api");
      expect(reserved).toContain("admin");
      expect(reserved).toContain("www");
      expect(reserved).toContain("app");
      expect(reserved).toContain("docs");
      expect(reserved).toContain("health");
      expect(reserved).toContain("status");
      expect(reserved).toContain("metrics");
      expect(reserved).toContain("dashboard");
    });

    it("should add new reserved slug", () => {
      const initialCount = service.getReservedSlugs().length;

      service.addReservedSlug("new-reserved");

      const updated = service.getReservedSlugs();
      expect(updated).toContain("new-reserved");
      expect(updated.length).toBe(initialCount + 1);
    });

    it("should add reserved slug in lowercase", () => {
      service.addReservedSlug("NEW-RESERVED");

      const reserved = service.getReservedSlugs();
      expect(reserved).toContain("new-reserved");
    });

    it("should not duplicate reserved slugs", () => {
      const initialCount = service.getReservedSlugs().length;

      service.addReservedSlug("api"); // Already exists

      const updated = service.getReservedSlugs();
      expect(updated.length).toBe(initialCount); // No increase
    });

    it("should remove reserved slug", () => {
      service.addReservedSlug("to-be-removed");
      expect(service.getReservedSlugs()).toContain("to-be-removed");

      service.removeReservedSlug("to-be-removed");

      expect(service.getReservedSlugs()).not.toContain("to-be-removed");
    });

    it("should handle case-insensitive removal", () => {
      service.addReservedSlug("case-test");

      service.removeReservedSlug("CASE-TEST");

      expect(service.getReservedSlugs()).not.toContain("case-test");
    });

    it("should not error when removing non-existent slug", () => {
      expect(() => {
        service.removeReservedSlug("non-existent");
      }).not.toThrow();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle collision checker that returns non-boolean", async () => {
      const badCollisionChecker = jest.fn().mockResolvedValue("true" as any);

      const result = await service.isSlugAvailable(
        "test-slug",
        badCollisionChecker
      );

      expect(result).toBe(false); // Truthy value should be treated as collision
    });

    it("should handle async collision checker errors", async () => {
      mockCollisionChecker.mockRejectedValue(new Error("Database error"));

      await expect(
        service.validateCustomSlug("test-slug", mockCollisionChecker)
      ).rejects.toThrow("Database error");
    });

    it("should handle very long suggestion generation", async () => {
      mockCollisionChecker.mockImplementation(async (slug: string) => {
        return slug.includes("-1") || slug.includes("-2"); // Only first two suggestions taken
      });

      const suggestions = await service.generateSlugSuggestions(
        "popular",
        mockCollisionChecker,
        undefined,
        10
      );

      expect(suggestions.length).toBeGreaterThan(0);
    });

    it("should handle Unicode characters in normalization", () => {
      const result = service.normalizeSlug("café-résumé-naïve");
      expect(result).toBe("caf-rsum-nave"); // Non-ASCII removed
    });

    it("should handle emoji characters", () => {
      const result = service.normalizeSlug("slug-with-😀-emoji");
      expect(result).toBe("slug-with-emoji");
    });

    it("should validate extremely long slug", async () => {
      const extremelyLongSlug = "a".repeat(1000);

      const result = await service.validateCustomSlug(
        extremelyLongSlug,
        mockCollisionChecker
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Slug cannot be longer than 21 characters"
      );
    });

    it("should handle concurrent validation requests", async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        service.validateCustomSlug(`concurrent-${i}`, mockCollisionChecker)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach((result, i) => {
        expect(result.slug).toBe(`concurrent-${i}`);
      });
    });

    it("should handle pattern validation with complex regex", async () => {
      const complexPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/; // Password-like pattern

      const result = await service.validateCustomSlug(
        "simpleSlug",
        mockCollisionChecker,
        { pattern: complexPattern }
      );

      expect(result.isValid).toBe(false);
    });
  });
});
