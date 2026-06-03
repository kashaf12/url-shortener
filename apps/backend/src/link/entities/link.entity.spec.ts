import { Link } from "./link.entity";
import { LinkMetadata } from "@url-shortener/types";

describe("Link Entity", () => {
  let link: Link;

  beforeEach(() => {
    link = new Link();
  });

  describe("Entity Structure", () => {
    it("should create a new Link entity", () => {
      expect(link).toBeInstanceOf(Link);
      expect(link).toBeDefined();
    });

    it("should have all required properties", () => {
      // Properties should be defined (not necessarily with values)
      expect(link.hasOwnProperty("id")).toBe(true);
      expect(link.hasOwnProperty("slug")).toBe(true);
      expect(link.hasOwnProperty("url")).toBe(true);
      expect(link.hasOwnProperty("metadata")).toBe(true);
      expect(link.hasOwnProperty("metadata_hash")).toBe(true);
      expect(link.hasOwnProperty("slug_strategy")).toBe(true);
      expect(link.hasOwnProperty("slug_length")).toBe(true);
      expect(link.hasOwnProperty("namespace")).toBe(true);
      expect(link.hasOwnProperty("click_count")).toBe(true);
      expect(link.hasOwnProperty("created_at")).toBe(true);
      expect(link.hasOwnProperty("updated_at")).toBe(true);
      expect(link.hasOwnProperty("last_clicked_at")).toBe(true);
      expect(link.hasOwnProperty("status")).toBe(true);
      expect(link.hasOwnProperty("source")).toBe(true);
    });

    it("should have correct TypeScript types", () => {
      link.id = "uuid-string";
      link.slug = "abc123";
      link.url = "https://example.com";
      link.metadata = {};
      link.metadata_hash = "hash123";
      link.slug_strategy = "nanoid";
      link.slug_length = 7;
      link.namespace = "test";
      link.click_count = 0;
      link.created_at = new Date();
      link.updated_at = new Date();
      link.last_clicked_at = new Date();
      link.status = "active";
      link.source = "public_web";

      expect(typeof link.id).toBe("string");
      expect(typeof link.slug).toBe("string");
      expect(typeof link.url).toBe("string");
      expect(typeof link.metadata).toBe("object");
      expect(typeof link.metadata_hash).toBe("string");
      expect(typeof link.slug_strategy).toBe("string");
      expect(typeof link.slug_length).toBe("number");
      expect(typeof link.namespace).toBe("string");
      expect(typeof link.click_count).toBe("number");
      expect(link.created_at).toBeInstanceOf(Date);
      expect(link.updated_at).toBeInstanceOf(Date);
      expect(link.last_clicked_at).toBeInstanceOf(Date);
      expect(["active", "inactive", "archived"]).toContain(link.status);
      expect(["public_web", "dashboard", "api"]).toContain(link.source);
    });
  });

  describe("Property Validation", () => {
    describe("slug", () => {
      it("should accept valid slug values", () => {
        const validSlugs = [
          "abc123",
          "ABC123",
          "a1b2c3",
          "short",
          "verylongslugname123",
          "mix3dC4se",
          "numbers123456",
          "single-hyphen",
          "under_score",
        ];

        validSlugs.forEach(slug => {
          expect(() => {
            link.slug = slug;
          }).not.toThrow();
          expect(link.slug).toBe(slug);
        });
      });

      it("should handle slug length constraints", () => {
        // Test various lengths within database constraints
        const testSlugs = [
          "a", // 1 char
          "ab", // 2 chars
          "abc", // 3 chars
          "abcd", // 4 chars (minimum recommended)
          "abcdefg", // 7 chars (default)
          "abcdefghij", // 10 chars
          "abcdefghijklmnopqrst", // 20 chars (max length for varchar(20))
        ];

        testSlugs.forEach(slug => {
          if (slug.length <= 20) {
            expect(() => {
              link.slug = slug;
            }).not.toThrow();
            expect(link.slug).toBe(slug);
          }
        });
      });

      it("should handle special characters appropriately", () => {
        // These should be handled by application validation, not entity
        const specialCharSlugs = [
          "test-slug",
          "test_slug",
          "test.slug",
          "test123!",
          "test@slug",
          "test#slug",
          "test$slug",
        ];

        specialCharSlugs.forEach(slug => {
          expect(() => {
            link.slug = slug;
          }).not.toThrow();
          expect(link.slug).toBe(slug);
        });
      });
    });

    describe("url", () => {
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
          "mailto:test@example.com",
        ];

        validUrls.forEach(url => {
          expect(() => {
            link.url = url;
          }).not.toThrow();
          expect(link.url).toBe(url);
        });
      });

      it("should handle very long URLs", () => {
        const longUrl = "https://example.com/" + "a".repeat(2000);

        expect(() => {
          link.url = longUrl;
        }).not.toThrow();
        expect(link.url).toBe(longUrl);
      });

      it("should handle URLs with unicode characters", () => {
        const unicodeUrls = [
          "https://example.com/ñ",
          "https://example.com/测试",
          "https://example.com/🚀",
          "https://xn--nxasmq6b.example.com", // punycode
        ];

        unicodeUrls.forEach(url => {
          expect(() => {
            link.url = url;
          }).not.toThrow();
          expect(link.url).toBe(url);
        });
      });
    });

    describe("metadata", () => {
      it("should accept empty metadata object", () => {
        const emptyMetadata = {};

        expect(() => {
          link.metadata = emptyMetadata;
        }).not.toThrow();
        expect(link.metadata).toEqual(emptyMetadata);
      });

      it("should accept valid LinkMetadata properties", () => {
        const validMetadata: LinkMetadata = {
          title: "Example Page",
          description: "This is an example page",
          author: "John Doe",
          keywords: ["example", "test"],
          category: "test",
          priority: "1",
        };

        expect(() => {
          link.metadata = validMetadata;
        }).not.toThrow();
        expect(link.metadata).toEqual(validMetadata);
      });

      it("should handle nested metadata objects", () => {
        const nestedMetadata: LinkMetadata = {
          nested_value: "test",
          nested_number: "42",
          nested_array: ["1", "2", "3"],
        };

        expect(() => {
          link.metadata = nestedMetadata;
        }).not.toThrow();
        expect(link.metadata).toEqual(nestedMetadata);
      });

      it("should handle metadata with all optional properties", () => {
        const fullMetadata: LinkMetadata = {
          title: "Full Title",
          description: "Complete description",
          author: "Full Author Name",
          tags: ["keyword1", "keyword2", "keyword3"],
          category: "full",
          subcategory: "complete",
          tags_list: ["tag1", "tag2"],
          priority: "5",
          isPublic: "true",
          setting1: "value1",
          setting2: "42",
          setting3: "true",
        };

        expect(() => {
          link.metadata = fullMetadata;
        }).not.toThrow();
        expect(link.metadata).toEqual(fullMetadata);
      });
    });

    describe("metadata_hash", () => {
      it("should accept null values", () => {
        expect(() => {
          link.metadata_hash = null;
        }).not.toThrow();
        expect(link.metadata_hash).toBeNull();
      });

      it("should accept valid hash strings", () => {
        const validHashes = [
          "a1b2c3d4e5f6",
          "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890", // 64 chars
          "sha256hash123",
          "md5hash32characters123456789012",
        ];

        validHashes.forEach(hash => {
          expect(() => {
            link.metadata_hash = hash;
          }).not.toThrow();
          expect(link.metadata_hash).toBe(hash);
        });
      });

      it("should handle maximum length hash (64 chars)", () => {
        const maxLengthHash = "a".repeat(64);

        expect(() => {
          link.metadata_hash = maxLengthHash;
        }).not.toThrow();
        expect(link.metadata_hash).toBe(maxLengthHash);
      });
    });

    describe("slug_strategy", () => {
      it("should accept valid strategy names", () => {
        const validStrategies = [
          "nanoid",
          "uuid",
          "base58",
          "custom",
          "sequential",
        ];

        validStrategies.forEach(strategy => {
          expect(() => {
            link.slug_strategy = strategy;
          }).not.toThrow();
          expect(link.slug_strategy).toBe(strategy);
        });
      });

      it("should handle strategy name length constraints", () => {
        const longStrategy = "verylongstrategyname"; // 20 chars

        expect(() => {
          link.slug_strategy = longStrategy;
        }).not.toThrow();
        expect(link.slug_strategy).toBe(longStrategy);
      });
    });

    describe("slug_length", () => {
      it("should accept valid length values", () => {
        const validLengths = [1, 4, 7, 10, 12, 15, 20, 21];

        validLengths.forEach(length => {
          expect(() => {
            link.slug_length = length;
          }).not.toThrow();
          expect(link.slug_length).toBe(length);
        });
      });

      it("should handle boundary length values", () => {
        expect(() => {
          link.slug_length = 0;
        }).not.toThrow();
        expect(link.slug_length).toBe(0);

        expect(() => {
          link.slug_length = 1000;
        }).not.toThrow();
        expect(link.slug_length).toBe(1000);
      });

      it("should handle negative length values", () => {
        expect(() => {
          link.slug_length = -1;
        }).not.toThrow();
        expect(link.slug_length).toBe(-1);
      });
    });

    describe("namespace", () => {
      it("should accept null namespace", () => {
        expect(() => {
          link.namespace = null;
        }).not.toThrow();
        expect(link.namespace).toBeNull();
      });

      it("should accept valid namespace values", () => {
        const validNamespaces = [
          "user123",
          "org-456",
          "team_789",
          "project.abc",
          "a",
          "verylongnamespacenamethatisstillvalid123456789",
        ];

        validNamespaces.forEach(namespace => {
          expect(() => {
            link.namespace = namespace;
          }).not.toThrow();
          expect(link.namespace).toBe(namespace);
        });
      });

      it("should handle maximum namespace length (50 chars)", () => {
        const maxNamespace = "a".repeat(50);

        expect(() => {
          link.namespace = maxNamespace;
        }).not.toThrow();
        expect(link.namespace).toBe(maxNamespace);
      });
    });

    describe("click_count", () => {
      it("should accept zero and positive integers", () => {
        const validCounts = [0, 1, 100, 1000, 999999, 1000000];

        validCounts.forEach(count => {
          expect(() => {
            link.click_count = count;
          }).not.toThrow();
          expect(link.click_count).toBe(count);
        });
      });

      it("should handle large click counts", () => {
        const largeCounts = [Number.MAX_SAFE_INTEGER, 9007199254740991];

        largeCounts.forEach(count => {
          expect(() => {
            link.click_count = count;
          }).not.toThrow();
          expect(link.click_count).toBe(count);
        });
      });

      it("should handle negative click counts", () => {
        expect(() => {
          link.click_count = -1;
        }).not.toThrow();
        expect(link.click_count).toBe(-1);
      });
    });

    describe("timestamp fields", () => {
      it("should accept valid Date objects", () => {
        const now = new Date();
        const past = new Date("2020-01-01");
        const future = new Date("2030-12-31");

        expect(() => {
          link.created_at = now;
          link.updated_at = now;
          link.last_clicked_at = past;
        }).not.toThrow();

        expect(link.created_at).toBe(now);
        expect(link.updated_at).toBe(now);
        expect(link.last_clicked_at).toBe(past);

        expect(() => {
          link.last_clicked_at = future;
        }).not.toThrow();
        expect(link.last_clicked_at).toBe(future);
      });

      it("should accept null for last_clicked_at", () => {
        expect(() => {
          link.last_clicked_at = null;
        }).not.toThrow();
        expect(link.last_clicked_at).toBeNull();
      });

      it("should handle edge date cases", () => {
        const edgeDates = [
          new Date(0), // Unix epoch
          new Date("1970-01-01T00:00:00.000Z"), // Unix epoch UTC
          new Date(8640000000000000), // Max date
          new Date(-8640000000000000), // Min date
        ];

        edgeDates.forEach(date => {
          expect(() => {
            link.created_at = date;
            link.updated_at = date;
            link.last_clicked_at = date;
          }).not.toThrow();
        });
      });
    });

    describe("status", () => {
      it("should accept all valid status values", () => {
        const validStatuses: Array<"active" | "inactive" | "archived"> = [
          "active",
          "inactive",
          "archived",
        ];

        validStatuses.forEach(status => {
          expect(() => {
            link.status = status;
          }).not.toThrow();
          expect(link.status).toBe(status);
        });
      });

      it("should handle status transitions", () => {
        link.status = "active";
        expect(link.status).toBe("active");

        link.status = "inactive";
        expect(link.status).toBe("inactive");

        link.status = "archived";
        expect(link.status).toBe("archived");

        link.status = "active";
        expect(link.status).toBe("active");
      });
    });

    describe("source", () => {
      it("should accept all valid source values", () => {
        const validSources: Array<"public_web" | "dashboard" | "api"> = [
          "public_web",
          "dashboard",
          "api",
        ];

        validSources.forEach(source => {
          expect(() => {
            link.source = source;
          }).not.toThrow();
          expect(link.source).toBe(source);
        });
      });

      it("should handle source changes", () => {
        link.source = "public_web";
        expect(link.source).toBe("public_web");

        link.source = "dashboard";
        expect(link.source).toBe("dashboard");

        link.source = "api";
        expect(link.source).toBe("api");
      });
    });
  });

  describe("Entity State Management", () => {
    it("should maintain property values after assignment", () => {
      const testData = {
        id: "test-uuid-123",
        slug: "test123",
        url: "https://test.example.com",
        metadata: { title: "Test" },
        metadata_hash: "testhash123",
        slug_strategy: "nanoid",
        slug_length: 8,
        namespace: "test-namespace",
        click_count: 42,
        created_at: new Date("2023-01-01"),
        updated_at: new Date("2023-01-02"),
        last_clicked_at: new Date("2023-01-03"),
        status: "active" as const,
        source: "api" as const,
      };

      // Assign all properties
      Object.assign(link, testData);

      // Verify all properties are maintained
      expect(link.id).toBe(testData.id);
      expect(link.slug).toBe(testData.slug);
      expect(link.url).toBe(testData.url);
      expect(link.metadata).toEqual(testData.metadata);
      expect(link.metadata_hash).toBe(testData.metadata_hash);
      expect(link.slug_strategy).toBe(testData.slug_strategy);
      expect(link.slug_length).toBe(testData.slug_length);
      expect(link.namespace).toBe(testData.namespace);
      expect(link.click_count).toBe(testData.click_count);
      expect(link.created_at).toBe(testData.created_at);
      expect(link.updated_at).toBe(testData.updated_at);
      expect(link.last_clicked_at).toBe(testData.last_clicked_at);
      expect(link.status).toBe(testData.status);
      expect(link.source).toBe(testData.source);
    });

    it("should handle partial property updates", () => {
      // Set initial state
      link.slug = "initial";
      link.click_count = 0;
      link.status = "active";

      // Update specific properties
      link.click_count = 100;
      link.status = "inactive";

      // Verify updated properties
      expect(link.slug).toBe("initial"); // unchanged
      expect(link.click_count).toBe(100); // updated
      expect(link.status).toBe("inactive"); // updated
    });

    it("should handle property overwrites", () => {
      link.metadata = { title: "Original" };
      expect(link.metadata.title).toBe("Original");

      link.metadata = { title: "Updated", description: "New" };
      expect(link.metadata.title).toBe("Updated");
      expect(link.metadata.description).toBe("New");

      link.metadata = {};
      expect(link.metadata.title).toBeUndefined();
      expect(link.metadata.description).toBeUndefined();
    });
  });

  describe("Entity Serialization", () => {
    it("should serialize to JSON correctly", () => {
      const testLink = Object.assign(new Link(), {
        id: "test-id",
        slug: "test",
        url: "https://example.com",
        metadata: { title: "Test" },
        metadata_hash: "hash",
        slug_strategy: "nanoid",
        slug_length: 7,
        namespace: null,
        click_count: 0,
        created_at: new Date("2023-01-01"),
        updated_at: new Date("2023-01-02"),
        last_clicked_at: null,
        status: "active",
        source: "api",
      });

      const serialized = JSON.stringify(testLink);
      const parsed = JSON.parse(serialized);

      expect(parsed.id).toBe("test-id");
      expect(parsed.slug).toBe("test");
      expect(parsed.url).toBe("https://example.com");
      expect(parsed.metadata).toEqual({ title: "Test" });
      expect(parsed.metadata_hash).toBe("hash");
      expect(parsed.slug_strategy).toBe("nanoid");
      expect(parsed.slug_length).toBe(7);
      expect(parsed.namespace).toBeNull();
      expect(parsed.click_count).toBe(0);
      expect(parsed.created_at).toBe("2023-01-01T00:00:00.000Z");
      expect(parsed.updated_at).toBe("2023-01-02T00:00:00.000Z");
      expect(parsed.last_clicked_at).toBeNull();
      expect(parsed.status).toBe("active");
      expect(parsed.source).toBe("api");
    });

    it("should handle JSON serialization with complex metadata", () => {
      link.metadata = {
        title: "Complex Test",
        nested_value: "test",
        array_data: ["1", "2", "3"],
        bool_flag: "true",
        null_field: "null",
      };

      const serialized = JSON.stringify(link.metadata);
      const parsed = JSON.parse(serialized);

      expect(parsed).toEqual(link.metadata);
      expect(parsed.nested_value).toBe("test");
      expect(parsed.array_data).toEqual(["1", "2", "3"]);
      expect(parsed.bool_flag).toBe("true");
      expect(parsed.null_field).toBe("null");
    });
  });

  describe("Entity Comparison", () => {
    it("should compare entities by reference", () => {
      const link1 = new Link();
      const link2 = new Link();
      const link3 = link1;

      expect(link1 === link2).toBe(false);
      expect(link1 === link3).toBe(true);
      expect(link1 !== link2).toBe(true);
    });

    it("should compare entities by content", () => {
      const link1 = Object.assign(new Link(), {
        id: "test-1",
        slug: "test",
        url: "https://example.com",
      });

      const link2 = Object.assign(new Link(), {
        id: "test-1",
        slug: "test",
        url: "https://example.com",
      });

      const link3 = Object.assign(new Link(), {
        id: "test-2",
        slug: "test",
        url: "https://example.com",
      });

      expect(link1.id).toBe(link2.id);
      expect(link1.slug).toBe(link2.slug);
      expect(link1.url).toBe(link2.url);

      expect(link1.id).not.toBe(link3.id);
      expect(link1.slug).toBe(link3.slug);
      expect(link1.url).toBe(link3.url);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle undefined assignments", () => {
      expect(() => {
        link.metadata_hash = undefined as any;
        link.namespace = undefined as any;
        link.last_clicked_at = undefined as any;
      }).not.toThrow();
    });

    it("should handle empty string assignments", () => {
      expect(() => {
        link.slug = "";
        link.url = "";
        link.metadata_hash = "";
        link.slug_strategy = "";
        link.namespace = "";
      }).not.toThrow();

      expect(link.slug).toBe("");
      expect(link.url).toBe("");
      expect(link.metadata_hash).toBe("");
      expect(link.slug_strategy).toBe("");
      expect(link.namespace).toBe("");
    });

    it("should handle type coercion", () => {
      // Numbers as strings
      expect(() => {
        link.slug_length = "7" as any;
        link.click_count = "100" as any;
      }).not.toThrow();

      expect(link.slug_length).toBe("7");
      expect(link.click_count).toBe("100");
    });

    it("should handle property deletion", () => {
      link.slug = "test";
      link.namespace = "test-namespace";

      expect(link.slug).toBe("test");
      expect(link.namespace).toBe("test-namespace");

      delete (link as any).slug;
      delete (link as any).namespace;

      expect(link.slug).toBeUndefined();
      expect(link.namespace).toBeUndefined();
    });
  });

  describe("Real-world Usage Scenarios", () => {
    it("should handle typical link creation scenario", () => {
      const newLink = Object.assign(new Link(), {
        id: "550e8400-e29b-41d4-a716-446655440000",
        slug: "abc123",
        url: "https://example.com/very/long/path?param=value",
        metadata: {
          title: "Example Page",
          description: "A test page",
          author: "Test User",
        },
        metadata_hash: "a3f5d8e2b1c947..." + "0".repeat(40), // 64 char hash
        slug_strategy: "nanoid",
        slug_length: 7,
        namespace: null,
        click_count: 0,
        status: "active",
        source: "api",
        created_at: new Date(),
        updated_at: new Date(),
        last_clicked_at: null,
      });

      expect(newLink.slug).toBe("abc123");
      expect(newLink.url).toContain("example.com");
      expect(newLink.metadata.title).toBe("Example Page");
      expect(newLink.click_count).toBe(0);
      expect(newLink.status).toBe("active");
      expect(newLink.last_clicked_at).toBeNull();
    });

    it("should handle link update scenario", () => {
      // Initial state
      link.click_count = 50;
      link.last_clicked_at = null;
      link.status = "active";
      const originalUpdatedAt = new Date("2023-01-01");
      link.updated_at = originalUpdatedAt;

      // Simulate click tracking
      link.click_count += 1;
      link.last_clicked_at = new Date();
      link.updated_at = new Date();

      expect(link.click_count).toBe(51);
      expect(link.last_clicked_at).toBeInstanceOf(Date);
      expect(link.updated_at.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });

    it("should handle link archival scenario", () => {
      link.status = "active";
      link.click_count = 1000;

      // Archive the link
      link.status = "archived";
      link.updated_at = new Date();

      expect(link.status).toBe("archived");
      expect(link.click_count).toBe(1000); // preserved
    });

    it("should handle namespace-scoped links", () => {
      const userLinks = [
        Object.assign(new Link(), {
          slug: "doc1",
          namespace: "user-123",
          url: "https://example.com/doc1",
        }),
        Object.assign(new Link(), {
          slug: "doc1", // Same slug, different namespace
          namespace: "user-456",
          url: "https://example.com/other-doc",
        }),
        Object.assign(new Link(), {
          slug: "doc2",
          namespace: "user-123",
          url: "https://example.com/doc2",
        }),
      ];

      expect(userLinks[0].slug).toBe(userLinks[1].slug);
      expect(userLinks[0].namespace).not.toBe(userLinks[1].namespace);
      expect(userLinks[0].url).not.toBe(userLinks[1].url);

      expect(userLinks[0].namespace).toBe(userLinks[2].namespace);
      expect(userLinks[0].slug).not.toBe(userLinks[2].slug);
    });
  });
});
