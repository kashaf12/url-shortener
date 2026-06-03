import { UpdateLinkDto } from "./update-link.dto";
import { ShortenRequestSchema } from "@url-shortener/types";
import { ZodError } from "zod";

describe("UpdateLinkDto", () => {
  describe("DTO Structure", () => {
    it("should extend createZodDto with partial ShortenRequestSchema", () => {
      const dto = new UpdateLinkDto();
      expect(dto).toBeInstanceOf(UpdateLinkDto);
      expect(dto).toBeDefined();
    });

    it("should have access to Zod schema validation", () => {
      expect(UpdateLinkDto.schema).toBeDefined();
      expect(UpdateLinkDto.schema).not.toBe(ShortenRequestSchema); // Should be different due to partial/omit
    });

    it("should be partial schema without url", () => {
      const baseSchema = ShortenRequestSchema.partial().omit({ url: true });
      // Deep comparison of schemas is complex, check key structure instead
      expect(Object.keys(UpdateLinkDto.schema.shape)).toEqual(
        Object.keys(baseSchema.shape)
      );
      expect(UpdateLinkDto.schema.shape).not.toHaveProperty("url");
    });
  });

  describe("Omitted Fields", () => {
    it("should not allow url field updates", () => {
      const result = UpdateLinkDto.schema.safeParse({
        url: "https://example.com",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty("url");
      }
    });

    it("should allow customSlug field updates", () => {
      const result = UpdateLinkDto.schema.safeParse({
        customSlug: "custom-slug",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.customSlug).toBe("custom-slug");
      }
    });

    it("should allow customSlug field updates", () => {
      // customSlug should be allowed, custom_slug is omitted
      const result = UpdateLinkDto.schema.safeParse({
        customSlug: "new-custom-slug",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.customSlug).toBe("new-custom-slug");
      }
    });
  });

  describe("Optional Field Validation", () => {
    it("should allow empty updates", () => {
      const result = UpdateLinkDto.schema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        // Only default values are applied
        expect(Object.keys(result.data)).toHaveLength(2);
        expect(result.data.deduplicate).toBe(false);
        expect(result.data.enhancedCanonical).toBe(false);
      }
    });

    describe("metadata field", () => {
      it("should allow metadata updates", () => {
        const validMetadata = {
          title: "Updated Title",
          tags: ["updated", "metadata"],
          user_name: "updateduser",
          source: "dashboard",
          custom_field: "updated_value",
          array_field: ["updated1", "updated2"],
        };

        const result = UpdateLinkDto.schema.safeParse({
          metadata: validMetadata,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.metadata).toEqual(validMetadata);
        }
      });

      it("should allow clearing metadata", () => {
        const result = UpdateLinkDto.schema.safeParse({
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
          const result = UpdateLinkDto.schema.safeParse({
            metadata,
          });
          expect(result.success).toBe(false);
        });
      });
    });

    describe("customSlug field", () => {
      it("should allow customSlug updates", () => {
        const validSlugs = [
          "a", // min length 1
          "updated-slug",
          "updated_slug",
          "UpdatedSlug123",
          "123456789012345678901", // max length 21
        ];

        validSlugs.forEach(customSlug => {
          const result = UpdateLinkDto.schema.safeParse({
            customSlug,
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.customSlug).toBe(customSlug);
          }
        });
      });

      it("should reject invalid slugs", () => {
        const invalidSlugs = [
          "", // too short
          "a".repeat(22), // too long
        ];

        invalidSlugs.forEach(customSlug => {
          const result = UpdateLinkDto.schema.safeParse({
            customSlug,
          });
          expect(result.success).toBe(false);
        });
      });
    });

    describe("slugStrategy field", () => {
      it("should allow strategy updates", () => {
        const validStrategies = ["nanoid", "uuid"];

        validStrategies.forEach(slugStrategy => {
          const result = UpdateLinkDto.schema.safeParse({
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
          "invalid", // not in enum
          "base58", // not in enum
          "", // empty string
          123, // wrong type
        ];

        invalidStrategies.forEach(slugStrategy => {
          const result = UpdateLinkDto.schema.safeParse({
            slugStrategy,
          });
          expect(result.success).toBe(false);
        });
      });
    });

    describe("length field", () => {
      it("should allow length updates", () => {
        const validLengths = [4, 7, 10, 15, 21];

        validLengths.forEach(length => {
          const result = UpdateLinkDto.schema.safeParse({
            length,
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.length).toBe(length);
          }
        });
      });

      it("should reject invalid lengths", () => {
        const invalidLengths = [0, 3, 22, 4.5, "7", null];

        invalidLengths.forEach(length => {
          const result = UpdateLinkDto.schema.safeParse({
            length,
          });
          expect(result.success).toBe(false);
        });
      });
    });

    describe("alphabetType field", () => {
      it("should allow alphabetType updates", () => {
        const validTypes = ["alphanumeric", "urlSafe", "readable"];

        validTypes.forEach(alphabetType => {
          const result = UpdateLinkDto.schema.safeParse({
            alphabetType,
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.alphabetType).toBe(alphabetType);
          }
        });
      });

      it("should reject invalid alphabet types", () => {
        const invalidTypes = ["base58", "hex", "", 123];

        invalidTypes.forEach(alphabetType => {
          const result = UpdateLinkDto.schema.safeParse({
            alphabetType,
          });
          expect(result.success).toBe(false);
        });
      });
    });

    describe("alphabet field", () => {
      it("should allow custom alphabet updates", () => {
        const validAlphabets = [
          "AB", // min length 2
          "0123456789ABCDEF",
          "CUSTOMALPHABET123",
          "!@#$%^&*()",
          "αβγδεζ", // unicode
        ];

        validAlphabets.forEach(alphabet => {
          const result = UpdateLinkDto.schema.safeParse({
            alphabet,
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.alphabet).toBe(alphabet);
          }
        });
      });

      it("should reject alphabets that are too short", () => {
        const tooShort = ["", "A"];

        tooShort.forEach(alphabet => {
          const result = UpdateLinkDto.schema.safeParse({
            alphabet,
          });
          expect(result.success).toBe(false);
        });
      });
    });

    describe("patternType field", () => {
      it("should allow patternType updates", () => {
        const validTypes = ["alphanumeric", "urlSafe", "readable"];

        validTypes.forEach(patternType => {
          const result = UpdateLinkDto.schema.safeParse({
            patternType,
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.patternType).toBe(patternType);
          }
        });
      });

      it("should reject invalid pattern types", () => {
        const invalidTypes = ["custom", "", 123];

        invalidTypes.forEach(patternType => {
          const result = UpdateLinkDto.schema.safeParse({
            patternType,
          });
          expect(result.success).toBe(false);
        });
      });
    });

    describe("pattern field", () => {
      it("should allow pattern updates", () => {
        const validPatterns = ["^[a-z]+$", "\\d{4}", "[A-Z0-9]+", ".*", ""];

        validPatterns.forEach(pattern => {
          const result = UpdateLinkDto.schema.safeParse({
            pattern,
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.pattern).toBe(pattern);
          }
        });
      });
    });

    describe("namespace field", () => {
      it("should allow namespace updates", () => {
        const validNamespaces = [
          "a", // min length 1
          "updated-namespace",
          "new_namespace_123",
          "a".repeat(50), // max length 50
        ];

        validNamespaces.forEach(namespace => {
          const result = UpdateLinkDto.schema.safeParse({
            namespace,
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.namespace).toBe(namespace);
          }
        });
      });

      it("should reject invalid namespaces", () => {
        const invalidNamespaces = [
          "", // too short
          "a".repeat(51), // too long
        ];

        invalidNamespaces.forEach(namespace => {
          const result = UpdateLinkDto.schema.safeParse({
            namespace,
          });
          expect(result.success).toBe(false);
        });
      });
    });

    describe("deduplication fields", () => {
      describe("deduplicate field", () => {
        it("should allow deduplicate updates", () => {
          [true, false].forEach(deduplicate => {
            const result = UpdateLinkDto.schema.safeParse({
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
            const result = UpdateLinkDto.schema.safeParse({
              deduplicate,
            });
            expect(result.success).toBe(false);
          });
        });

        it("should apply default value even in partial schema", () => {
          const result = UpdateLinkDto.schema.safeParse({});
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.deduplicate).toBe(false);
          }
        });
      });

      describe("deduplicationFields field", () => {
        it("should allow deduplicationFields updates", () => {
          const validFieldArrays = [
            ["title"],
            ["title", "author", "tags"],
            [], // empty array
            [
              "field1",
              "field2",
              "field3",
              "field4",
              "field5",
              "field6",
              "field7",
              "field8",
              "field9",
              "field10",
            ], // max 10
          ];

          validFieldArrays.forEach(deduplicationFields => {
            const result = UpdateLinkDto.schema.safeParse({
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

        it("should reject invalid field arrays", () => {
          const invalidArrays = [
            Array(11).fill("field"), // too many items
            [123], // non-string items
            "not-array", // not an array
          ];

          invalidArrays.forEach(deduplicationFields => {
            const result = UpdateLinkDto.schema.safeParse({
              deduplicationFields,
            });
            expect(result.success).toBe(false);
          });
        });
      });

      describe("enhancedCanonical field", () => {
        it("should allow enhancedCanonical updates", () => {
          [true, false].forEach(enhancedCanonical => {
            const result = UpdateLinkDto.schema.safeParse({
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
            const result = UpdateLinkDto.schema.safeParse({
              enhancedCanonical,
            });
            expect(result.success).toBe(false);
          });
        });

        it("should apply default value even in partial schema", () => {
          const result = UpdateLinkDto.schema.safeParse({});
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.enhancedCanonical).toBe(false);
          }
        });
      });
    });
  });

  describe("Complex Update Scenarios", () => {
    it("should handle complete metadata update", () => {
      const metadataUpdate = {
        metadata: {
          title: "Updated Title",
          tags: ["updated", "tags"],
          user_name: "newuser",
          source: "dashboard",
          category: "updated",
          priority: "high",
        },
      };

      const result = UpdateLinkDto.schema.safeParse(metadataUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata).toEqual(metadataUpdate.metadata);
      }
    });

    it("should handle slug configuration update", () => {
      const slugConfigUpdate = {
        customSlug: "new-custom-slug",
        slugStrategy: "uuid" as const,
        length: 12,
        alphabetType: "readable" as const,
        alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        patternType: "alphanumeric" as const,
        pattern: "^[A-Z]+$",
      };

      const result = UpdateLinkDto.schema.safeParse(slugConfigUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject(slugConfigUpdate);
        expect(result.data.deduplicate).toBe(false);
        expect(result.data.enhancedCanonical).toBe(false);
      }
    });

    it("should handle namespace and deduplication update", () => {
      const namespaceUpdate = {
        namespace: "new-namespace",
        deduplicate: true,
        deduplicationFields: ["title", "category"],
        enhancedCanonical: true,
      };

      const result = UpdateLinkDto.schema.safeParse(namespaceUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(namespaceUpdate);
      }
    });

    it("should handle partial updates", () => {
      const partialUpdates = [
        { metadata: { title: "Only Title Update" } },
        { customSlug: "only-slug-update" },
        { slugStrategy: "nanoid" as const },
        { length: 8 },
        { namespace: "only-namespace" },
        { deduplicate: false },
      ];

      partialUpdates.forEach(update => {
        const result = UpdateLinkDto.schema.safeParse(update);
        expect(result.success).toBe(true);
        if (result.success) {
          // Account for default values being added (unless explicitly set)
          const hasDeduplicateField = update.hasOwnProperty("deduplicate");
          const hasEnhancedCanonicalField =
            update.hasOwnProperty("enhancedCanonical");
          const defaultValues =
            2 -
            (hasDeduplicateField ? 1 : 0) -
            (hasEnhancedCanonicalField ? 1 : 0);
          const expectedKeys = Object.keys(update).length + defaultValues;
          expect(Object.keys(result.data)).toHaveLength(expectedKeys);
          expect(result.data).toMatchObject(update);
        }
      });
    });

    it("should handle mixed field updates", () => {
      const mixedUpdate = {
        metadata: {
          title: "Mixed Update",
          category: "mixed",
        },
        slugStrategy: "nanoid" as const,
        namespace: "mixed-namespace",
        deduplicate: true,
      };

      const result = UpdateLinkDto.schema.safeParse(mixedUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject(mixedUpdate);
        expect(result.data.enhancedCanonical).toBe(false); // Default value
      }
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle undefined values", () => {
      const undefinedUpdate = {
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

      const result = UpdateLinkDto.schema.safeParse(undefinedUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        // Should include all fields with defaults applied
        expect(Object.keys(result.data)).toHaveLength(12);
        expect(result.data.deduplicate).toBe(false);
        expect(result.data.enhancedCanonical).toBe(false);
      }
    });

    it("should handle null values appropriately", () => {
      const nullUpdate = {
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

      const result = UpdateLinkDto.schema.safeParse(nullUpdate);
      // Most null values should be invalid
      expect(result.success).toBe(false);
    });

    it("should provide detailed error messages for invalid updates", () => {
      const invalidUpdate = {
        customSlug: "", // too short
        length: 2, // too short
        alphabetType: "invalid", // not in enum
        alphabet: "A", // too short
        namespace: "", // too short
        deduplicationFields: Array(15).fill("field"), // too many
      };

      const result = UpdateLinkDto.schema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorPaths = result.error.issues.map((e: any) =>
          e.path.join(".")
        );
        expect(errorPaths).toContain("customSlug");
        expect(errorPaths).toContain("length");
        expect(errorPaths).toContain("alphabetType");
        expect(errorPaths).toContain("alphabet");
        expect(errorPaths).toContain("namespace");
        expect(errorPaths).toContain("deduplicationFields");
      }
    });

    it("should ignore extra properties", () => {
      const extraPropsUpdate = {
        metadata: { title: "Updated" },
        extraField: "should be ignored",
        anotherExtra: 123,
        url: "https://should-be-ignored.com", // omitted field
      };

      const result = UpdateLinkDto.schema.safeParse(extraPropsUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject({ metadata: { title: "Updated" } });
        expect(result.data.deduplicate).toBe(false);
        expect(result.data.enhancedCanonical).toBe(false);
        expect(result.data).not.toHaveProperty("extraField");
        expect(result.data).not.toHaveProperty("anotherExtra");
        expect(result.data).not.toHaveProperty("url");
      }
    });

    it("should handle large metadata updates", () => {
      const largeMetadata = Object.fromEntries(
        Array(100)
          .fill(0)
          .map((_, i) => [`field${i}`, `value${i}`])
      );

      const largeUpdate = {
        metadata: largeMetadata,
        deduplicationFields: Array(10)
          .fill(0)
          .map((_, i) => `field${i}`),
      };

      const result = UpdateLinkDto.schema.safeParse(largeUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.data.metadata || {}).length).toBe(100);
        expect(result.data.deduplicationFields?.length).toBe(10);
      }
    });
  });

  describe("Validation Consistency", () => {
    it("should maintain same validation rules as CreateLinkDto for common fields", () => {
      // Test that shared fields have identical validation
      const testData = {
        customSlug: "test-slug",
        slugStrategy: "nanoid" as const,
        length: 8,
        alphabetType: "urlSafe" as const,
        alphabet: "ABC123",
        patternType: "alphanumeric" as const,
        pattern: "^[A-Za-z0-9]+$",
        namespace: "test-namespace",
        deduplicate: true,
        deduplicationFields: ["title", "tags"],
        enhancedCanonical: false,
      };

      const updateResult = UpdateLinkDto.schema.safeParse(testData);
      expect(updateResult.success).toBe(true);

      // Same validation rules should apply
      const invalidData = {
        customSlug: "", // too short
        length: 2, // too short
        alphabetType: "invalid" as any,
        alphabet: "A", // too short
        namespace: "", // too short
      };

      const invalidResult = UpdateLinkDto.schema.safeParse(invalidData);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe("Real-world Update Scenarios", () => {
    it("should handle metadata-only update (most common)", () => {
      const metadataOnlyUpdate = {
        metadata: {
          title: "Updated Blog Post Title",
          tags: ["updated", "blog", "content"],
          category: "blog",
          author: "Updated Author",
        },
      };

      const result = UpdateLinkDto.schema.safeParse(metadataOnlyUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata).toEqual(metadataOnlyUpdate.metadata);
        expect(Object.keys(result.data)).toHaveLength(3); // metadata + 2 default values
      }
    });

    it("should handle slug configuration change", () => {
      const slugConfigChange = {
        slugStrategy: "uuid" as const,
        length: 12,
        alphabetType: "alphanumeric" as const,
      };

      const result = UpdateLinkDto.schema.safeParse(slugConfigChange);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject(slugConfigChange);
        expect(result.data.deduplicate).toBe(false);
        expect(result.data.enhancedCanonical).toBe(false);
      }
    });

    it("should handle namespace migration", () => {
      const namespaceMigration = {
        namespace: "new-organization",
        deduplicate: true,
        enhancedCanonical: true,
      };

      const result = UpdateLinkDto.schema.safeParse(namespaceMigration);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(namespaceMigration);
      }
    });

    it("should handle deduplication settings update", () => {
      const deduplicationUpdate = {
        deduplicate: false,
        deduplicationFields: [], // clear fields
        enhancedCanonical: false,
      };

      const result = UpdateLinkDto.schema.safeParse(deduplicationUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(deduplicationUpdate);
      }
    });

    it("should handle custom slug replacement", () => {
      const customSlugReplacement = {
        customSlug: "new-branded-slug",
        metadata: {
          title: "Updated with New Slug",
          source: "dashboard",
        },
      };

      const result = UpdateLinkDto.schema.safeParse(customSlugReplacement);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject(customSlugReplacement);
        expect(result.data.deduplicate).toBe(false);
        expect(result.data.enhancedCanonical).toBe(false);
      }
    });
  });

  describe("Schema Transformation Verification", () => {
    it("should properly transform ShortenRequestSchema", () => {
      // Verify that the schema is correctly transformed (partial + omit)
      const originalFields = Object.keys(ShortenRequestSchema.shape);
      const updateFields = Object.keys(UpdateLinkDto.schema.shape);

      // Should have all fields except url and custom_slug
      expect(updateFields).not.toContain("url");
      expect(updateFields).not.toContain("custom_slug");

      // Should contain all other fields
      const expectedFields = originalFields.filter(
        f => f !== "url" && f !== "custom_slug"
      );
      expectedFields.forEach(field => {
        expect(updateFields).toContain(field);
      });
    });

    it("should make all fields optional due to partial transformation", () => {
      // Every field should be optional
      const shape = UpdateLinkDto.schema.shape;
      Object.keys(shape).forEach(key => {
        expect((shape as any)[key].isOptional()).toBe(true);
      });
    });
  });
});
