import { CreateLinkDto } from "./create-link.dto";
import { ShortenRequestSchema } from "@url-shortener/types";
import { ZodError } from "zod";

describe("CreateLinkDto", () => {
  describe("DTO Structure", () => {
    it("should extend createZodDto with ShortenRequestSchema", () => {
      const dto = new CreateLinkDto();
      expect(dto).toBeInstanceOf(CreateLinkDto);
      expect(dto).toBeDefined();
    });

    it("should have access to Zod schema validation", () => {
      expect(CreateLinkDto.schema).toBeDefined();
      expect(CreateLinkDto.schema).toBe(ShortenRequestSchema);
    });
  });

  describe("Required Field Validation", () => {
    describe("url field", () => {
      it("should require url field", () => {
        expect(() => {
          CreateLinkDto.schema.parse({});
        }).toThrow(ZodError);

        const result = CreateLinkDto.schema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(
            result.error.issues.some(
              (e: any) => e.path.includes("url") && e.code === "invalid_type"
            )
          ).toBe(true);
        }
      });

      it("should accept valid URL formats", () => {
        const validUrls = [
          "https://example.com",
          "http://example.com",
          "https://subdomain.example.com",
          "https://example.com/path",
          "https://example.com/path?query=value",
          "https://example.com/path?query=value&other=test",
          "https://example.com/path#fragment",
          "https://example.com:8080/path",
          "https://192.168.1.1:3000/api",
          "ftp://files.example.com/file.txt",
        ];

        validUrls.forEach(url => {
          const result = CreateLinkDto.schema.safeParse({ url });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.url).toBe(url);
          }
        });
      });

      it("should reject invalid URL formats", () => {
        const invalidUrls = [
          "not-a-url",
          "example.com", // missing protocol
          "http://", // incomplete
          "://example.com", // missing protocol
          "", // empty
          "   ", // whitespace only
        ];

        invalidUrls.forEach(url => {
          const result = CreateLinkDto.schema.safeParse({ url });
          expect(result.success).toBe(false);
        });
      });

      it("should use custom error message for invalid URLs", () => {
        const result = CreateLinkDto.schema.safeParse({ url: "not-a-url" });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(
            result.error.issues.some(
              (e: any) => e.message === "Invalid URL format"
            )
          ).toBe(true);
        }
      });

      it("should handle very long URLs", () => {
        const longUrl = "https://example.com/" + "a".repeat(2000);
        const result = CreateLinkDto.schema.safeParse({ url: longUrl });
        expect(result.success).toBe(true);
      });

      it("should handle URLs with unicode characters", () => {
        const unicodeUrls = [
          "https://example.com/ñ",
          "https://example.com/测试",
          "https://xn--nxasmq6b.example.com", // punycode
        ];

        unicodeUrls.forEach(url => {
          const result = CreateLinkDto.schema.safeParse({ url });
          expect(result.success).toBe(true);
        });
      });
    });
  });

  describe("Optional Field Validation", () => {
    describe("metadata field", () => {
      it("should be optional", () => {
        const result = CreateLinkDto.schema.safeParse({
          url: "https://example.com",
        });
        expect(result.success).toBe(true);
      });

      it("should accept valid metadata", () => {
        const validMetadata = {
          title: "Example Page",
          tags: ["example", "test"],
          user_name: "testuser",
          source: "api",
          custom_field: "custom_value",
          array_field: ["item1", "item2"],
        };

        const result = CreateLinkDto.schema.safeParse({
          url: "https://example.com",
          metadata: validMetadata,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.metadata).toEqual(validMetadata);
        }
      });

      it("should accept empty metadata object", () => {
        const result = CreateLinkDto.schema.safeParse({
          url: "https://example.com",
          metadata: {},
        });
        expect(result.success).toBe(true);
      });

      it("should reject invalid metadata types", () => {
        const invalidMetadata = [
          "string", // should be object
          123, // should be object
          null, // should be object or undefined
          ["array"], // should be object
        ];

        invalidMetadata.forEach(metadata => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
            metadata,
          });
          expect(result.success).toBe(false);
        });
      });
    });

    describe("customSlug field", () => {
      it("should be optional", () => {
        const result = CreateLinkDto.schema.safeParse({
          url: "https://example.com",
        });
        expect(result.success).toBe(true);
      });

      it("should accept valid custom slugs", () => {
        const validSlugs = [
          "a", // min length 1
          "abc123",
          "custom-slug",
          "custom_slug",
          "MyCustomSlug",
          "123456789012345678901", // max length 21
        ];

        validSlugs.forEach(customSlug => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
            customSlug,
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.customSlug).toBe(customSlug);
          }
        });
      });

      it("should reject slugs that are too short", () => {
        const result = CreateLinkDto.schema.safeParse({
          url: "https://example.com",
          customSlug: "", // too short
        });
        expect(result.success).toBe(false);
      });

      it("should reject slugs that are too long", () => {
        const tooLong = "a".repeat(22); // 22 chars > 21 max
        const result = CreateLinkDto.schema.safeParse({
          url: "https://example.com",
          customSlug: tooLong,
        });
        expect(result.success).toBe(false);
      });

      it("should have proper description", () => {
        const field = CreateLinkDto.schema.shape.customSlug;
        expect(field.description).toBe(
          "Use a custom slug instead of generating one"
        );
      });
    });

    describe("slugStrategy field", () => {
      it("should be optional", () => {
        const result = CreateLinkDto.schema.safeParse({
          url: "https://example.com",
        });
        expect(result.success).toBe(true);
      });

      it("should accept valid strategies", () => {
        const validStrategies = ["nanoid", "uuid"];

        validStrategies.forEach(slugStrategy => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
            slugStrategy,
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.slugStrategy).toBe(slugStrategy);
          }
        });
      });

      it("should reject invalid strategies", () => {
        const invalidStrategies = [
          "base58", // not in enum
          "custom", // not in enum
          "invalid", // not in enum
          "", // empty string
          123, // wrong type
        ];

        invalidStrategies.forEach(slugStrategy => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
            slugStrategy,
          });
          expect(result.success).toBe(false);
        });
      });
    });

    describe("length field", () => {
      it("should be optional", () => {
        const result = CreateLinkDto.schema.safeParse({
          url: "https://example.com",
        });
        expect(result.success).toBe(true);
      });

      it("should accept valid lengths", () => {
        const validLengths = [4, 7, 10, 15, 21]; // within min/max range

        validLengths.forEach(length => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
            length,
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.length).toBe(length);
          }
        });
      });

      it("should reject lengths below minimum", () => {
        const invalidLengths = [0, 1, 2, 3]; // below min of 4

        invalidLengths.forEach(length => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
            length,
          });
          expect(result.success).toBe(false);
        });
      });

      it("should reject lengths above maximum", () => {
        const invalidLengths = [22, 25, 50, 100]; // above max of 21

        invalidLengths.forEach(length => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
            length,
          });
          expect(result.success).toBe(false);
        });
      });

      it("should require integer values", () => {
        const nonIntegerLengths = [4.5, 7.2, 10.8];

        nonIntegerLengths.forEach(length => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
            length,
          });
          expect(result.success).toBe(false);
        });
      });

      it("should reject non-numeric values", () => {
        const nonNumericLengths = ["7", "ten", true, null];

        nonNumericLengths.forEach(length => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
            length,
          });
          expect(result.success).toBe(false);
        });
      });
    });

    describe("alphabetType field", () => {
      it("should be optional", () => {
        const result = CreateLinkDto.schema.safeParse({
          url: "https://example.com",
        });
        expect(result.success).toBe(true);
      });

      it("should accept valid alphabet types", () => {
        const validTypes = ["alphanumeric", "urlSafe", "readable"];

        validTypes.forEach(alphabetType => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
            alphabetType,
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.alphabetType).toBe(alphabetType);
          }
        });
      });

      it("should reject invalid alphabet types", () => {
        const invalidTypes = ["base58", "hex", "binary", "", 123];

        invalidTypes.forEach(alphabetType => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
            alphabetType,
          });
          expect(result.success).toBe(false);
        });
      });
    });

    describe("alphabet field", () => {
      it("should be optional", () => {
        const result = CreateLinkDto.schema.safeParse({
          url: "https://example.com",
        });
        expect(result.success).toBe(true);
      });

      it("should accept valid custom alphabets", () => {
        const validAlphabets = [
          "AB", // min length 2
          "0123456789",
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
          "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
          "!@#$%^&*()_+-=",
          "αβγδεζηθι", // unicode
        ];

        validAlphabets.forEach(alphabet => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
            alphabet,
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.alphabet).toBe(alphabet);
          }
        });
      });

      it("should reject alphabets that are too short", () => {
        const tooShortAlphabets = ["", "A"]; // below min of 2

        tooShortAlphabets.forEach(alphabet => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
            alphabet,
          });
          expect(result.success).toBe(false);
        });
      });
    });

    describe("patternType field", () => {
      it("should be optional", () => {
        const result = CreateLinkDto.schema.safeParse({
          url: "https://example.com",
        });
        expect(result.success).toBe(true);
      });

      it("should accept valid pattern types", () => {
        const validTypes = ["alphanumeric", "urlSafe", "readable"];

        validTypes.forEach(patternType => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
            patternType,
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.patternType).toBe(patternType);
          }
        });
      });

      it("should reject invalid pattern types", () => {
        const invalidTypes = ["regex", "custom", "", 123];

        invalidTypes.forEach(patternType => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
            patternType,
          });
          expect(result.success).toBe(false);
        });
      });
    });

    describe("pattern field", () => {
      it("should be optional", () => {
        const result = CreateLinkDto.schema.safeParse({
          url: "https://example.com",
        });
        expect(result.success).toBe(true);
      });

      it("should accept valid regex pattern strings", () => {
        const validPatterns = [
          "^[a-z]+$",
          "\\d{4}",
          "[A-Z0-9]+",
          ".*",
          "^abc.*xyz$",
        ];

        validPatterns.forEach(pattern => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
            pattern,
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.pattern).toBe(pattern);
          }
        });
      });

      it("should accept empty pattern string", () => {
        const result = CreateLinkDto.schema.safeParse({
          url: "https://example.com",
          pattern: "",
        });
        expect(result.success).toBe(true);
      });
    });

    describe("namespace field", () => {
      it("should be optional", () => {
        const result = CreateLinkDto.schema.safeParse({
          url: "https://example.com",
        });
        expect(result.success).toBe(true);
      });

      it("should accept valid namespaces", () => {
        const validNamespaces = [
          "a", // min length 1
          "user-123",
          "organization_456",
          "project.name",
          "namespace:with:colons",
          "a".repeat(50), // max length 50
        ];

        validNamespaces.forEach(namespace => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
            namespace,
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.namespace).toBe(namespace);
          }
        });
      });

      it("should reject namespaces that are too short", () => {
        const result = CreateLinkDto.schema.safeParse({
          url: "https://example.com",
          namespace: "", // too short
        });
        expect(result.success).toBe(false);
      });

      it("should reject namespaces that are too long", () => {
        const tooLong = "a".repeat(51); // 51 chars > 50 max
        const result = CreateLinkDto.schema.safeParse({
          url: "https://example.com",
          namespace: tooLong,
        });
        expect(result.success).toBe(false);
      });
    });

    describe("deduplication fields", () => {
      describe("deduplicate field", () => {
        it("should be optional with default false", () => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.deduplicate).toBe(false);
          }
        });

        it("should accept boolean values", () => {
          [true, false].forEach(deduplicate => {
            const result = CreateLinkDto.schema.safeParse({
              url: "https://example.com",
              deduplicate,
            });
            expect(result.success).toBe(true);
            if (result.success) {
              expect(result.data.deduplicate).toBe(deduplicate);
            }
          });
        });

        it("should reject non-boolean values", () => {
          ["true", "false", 1, 0, null].forEach(deduplicate => {
            const result = CreateLinkDto.schema.safeParse({
              url: "https://example.com",
              deduplicate,
            });
            expect(result.success).toBe(false);
          });
        });
      });

      describe("deduplicationFields field", () => {
        it("should be optional", () => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
          });
          expect(result.success).toBe(true);
        });

        it("should accept valid field arrays", () => {
          const validFieldArrays = [
            ["title"],
            ["title", "author"],
            ["title", "author", "tags", "source", "user_name"],
            [], // empty array
          ];

          validFieldArrays.forEach(deduplicationFields => {
            const result = CreateLinkDto.schema.safeParse({
              url: "https://example.com",
              deduplicationFields,
            });
            expect(result.success).toBe(true);
            if (result.success) {
              expect(result.data.deduplicationFields).toEqual(
                deduplicationFields
              );
            }
          });
        });

        it("should reject arrays with too many items", () => {
          const tooManyFields = Array(11).fill("field"); // 11 > max 10
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
            deduplicationFields: tooManyFields,
          });
          expect(result.success).toBe(false);
        });

        it("should reject non-string array items", () => {
          const invalidArrays = [[123], ["title", 456], [null], [true, false]];

          invalidArrays.forEach(deduplicationFields => {
            const result = CreateLinkDto.schema.safeParse({
              url: "https://example.com",
              deduplicationFields,
            });
            expect(result.success).toBe(false);
          });
        });
      });

      describe("enhancedCanonical field", () => {
        it("should be optional with default false", () => {
          const result = CreateLinkDto.schema.safeParse({
            url: "https://example.com",
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.enhancedCanonical).toBe(false);
          }
        });

        it("should accept boolean values", () => {
          [true, false].forEach(enhancedCanonical => {
            const result = CreateLinkDto.schema.safeParse({
              url: "https://example.com",
              enhancedCanonical,
            });
            expect(result.success).toBe(true);
            if (result.success) {
              expect(result.data.enhancedCanonical).toBe(enhancedCanonical);
            }
          });
        });

        it("should reject non-boolean values", () => {
          ["true", "false", 1, 0, null].forEach(enhancedCanonical => {
            const result = CreateLinkDto.schema.safeParse({
              url: "https://example.com",
              enhancedCanonical,
            });
            expect(result.success).toBe(false);
          });
        });
      });
    });
  });

  describe("Complex Validation Scenarios", () => {
    it("should validate complete request with all fields", () => {
      const completeRequest = {
        url: "https://example.com/very/long/path?param=value&other=test#fragment",
        metadata: {
          title: "Complete Example",
          tags: ["test", "example"],
          user_name: "testuser",
          source: "api",
          custom_field: "custom_value",
        },
        customSlug: "my-custom-slug",
        slugStrategy: "nanoid" as const,
        length: 8,
        alphabetType: "urlSafe" as const,
        alphabet:
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
        patternType: "alphanumeric" as const,
        pattern: "^[A-Za-z0-9]+$",
        namespace: "user-123",
        deduplicate: true,
        deduplicationFields: ["title", "author"],
        enhancedCanonical: true,
      };

      const result = CreateLinkDto.schema.safeParse(completeRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(completeRequest);
      }
    });

    it("should validate minimal request with only required fields", () => {
      const minimalRequest = {
        url: "https://example.com",
      };

      const result = CreateLinkDto.schema.safeParse(minimalRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.url).toBe(minimalRequest.url);
        expect(result.data.deduplicate).toBe(false); // default value
        expect(result.data.enhancedCanonical).toBe(false); // default value
      }
    });

    it("should handle conflicting alphabet options", () => {
      // Both alphabetType and custom alphabet provided - custom should take precedence
      const conflictingRequest = {
        url: "https://example.com",
        alphabetType: "alphanumeric" as const,
        alphabet: "ABC123", // custom alphabet
      };

      const result = CreateLinkDto.schema.safeParse(conflictingRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.alphabetType).toBe("alphanumeric");
        expect(result.data.alphabet).toBe("ABC123");
      }
    });

    it("should handle conflicting pattern options", () => {
      // Both patternType and custom pattern provided
      const conflictingRequest = {
        url: "https://example.com",
        patternType: "alphanumeric" as const,
        pattern: "^[0-9]+$", // custom pattern
      };

      const result = CreateLinkDto.schema.safeParse(conflictingRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.patternType).toBe("alphanumeric");
        expect(result.data.pattern).toBe("^[0-9]+$");
      }
    });

    it("should validate deduplication configuration", () => {
      const deduplicationRequest = {
        url: "https://example.com",
        deduplicate: true,
        deduplicationFields: ["title", "author", "tags"],
        enhancedCanonical: true,
      };

      const result = CreateLinkDto.schema.safeParse(deduplicationRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.deduplicate).toBe(true);
        expect(result.data.deduplicationFields).toEqual([
          "title",
          "author",
          "tags",
        ]);
        expect(result.data.enhancedCanonical).toBe(true);
      }
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle null values", () => {
      const nullRequest = {
        url: "https://example.com",
        metadata: null,
        customSlug: null,
        slugStrategy: null,
        length: null,
        alphabetType: null,
        alphabet: null,
        patternType: null,
        pattern: null,
        namespace: null,
        deduplicationFields: null,
      };

      const result = CreateLinkDto.schema.safeParse(nullRequest);
      // Most null values should be treated as invalid, except where specifically allowed
      expect(result.success).toBe(false);
    });

    it("should handle undefined values", () => {
      const undefinedRequest = {
        url: "https://example.com",
        metadata: undefined,
        customSlug: undefined,
        slugStrategy: undefined,
        length: undefined,
        alphabetType: undefined,
        alphabet: undefined,
        patternType: undefined,
        pattern: undefined,
        namespace: undefined,
        deduplicate: undefined,
        deduplicationFields: undefined,
        enhancedCanonical: undefined,
      };

      const result = CreateLinkDto.schema.safeParse(undefinedRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.url).toBe("https://example.com");
        expect(result.data.deduplicate).toBe(false); // default
        expect(result.data.enhancedCanonical).toBe(false); // default
      }
    });

    it("should provide detailed error messages", () => {
      const invalidRequest = {
        url: "not-a-url",
        length: 2, // too short
        namespace: "", // too short
        deduplicationFields: Array(15).fill("field"), // too many
      };

      const result = CreateLinkDto.schema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
        // Should have specific errors for each invalid field
        const errorPaths = result.error.issues.map((e: any) =>
          e.path.join(".")
        );
        expect(errorPaths).toContain("url");
        expect(errorPaths).toContain("length");
        expect(errorPaths).toContain("namespace");
        expect(errorPaths).toContain("deduplicationFields");
      }
    });

    it("should handle extra properties", () => {
      const extraPropsRequest = {
        url: "https://example.com",
        extraField: "should be ignored",
        anotherExtra: 123,
      };

      const result = CreateLinkDto.schema.safeParse(extraPropsRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty("extraField");
        expect(result.data).not.toHaveProperty("anotherExtra");
      }
    });

    it("should handle large objects", () => {
      const largeMetadata = Object.fromEntries(
        Array(100)
          .fill(0)
          .map((_, i) => [`field${i}`, `value${i}`])
      );

      const largeRequest = {
        url: "https://example.com",
        metadata: largeMetadata,
        deduplicationFields: Array(10)
          .fill(0)
          .map((_, i) => `field${i}`), // max allowed
      };

      const result = CreateLinkDto.schema.safeParse(largeRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.data.metadata || {}).length).toBe(100);
        expect(result.data.deduplicationFields?.length).toBe(10);
      }
    });
  });

  describe("Schema Description and Documentation", () => {
    it("should have proper field descriptions", () => {
      const schema = CreateLinkDto.schema;

      expect(schema.shape.customSlug.description).toContain("custom slug");
      expect(schema.shape.slugStrategy.description).toContain("strategy");
      expect(schema.shape.length.description).toContain("length");
      expect(schema.shape.alphabetType.description).toContain("alphabet");
      expect(schema.shape.alphabet.description).toContain("alphabet");
      expect(schema.shape.patternType.description).toContain("pattern");
      expect(schema.shape.pattern.description).toContain("pattern");
      expect(schema.shape.namespace.description).toContain("namespace");
      expect(schema.shape.deduplicate.description).toContain("deduplication");
      expect(schema.shape.deduplicationFields.description).toContain(
        "metadata"
      );
      expect(schema.shape.enhancedCanonical.description).toContain("canonical");
    });

    it("should maintain schema consistency", () => {
      expect(CreateLinkDto.schema).toBe(ShortenRequestSchema);
    });
  });

  describe("Real-world Usage Scenarios", () => {
    it("should handle typical API request", () => {
      const typicalRequest = {
        url: "https://www.example.com/blog/post-title",
        metadata: {
          title: "Blog Post Title",
          tags: ["blog", "article"],
          user_name: "johndoe",
          source: "web",
        },
        slugStrategy: "nanoid" as const,
        length: 7,
        namespace: "user-johndoe",
        deduplicate: true,
      };

      const result = CreateLinkDto.schema.safeParse(typicalRequest);
      expect(result.success).toBe(true);
    });

    it("should handle custom slug request", () => {
      const customSlugRequest = {
        url: "https://company.com/product",
        customSlug: "product-page",
        metadata: {
          title: "Product Page",
          source: "dashboard",
        },
      };

      const result = CreateLinkDto.schema.safeParse(customSlugRequest);
      expect(result.success).toBe(true);
    });

    it("should handle advanced configuration", () => {
      const advancedRequest = {
        url: "https://api.example.com/data",
        slugStrategy: "uuid" as const,
        alphabetType: "readable" as const,
        patternType: "alphanumeric" as const,
        namespace: "api-endpoints",
        deduplicate: true,
        deduplicationFields: ["title", "source"],
        enhancedCanonical: true,
      };

      const result = CreateLinkDto.schema.safeParse(advancedRequest);
      expect(result.success).toBe(true);
    });
  });
});
