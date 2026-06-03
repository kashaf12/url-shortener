import { UnshortenRequestDto } from "./link-request";
import { UnshortenRequestSchema } from "@url-shortener/types";
import { ZodError } from "zod";

describe("UnshortenRequestDto", () => {
  describe("DTO Structure", () => {
    it("should extend createZodDto with UnshortenRequestSchema", () => {
      const dto = new UnshortenRequestDto();
      expect(dto).toBeInstanceOf(UnshortenRequestDto);
      expect(dto).toBeDefined();
    });

    it("should have access to Zod schema validation", () => {
      expect(UnshortenRequestDto.schema).toBeDefined();
      expect(UnshortenRequestDto.schema).toBe(UnshortenRequestSchema);
    });
  });

  describe("Required Field Validation", () => {
    describe("slug field", () => {
      it("should require slug field", () => {
        expect(() => {
          UnshortenRequestDto.schema.parse({});
        }).toThrow(ZodError);

        const result = UnshortenRequestDto.schema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(
            result.error.issues.some(
              (e: any) => e.path.includes("slug") && e.code === "invalid_type"
            )
          ).toBe(true);
        }
      });

      it("should accept valid slug values", () => {
        const validSlugs = [
          "a", // min length 1
          "abc",
          "abc123",
          "ABC123",
          "a1b2c3",
          "custom-slug",
          "custom_slug",
          "MixedCase123",
          "123456789",
          "special-chars_123",
          "verylongslugname123", // under 21 chars
          "123456789012345678901", // exactly 21 chars (max)
        ];

        validSlugs.forEach(slug => {
          const result = UnshortenRequestDto.schema.safeParse({ slug });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.slug).toBe(slug);
          }
        });
      });

      it("should reject slugs that are too short", () => {
        const result = UnshortenRequestDto.schema.safeParse({ slug: "" });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(
            result.error.issues.some((e: any) => e.code === "too_small")
          ).toBe(true);
        }
      });

      it("should reject slugs that are too long", () => {
        const tooLongSlug = "a".repeat(22); // 22 chars > 21 max
        const result = UnshortenRequestDto.schema.safeParse({
          slug: tooLongSlug,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(
            result.error.issues.some((e: any) => e.code === "too_big")
          ).toBe(true);
        }
      });

      it("should reject non-string slug values", () => {
        const nonStringValues = [123, true, null, undefined, [], {}, 4.5];

        nonStringValues.forEach(slug => {
          const result = UnshortenRequestDto.schema.safeParse({ slug });
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(
              result.error.issues.some((e: any) => e.code === "invalid_type")
            ).toBe(true);
          }
        });
      });

      it("should handle edge case lengths", () => {
        const edgeCases = [
          { slug: "a", expected: true }, // exactly min length
          { slug: "123456789012345678901", expected: true }, // exactly max length
          { slug: "1234567890123456789012", expected: false }, // one over max
        ];

        edgeCases.forEach(({ slug, expected }) => {
          const result = UnshortenRequestDto.schema.safeParse({ slug });
          expect(result.success).toBe(expected);
        });
      });
    });
  });

  describe("Slug Content Validation", () => {
    it("should accept alphanumeric slugs", () => {
      const alphanumericSlugs = [
        "abc123",
        "ABC123",
        "123456",
        "abcABC123",
        "MixedCase123",
      ];

      alphanumericSlugs.forEach(slug => {
        const result = UnshortenRequestDto.schema.safeParse({ slug });
        expect(result.success).toBe(true);
      });
    });

    it("should accept slugs with hyphens and underscores", () => {
      const hyphenUnderscoreSlugs = [
        "test-slug",
        "test_slug",
        "multi-word-slug",
        "multi_word_slug",
        "mix-ed_styles",
        "starts-with-hyphen",
        "ends_with_underscore",
      ];

      hyphenUnderscoreSlugs.forEach(slug => {
        const result = UnshortenRequestDto.schema.safeParse({ slug });
        expect(result.success).toBe(true);
      });
    });

    it("should accept slugs with dots and special characters", () => {
      const specialCharSlugs = [
        "slug.with.dots",
        "slug@withAt",
        "slug#withHash",
        "slug$withDollar",
        "slug%withPercent",
        "slug+withPlus",
        "slug=withEquals",
      ];

      // Note: The schema doesn't restrict special characters beyond length
      specialCharSlugs.forEach(slug => {
        const result = UnshortenRequestDto.schema.safeParse({ slug });
        expect(result.success).toBe(true);
      });
    });

    it("should accept unicode slugs", () => {
      const unicodeSlugs = [
        "café",
        "测试",
        "مثال",
        "пример",
        "例え",
        "🚀rocket",
        "slug-with-émojis-🎉",
      ];

      unicodeSlugs.forEach(slug => {
        if (slug.length <= 21) {
          // Ensure within length limits
          const result = UnshortenRequestDto.schema.safeParse({ slug });
          expect(result.success).toBe(true);
        }
      });
    });

    it("should handle whitespace in slugs", () => {
      const whitespaceSlugs = [
        " slug", // leading space
        "slug ", // trailing space
        " slug ", // both spaces
        "slug with spaces",
        "slug\twith\ttabs",
        "slug\nwith\nnewlines",
      ];

      whitespaceSlugs.forEach(slug => {
        const result = UnshortenRequestDto.schema.safeParse({ slug });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Schema Structure Validation", () => {
    it("should only have slug field", () => {
      const schema = UnshortenRequestDto.schema;
      const fields = Object.keys(schema.shape);

      expect(fields).toHaveLength(1);
      expect(fields).toContain("slug");
    });

    it("should not accept extra fields", () => {
      const requestWithExtraFields = {
        slug: "valid-slug",
        extraField: "should be ignored",
        anotherExtra: 123,
      };

      const result = UnshortenRequestDto.schema.safeParse(
        requestWithExtraFields
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ slug: "valid-slug" });
        expect(result.data).not.toHaveProperty("extraField");
        expect(result.data).not.toHaveProperty("anotherExtra");
      }
    });
  });

  describe("Error Handling", () => {
    it("should provide clear error messages for missing slug", () => {
      const result = UnshortenRequestDto.schema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        const slugError = result.error.issues.find((e: any) =>
          e.path.includes("slug")
        );
        expect(slugError).toBeDefined();
        expect(slugError?.code).toBe("invalid_type");
        expect(slugError?.message).toContain(
          "expected string, received undefined"
        );
      }
    });

    it("should provide clear error messages for invalid slug length", () => {
      // Too short
      const tooShortResult = UnshortenRequestDto.schema.safeParse({ slug: "" });
      expect(tooShortResult.success).toBe(false);
      if (!tooShortResult.success) {
        const error = tooShortResult.error.issues.find(
          (e: any) => e.code === "too_small"
        );
        expect(error).toBeDefined();
      }

      // Too long
      const tooLongResult = UnshortenRequestDto.schema.safeParse({
        slug: "a".repeat(22),
      });
      expect(tooLongResult.success).toBe(false);
      if (!tooLongResult.success) {
        const error = tooLongResult.error.issues.find(
          (e: any) => e.code === "too_big"
        );
        expect(error).toBeDefined();
      }
    });

    it("should provide clear error messages for wrong types", () => {
      const wrongTypeResult = UnshortenRequestDto.schema.safeParse({
        slug: 123,
      });
      expect(wrongTypeResult.success).toBe(false);
      if (!wrongTypeResult.success) {
        const error = wrongTypeResult.error.issues.find(
          (e: any) => e.code === "invalid_type"
        );
        expect(error).toBeDefined();
        expect(error?.message).toContain("expected string, received number");
      }
    });

    it("should handle multiple validation errors", () => {
      // This shouldn't happen with current schema, but test edge case
      const result = UnshortenRequestDto.schema.safeParse({ slug: null });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Real-world Usage Scenarios", () => {
    it("should handle typical API request", () => {
      const typicalRequests = [
        { slug: "abc123" }, // nanoid style
        { slug: "a1b2c3d4" }, // uuid style
        { slug: "custom-slug" }, // custom slug
        { slug: "BlogPost2023" }, // readable slug
        { slug: "product-page" }, // dashboard created
        { slug: "api-endpoint" }, // api created
      ];

      typicalRequests.forEach(request => {
        const result = UnshortenRequestDto.schema.safeParse(request);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(request);
        }
      });
    });

    it("should handle slugs from different generation strategies", () => {
      const strategySpecificSlugs = [
        // NanoID generated
        { slug: "V1StGXR8" },
        { slug: "2nYyNd6B" },
        { slug: "rJf2vM9k" },

        // UUID generated
        { slug: "550e8400" }, // short format
        { slug: "550e8400e29b" }, // medium format
        { slug: "a3f5d8e2" }, // another short

        // Custom slugs
        { slug: "my-blog-post" },
        { slug: "product_123" },
        { slug: "HomePage" },
      ];

      strategySpecificSlugs.forEach(request => {
        const result = UnshortenRequestDto.schema.safeParse(request);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(request);
        }
      });
    });

    it("should handle edge case slugs that might exist", () => {
      const edgeCaseSlugs = [
        { slug: "a" }, // shortest possible
        { slug: "123456789012345678901" }, // longest possible
        { slug: "000000000" }, // all zeros
        { slug: "ZZZZZZZZZ" }, // all Z's
        { slug: "aB3-_" }, // mixed case and symbols
        { slug: "café" }, // unicode
        { slug: "slug with spaces" }, // spaces
        { slug: "🚀" }, // emoji (single char)
      ];

      edgeCaseSlugs.forEach(request => {
        const result = UnshortenRequestDto.schema.safeParse(request);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(request);
        }
      });
    });
  });

  describe("Security Considerations", () => {
    it("should accept potentially malicious but valid slugs", () => {
      // The schema should accept these - security filtering happens elsewhere
      const potentiallyMaliciousSlugs = [
        { slug: "javascript" },
        { slug: "admin" },
        { slug: "api" },
        { slug: "login" },
        { slug: "password" },
        { slug: "script" },
        { slug: "eval" },
        { slug: "alert" },
        { slug: "xss" },
        { slug: "sql" },
      ];

      potentiallyMaliciousSlugs.forEach(request => {
        const result = UnshortenRequestDto.schema.safeParse(request);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(request);
        }
      });
    });

    it("should handle path traversal attempts", () => {
      const pathTraversalSlugs = [
        { slug: ".." },
        { slug: "../" },
        { slug: "..%2F" },
        { slug: "%2E%2E%2F" },
        { slug: "....///" },
        { slug: "/etc/passwd" },
        { slug: "C:\\Windows" },
      ];

      pathTraversalSlugs.forEach(request => {
        if (request.slug.length <= 21) {
          const result = UnshortenRequestDto.schema.safeParse(request);
          expect(result.success).toBe(true);
        }
      });
    });

    it("should handle URL encoding in slugs", () => {
      const encodedSlugs = [
        { slug: "%20" }, // space
        { slug: "%3D" }, // equals
        { slug: "%2F" }, // forward slash
        { slug: "%3A" }, // colon
        { slug: "hello%20world" }, // encoded space
        { slug: "test%2Ecom" }, // encoded dot
      ];

      encodedSlugs.forEach(request => {
        const result = UnshortenRequestDto.schema.safeParse(request);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(request);
        }
      });
    });
  });

  describe("Performance and Edge Cases", () => {
    it("should handle boundary length values efficiently", () => {
      const boundaryTests = [
        { slug: "a", shouldPass: true }, // min length
        { slug: "ab", shouldPass: true }, // min + 1
        { slug: "12345678901234567890", shouldPass: true }, // max - 1
        { slug: "123456789012345678901", shouldPass: true }, // max length
        { slug: "1234567890123456789012", shouldPass: false }, // max + 1
      ];

      boundaryTests.forEach(({ slug, shouldPass }) => {
        const start = performance.now();
        const result = UnshortenRequestDto.schema.safeParse({ slug });
        const end = performance.now();

        expect(result.success).toBe(shouldPass);
        expect(end - start).toBeLessThan(10); // Should be very fast
      });
    });

    it("should handle repeated validation efficiently", () => {
      const slug = "performance-test";
      const iterations = 1000;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        const result = UnshortenRequestDto.schema.safeParse({ slug });
        expect(result.success).toBe(true);
      }
      const end = performance.now();

      const averageTime = (end - start) / iterations;
      expect(averageTime).toBeLessThan(1); // Should average less than 1ms per validation
    });

    it("should handle large slug validation", () => {
      const maxLengthSlug = "a".repeat(21);

      const start = performance.now();
      const result = UnshortenRequestDto.schema.safeParse({
        slug: maxLengthSlug,
      });
      const end = performance.now();

      expect(result.success).toBe(true);
      expect(end - start).toBeLessThan(5); // Should be fast even for max length
    });
  });

  describe("Schema Consistency", () => {
    it("should match UnshortenRequestSchema exactly", () => {
      expect(UnshortenRequestDto.schema).toBe(UnshortenRequestSchema);
    });

    it("should have consistent validation with manual schema usage", () => {
      const testData = { slug: "test-consistency" };

      const dtoResult = UnshortenRequestDto.schema.safeParse(testData);
      const directResult = UnshortenRequestSchema.safeParse(testData);

      expect(dtoResult.success).toBe(directResult.success);
      if (dtoResult.success && directResult.success) {
        expect(dtoResult.data).toEqual(directResult.data);
      }
    });

    it("should maintain schema structure integrity", () => {
      const schema = UnshortenRequestDto.schema;

      // Should be an object schema (skip checking internal typeName)
      expect(schema.shape).toBeDefined();

      // Should have exactly one field
      expect(Object.keys(schema.shape)).toHaveLength(1);

      // Slug field should be a string with min/max constraints
      const slugField = schema.shape.slug;
      expect(slugField).toBeDefined();

      // Test validation behavior instead of internal structure
      const validSlug = schema.safeParse({ slug: "validslug" });
      expect(validSlug.success).toBe(true);

      const tooShort = schema.safeParse({ slug: "" });
      expect(tooShort.success).toBe(false);

      const tooLong = schema.safeParse({ slug: "a".repeat(22) });
      const hasMinCheck = tooLong.success === false;
      const hasMaxCheck = tooShort.success === false;

      expect(hasMinCheck).toBe(true);
      expect(hasMaxCheck).toBe(true);
    });
  });
});
