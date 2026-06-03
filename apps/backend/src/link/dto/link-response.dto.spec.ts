import { ShortenResponseDto, UnshortenResponseDto } from "./link-response.dto";
import {
  ShortenResponseSchema,
  UnshortenResponseSchema,
} from "@url-shortener/types";
import { ZodError } from "zod";

describe("Link Response DTOs", () => {
  describe("ShortenResponseDto", () => {
    describe("DTO Structure", () => {
      it("should extend createZodDto with ShortenResponseSchema", () => {
        const dto = new ShortenResponseDto();
        expect(dto).toBeInstanceOf(ShortenResponseDto);
        expect(dto).toBeDefined();
      });

      it("should have access to Zod schema validation", () => {
        expect(ShortenResponseDto.schema).toBeDefined();
        expect(ShortenResponseDto.schema).toBe(ShortenResponseSchema);
      });
    });

    describe("Required Field Validation", () => {
      describe("short_url field", () => {
        it("should require short_url field", () => {
          const result = ShortenResponseDto.schema.safeParse({
            slug: "abc123",
            url: "https://example.com",
          });
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(
              result.error.issues.some(
                (e: any) =>
                  e.path.includes("short_url") && e.code === "invalid_type"
              )
            ).toBe(true);
          }
        });

        it("should accept valid short URLs", () => {
          const validShortUrls = [
            "https://short.ly/abc123",
            "http://s.co/xyz789",
            "https://domain.com/custom-slug",
            "https://localhost:3000/test123",
            "https://192.168.1.1:8080/slug",
          ];

          validShortUrls.forEach(short_url => {
            const result = ShortenResponseDto.schema.safeParse({
              short_url,
              slug: "abc123",
              url: "https://example.com",
            });
            expect(result.success).toBe(true);
            if (result.success) {
              expect(result.data.short_url).toBe(short_url);
            }
          });
        });

        it("should reject clearly invalid short URLs", () => {
          const invalidUrls = [
            "", // empty
            "://incomplete", // malformed
          ];

          invalidUrls.forEach(short_url => {
            const result = ShortenResponseDto.schema.safeParse({
              short_url,
              slug: "abc123",
              url: "https://example.com",
            });
            expect(result.success).toBe(false);
          });
        });
      });

      describe("slug field", () => {
        it("should require slug field", () => {
          const result = ShortenResponseDto.schema.safeParse({
            short_url: "https://short.ly/abc123",
            url: "https://example.com",
          });
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(
              result.error.issues.some(
                (e: any) => e.path.includes("slug") && e.code === "invalid_type"
              )
            ).toBe(true);
          }
        });

        it("should accept valid slugs", () => {
          const validSlugs = [
            "a", // min length 1
            "abc123",
            "custom-slug",
            "MixedCase123",
            "123456789012345678901", // max length 21
          ];

          validSlugs.forEach(slug => {
            const result = ShortenResponseDto.schema.safeParse({
              short_url: "https://short.ly/" + slug,
              slug,
              url: "https://example.com",
            });
            expect(result.success).toBe(true);
            if (result.success) {
              expect(result.data.slug).toBe(slug);
            }
          });
        });

        it("should reject invalid slugs", () => {
          const invalidSlugs = [
            "", // too short
            "a".repeat(22), // too long
            123, // wrong type
            null, // wrong type
          ];

          invalidSlugs.forEach(slug => {
            const result = ShortenResponseDto.schema.safeParse({
              short_url: "https://short.ly/abc123",
              slug,
              url: "https://example.com",
            });
            expect(result.success).toBe(false);
          });
        });
      });

      describe("url field", () => {
        it("should require url field", () => {
          const result = ShortenResponseDto.schema.safeParse({
            short_url: "https://short.ly/abc123",
            slug: "abc123",
          });
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(
              result.error.issues.some(
                (e: any) => e.path.includes("url") && e.code === "invalid_type"
              )
            ).toBe(true);
          }
        });

        it("should accept valid original URLs", () => {
          const validUrls = [
            "https://example.com",
            "http://test.com/path?param=value",
            "https://subdomain.domain.com/deep/path#fragment",
            "https://192.168.1.1:3000/api/endpoint",
          ];

          validUrls.forEach(url => {
            const result = ShortenResponseDto.schema.safeParse({
              short_url: "https://short.ly/abc123",
              slug: "abc123",
              url,
            });
            expect(result.success).toBe(true);
            if (result.success) {
              expect(result.data.url).toBe(url);
            }
          });
        });

        it("should reject invalid original URLs", () => {
          const invalidUrls = [
            "not-a-url",
            "domain.com", // missing protocol
            "", // empty
            123, // wrong type
          ];

          invalidUrls.forEach(url => {
            const result = ShortenResponseDto.schema.safeParse({
              short_url: "https://short.ly/abc123",
              slug: "abc123",
              url,
            });
            expect(result.success).toBe(false);
          });
        });
      });
    });

    describe("Optional Field Validation", () => {
      const baseValidResponse = {
        short_url: "https://short.ly/abc123",
        slug: "abc123",
        url: "https://example.com",
      };

      describe("strategy field", () => {
        it("should be optional", () => {
          const result = ShortenResponseDto.schema.safeParse(baseValidResponse);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).not.toHaveProperty("strategy");
          }
        });

        it("should accept valid strategy values", () => {
          const validStrategies = ["nanoid", "uuid", "custom", "base58"];

          validStrategies.forEach(strategy => {
            const result = ShortenResponseDto.schema.safeParse({
              ...baseValidResponse,
              strategy,
            });
            expect(result.success).toBe(true);
            if (result.success) {
              expect(result.data.strategy).toBe(strategy);
            }
          });
        });

        it("should have proper description", () => {
          const field = ShortenResponseDto.schema.shape.strategy;
          expect(field.description).toBe("Strategy used to generate the slug");
        });
      });

      describe("length field", () => {
        it("should be optional", () => {
          const result = ShortenResponseDto.schema.safeParse(baseValidResponse);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).not.toHaveProperty("length");
          }
        });

        it("should accept valid length values", () => {
          const validLengths = [1, 4, 7, 10, 21, 50];

          validLengths.forEach(length => {
            const result = ShortenResponseDto.schema.safeParse({
              ...baseValidResponse,
              length,
            });
            expect(result.success).toBe(true);
            if (result.success) {
              expect(result.data.length).toBe(length);
            }
          });
        });

        it("should reject non-numeric length values", () => {
          const invalidLengths = ["7", "ten", null, true];

          invalidLengths.forEach(length => {
            const result = ShortenResponseDto.schema.safeParse({
              ...baseValidResponse,
              length,
            });
            expect(result.success).toBe(false);
          });
        });

        it("should have proper description", () => {
          const field = ShortenResponseDto.schema.shape.length;
          expect(field.description).toBe("Actual length of the generated slug");
        });
      });

      describe("wasDeduped field", () => {
        it("should be optional", () => {
          const result = ShortenResponseDto.schema.safeParse(baseValidResponse);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).not.toHaveProperty("wasDeduped");
          }
        });

        it("should accept boolean values", () => {
          [true, false].forEach(wasDeduped => {
            const result = ShortenResponseDto.schema.safeParse({
              ...baseValidResponse,
              wasDeduped,
            });
            expect(result.success).toBe(true);
            if (result.success) {
              expect(result.data.wasDeduped).toBe(wasDeduped);
            }
          });
        });

        it("should reject non-boolean values", () => {
          ["true", "false", 1, 0, null].forEach(wasDeduped => {
            const result = ShortenResponseDto.schema.safeParse({
              ...baseValidResponse,
              wasDeduped,
            });
            expect(result.success).toBe(false);
          });
        });

        it("should have proper description", () => {
          const field = ShortenResponseDto.schema.shape.wasDeduped;
          expect(field.description).toBe(
            "Whether an existing slug was returned due to deduplication"
          );
        });
      });

      describe("wasCustomSlug field", () => {
        it("should be optional", () => {
          const result = ShortenResponseDto.schema.safeParse(baseValidResponse);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).not.toHaveProperty("wasCustomSlug");
          }
        });

        it("should accept boolean values", () => {
          [true, false].forEach(wasCustomSlug => {
            const result = ShortenResponseDto.schema.safeParse({
              ...baseValidResponse,
              wasCustomSlug,
            });
            expect(result.success).toBe(true);
            if (result.success) {
              expect(result.data.wasCustomSlug).toBe(wasCustomSlug);
            }
          });
        });

        it("should reject non-boolean values", () => {
          ["true", "false", 1, 0, null].forEach(wasCustomSlug => {
            const result = ShortenResponseDto.schema.safeParse({
              ...baseValidResponse,
              wasCustomSlug,
            });
            expect(result.success).toBe(false);
          });
        });

        it("should have proper description", () => {
          const field = ShortenResponseDto.schema.shape.wasCustomSlug;
          expect(field.description).toBe(
            "Whether the slug was provided by the user"
          );
        });
      });

      describe("namespace field", () => {
        it("should be optional", () => {
          const result = ShortenResponseDto.schema.safeParse(baseValidResponse);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).not.toHaveProperty("namespace");
          }
        });

        it("should accept valid namespace values", () => {
          const validNamespaces = ["user-123", "org_456", "project.name"];

          validNamespaces.forEach(namespace => {
            const result = ShortenResponseDto.schema.safeParse({
              ...baseValidResponse,
              namespace,
            });
            expect(result.success).toBe(true);
            if (result.success) {
              expect(result.data.namespace).toBe(namespace);
            }
          });
        });

        it("should have proper description", () => {
          const field = ShortenResponseDto.schema.shape.namespace;
          expect(field.description).toBe("Namespace used for the slug");
        });
      });

      describe("spaceUsage field", () => {
        it("should be optional", () => {
          const result = ShortenResponseDto.schema.safeParse(baseValidResponse);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).not.toHaveProperty("spaceUsage");
          }
        });

        it("should accept valid spaceUsage object", () => {
          const validSpaceUsage = {
            usagePercentage: 0.75,
            status: "warning" as const,
            remainingSpace: 1000000,
          };

          const result = ShortenResponseDto.schema.safeParse({
            ...baseValidResponse,
            spaceUsage: validSpaceUsage,
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.spaceUsage).toEqual(validSpaceUsage);
          }
        });

        it("should validate spaceUsage properties", () => {
          const validStatuses = ["safe", "warning", "critical", "exhausted"];

          validStatuses.forEach(status => {
            const result = ShortenResponseDto.schema.safeParse({
              ...baseValidResponse,
              spaceUsage: {
                usagePercentage: 0.5,
                status: status as any,
                remainingSpace: 500000,
              },
            });
            expect(result.success).toBe(true);
          });
        });

        it("should reject invalid spaceUsage status", () => {
          const invalidStatuses = ["unknown", "invalid", ""];

          invalidStatuses.forEach(status => {
            const result = ShortenResponseDto.schema.safeParse({
              ...baseValidResponse,
              spaceUsage: {
                usagePercentage: 0.5,
                status,
                remainingSpace: 500000,
              },
            });
            expect(result.success).toBe(false);
          });
        });

        it("should require all spaceUsage properties", () => {
          const incompleteSpaceUsage = {
            usagePercentage: 0.5,
            // missing status and remainingSpace
          };

          const result = ShortenResponseDto.schema.safeParse({
            ...baseValidResponse,
            spaceUsage: incompleteSpaceUsage,
          });
          expect(result.success).toBe(false);
        });

        it("should have proper description", () => {
          const field = ShortenResponseDto.schema.shape.spaceUsage;
          expect(field.description).toBe("Slug space usage information");
        });

        it("should validate spaceUsage nested field descriptions", () => {
          const spaceUsageSchema =
            ShortenResponseDto.schema.shape.spaceUsage.unwrap();

          expect(spaceUsageSchema.shape.usagePercentage.description).toBe(
            "Current space usage percentage"
          );
          expect(spaceUsageSchema.shape.status.description).toBe(
            "Space usage status"
          );
          expect(spaceUsageSchema.shape.remainingSpace.description).toBe(
            "Remaining space in this configuration"
          );
        });
      });
    });

    describe("Complete Response Scenarios", () => {
      it("should validate minimal response", () => {
        const minimalResponse = {
          short_url: "https://short.ly/abc123",
          slug: "abc123",
          url: "https://example.com",
        };

        const result = ShortenResponseDto.schema.safeParse(minimalResponse);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(minimalResponse);
        }
      });

      it("should validate complete response with all optional fields", () => {
        const completeResponse = {
          short_url: "https://short.ly/custom-slug",
          slug: "custom-slug",
          url: "https://example.com/original/path",
          strategy: "nanoid",
          length: 11,
          wasDeduped: false,
          wasCustomSlug: true,
          namespace: "user-123",
          spaceUsage: {
            usagePercentage: 0.25,
            status: "safe" as const,
            remainingSpace: 750000,
          },
        };

        const result = ShortenResponseDto.schema.safeParse(completeResponse);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(completeResponse);
        }
      });

      it("should handle deduplication scenarios", () => {
        const dedupedResponse = {
          short_url: "https://short.ly/existing",
          slug: "existing",
          url: "https://example.com",
          strategy: "nanoid",
          wasDeduped: true,
          wasCustomSlug: false,
        };

        const result = ShortenResponseDto.schema.safeParse(dedupedResponse);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.wasDeduped).toBe(true);
        }
      });

      it("should handle space usage warning scenarios", () => {
        const warningResponse = {
          short_url: "https://short.ly/warn123",
          slug: "warn123",
          url: "https://example.com",
          spaceUsage: {
            usagePercentage: 0.85,
            status: "warning" as const,
            remainingSpace: 15000,
          },
        };

        const result = ShortenResponseDto.schema.safeParse(warningResponse);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.spaceUsage?.status).toBe("warning");
        }
      });
    });

    describe("Real-world Response Examples", () => {
      it("should handle API-generated responses", () => {
        const apiResponse = {
          short_url: "https://api.short.ly/V1StGXR8",
          slug: "V1StGXR8",
          url: "https://api.example.com/data/endpoint",
          strategy: "nanoid",
          length: 8,
          wasDeduped: false,
          wasCustomSlug: false,
          namespace: "api-endpoints",
        };

        const result = ShortenResponseDto.schema.safeParse(apiResponse);
        expect(result.success).toBe(true);
      });

      it("should handle dashboard-generated responses", () => {
        const dashboardResponse = {
          short_url: "https://company.ly/product-page",
          slug: "product-page",
          url: "https://company.com/products/special-offer",
          strategy: "custom",
          length: 12,
          wasDeduped: false,
          wasCustomSlug: true,
          namespace: "marketing",
          spaceUsage: {
            usagePercentage: 0.45,
            status: "safe" as const,
            remainingSpace: 550000,
          },
        };

        const result = ShortenResponseDto.schema.safeParse(dashboardResponse);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("UnshortenResponseDto", () => {
    describe("DTO Structure", () => {
      it("should extend createZodDto with UnshortenResponseSchema", () => {
        const dto = new UnshortenResponseDto();
        expect(dto).toBeInstanceOf(UnshortenResponseDto);
        expect(dto).toBeDefined();
      });

      it("should have access to Zod schema validation", () => {
        expect(UnshortenResponseDto.schema).toBeDefined();
        expect(UnshortenResponseDto.schema).toBe(UnshortenResponseSchema);
      });
    });

    describe("Required Field Validation", () => {
      describe("url field", () => {
        it("should require url field", () => {
          const result = UnshortenResponseDto.schema.safeParse({});
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(
              result.error.issues.some(
                (e: any) => e.path.includes("url") && e.code === "invalid_type"
              )
            ).toBe(true);
          }
        });

        it("should accept valid URLs", () => {
          const validUrls = [
            "https://example.com",
            "http://test.com/path",
            "https://subdomain.domain.com/deep/path?param=value#fragment",
            "https://192.168.1.1:3000/api/endpoint",
            "ftp://files.example.com/file.txt",
          ];

          validUrls.forEach(url => {
            const result = UnshortenResponseDto.schema.safeParse({ url });
            expect(result.success).toBe(true);
            if (result.success) {
              expect(result.data.url).toBe(url);
            }
          });
        });

        it("should reject invalid URLs", () => {
          const invalidUrls = [
            "not-a-url",
            "example.com", // missing protocol
            "http://", // incomplete
            "", // empty
            123, // wrong type
            null, // wrong type
          ];

          invalidUrls.forEach(url => {
            const result = UnshortenResponseDto.schema.safeParse({ url });
            expect(result.success).toBe(false);
          });
        });
      });
    });

    describe("Schema Structure", () => {
      it("should only have url field", () => {
        const schema = UnshortenResponseDto.schema;
        const fields = Object.keys(schema.shape);

        expect(fields).toHaveLength(1);
        expect(fields).toContain("url");
      });

      it("should not accept extra fields", () => {
        const responseWithExtraFields = {
          url: "https://example.com",
          extraField: "should be ignored",
          metadata: { title: "test" },
        };

        const result = UnshortenResponseDto.schema.safeParse(
          responseWithExtraFields
        );
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual({ url: "https://example.com" });
          expect(result.data).not.toHaveProperty("extraField");
          expect(result.data).not.toHaveProperty("metadata");
        }
      });
    });

    describe("Response Examples", () => {
      it("should handle typical unshorten responses", () => {
        const typicalResponses = [
          { url: "https://example.com" },
          { url: "https://www.google.com/search?q=test" },
          { url: "https://github.com/user/repo/issues/123" },
          { url: "https://docs.example.com/api/reference" },
          { url: "https://blog.example.com/2023/article-title" },
        ];

        typicalResponses.forEach(response => {
          const result = UnshortenResponseDto.schema.safeParse(response);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).toEqual(response);
          }
        });
      });

      it("should handle edge case URLs", () => {
        const edgeCaseUrls = [
          { url: "https://localhost:3000" },
          { url: "https://127.0.0.1:8080/test" },
          { url: "https://example.com/path/with/很多/unicode/字符" },
          { url: "https://example.com/path?param=" }, // empty param value
          { url: "https://example.com/#" }, // empty fragment
        ];

        edgeCaseUrls.forEach(response => {
          const result = UnshortenResponseDto.schema.safeParse(response);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).toEqual(response);
          }
        });
      });
    });

    describe("Error Handling", () => {
      it("should provide clear error messages", () => {
        const result = UnshortenResponseDto.schema.safeParse({
          url: "not-a-url",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
          expect(result.error.issues[0].message).toContain("Invalid URL");
        }
      });

      it("should handle missing url field", () => {
        const result = UnshortenResponseDto.schema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(
            result.error.issues.some(
              (e: any) => e.path.includes("url") && e.code === "invalid_type"
            )
          ).toBe(true);
        }
      });
    });
  });

  describe("Schema Consistency", () => {
    it("should maintain schema consistency with type definitions", () => {
      expect(ShortenResponseDto.schema).toBe(ShortenResponseSchema);
      expect(UnshortenResponseDto.schema).toBe(UnshortenResponseSchema);
    });

    it("should have consistent validation with manual schema usage", () => {
      const shortenData = {
        short_url: "https://short.ly/test",
        slug: "test",
        url: "https://example.com",
      };

      const dtoResult = ShortenResponseDto.schema.safeParse(shortenData);
      const directResult = ShortenResponseSchema.safeParse(shortenData);

      expect(dtoResult.success).toBe(directResult.success);
      if (dtoResult.success && directResult.success) {
        expect(dtoResult.data).toEqual(directResult.data);
      }

      const unshortenData = { url: "https://example.com" };

      const dtoResult2 = UnshortenResponseDto.schema.safeParse(unshortenData);
      const directResult2 = UnshortenResponseSchema.safeParse(unshortenData);

      expect(dtoResult2.success).toBe(directResult2.success);
      if (dtoResult2.success && directResult2.success) {
        expect(dtoResult2.data).toEqual(directResult2.data);
      }
    });
  });

  describe("Performance", () => {
    it("should validate responses efficiently", () => {
      const response = {
        short_url: "https://short.ly/perf-test",
        slug: "perf-test",
        url: "https://example.com/performance",
        strategy: "nanoid",
        length: 9,
        wasDeduped: false,
        wasCustomSlug: false,
        spaceUsage: {
          usagePercentage: 0.1,
          status: "safe" as const,
          remainingSpace: 900000,
        },
      };

      const iterations = 1000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        const result = ShortenResponseDto.schema.safeParse(response);
        expect(result.success).toBe(true);
      }

      const end = performance.now();
      const averageTime = (end - start) / iterations;
      expect(averageTime).toBeLessThan(1); // Should average less than 1ms per validation
    });
  });
});
