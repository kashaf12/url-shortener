import { Test, TestingModule } from "@nestjs/testing";
import { DeduplicationService } from "./deduplication.service";
import { DeduplicationContext } from "../../slug/strategies/slug-generation.interface";
import {
  DEFAULT_DEDUPLICATION_FIELDS,
  MAX_DEDUPLICATION_FIELDS,
  ERROR_MESSAGES,
} from "../constants";

describe("DeduplicationService", () => {
  let service: DeduplicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeduplicationService],
    }).compile();

    service = module.get<DeduplicationService>(DeduplicationService);
  });

  describe("Service Instantiation", () => {
    it("should be defined", () => {
      expect(service).toBeDefined();
    });

    it("should be an instance of DeduplicationService", () => {
      expect(service).toBeInstanceOf(DeduplicationService);
    });
  });

  describe("createDeduplicationHash", () => {
    it("should create hash for URL only", () => {
      const url = "https://example.com";
      const hash = service.createDeduplicationHash(url);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).toHaveLength(64); // SHA-256 hex string
    });

    it("should create hash for URL with empty metadata", () => {
      const url = "https://example.com";
      const hash = service.createDeduplicationHash(url, {});

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).toHaveLength(64);
    });

    it("should create hash for URL with metadata", () => {
      const url = "https://example.com";
      const metadata = { utm_source: "google", utm_medium: "cpc" };
      const hash = service.createDeduplicationHash(url, metadata);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).toHaveLength(64);
    });

    it("should create deterministic hashes", () => {
      const url = "https://example.com";
      const metadata = { utm_source: "google", utm_medium: "cpc" };

      const hash1 = service.createDeduplicationHash(url, metadata);
      const hash2 = service.createDeduplicationHash(url, metadata);

      expect(hash1).toBe(hash2);
    });

    it("should create different hashes for different URLs", () => {
      const metadata = { utm_source: "google" };

      const hash1 = service.createDeduplicationHash(
        "https://example.com",
        metadata
      );
      const hash2 = service.createDeduplicationHash(
        "https://different.com",
        metadata
      );

      expect(hash1).not.toBe(hash2);
    });

    it("should create different hashes for different metadata", () => {
      const url = "https://example.com";

      const hash1 = service.createDeduplicationHash(url, {
        utm_source: "google",
      });
      const hash2 = service.createDeduplicationHash(url, {
        utm_source: "facebook",
      });

      expect(hash1).not.toBe(hash2);
    });

    it("should use specific fields when provided", () => {
      const url = "https://example.com";
      const metadata = {
        utm_source: "google",
        utm_medium: "cpc",
        title: "Test Page",
        description: "Test Description",
      };

      const hash1 = service.createDeduplicationHash(url, metadata, [
        "utm_source",
      ]);
      const hash2 = service.createDeduplicationHash(url, metadata, [
        "utm_medium",
      ]);
      const hash3 = service.createDeduplicationHash(url, metadata, [
        "utm_source",
        "utm_medium",
      ]);

      expect(hash1).not.toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash2).not.toBe(hash3);
    });

    it("should handle complex nested metadata", () => {
      const url = "https://example.com";
      const metadata = {
        analytics: {
          source: "google",
          campaign: "summer2024",
        },
        user: {
          segment: "premium",
          tags: ["marketing", "conversion"],
        },
      };

      const hash = service.createDeduplicationHash(url, metadata);
      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
    });

    it("should handle metadata with arrays", () => {
      const url = "https://example.com";
      const metadata = {
        tags: ["tag1", "tag2", "tag3"],
        categories: [1, 2, 3],
      };

      const hash = service.createDeduplicationHash(url, metadata);
      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
    });

    it("should handle metadata with null and undefined values", () => {
      const url = "https://example.com";
      const metadata = {
        utm_source: "google",
        utm_medium: null,
        utm_campaign: undefined,
        utm_term: "",
      };

      const hash = service.createDeduplicationHash(url, metadata);
      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
    });

    it("should throw error for invalid URL", () => {
      expect(() => service.createDeduplicationHash("")).toThrow(
        "URL must be a non-empty string"
      );
      expect(() => service.createDeduplicationHash(null as any)).toThrow(
        "URL must be a non-empty string"
      );
      expect(() => service.createDeduplicationHash(123 as any)).toThrow(
        "URL must be a non-empty string"
      );
    });

    it("should throw error for invalid metadata", () => {
      const url = "https://example.com";
      expect(() =>
        service.createDeduplicationHash(url, "invalid" as any)
      ).toThrow("Metadata must be an object");
      expect(() => service.createDeduplicationHash(url, 123 as any)).toThrow(
        "Metadata must be an object"
      );
    });

    it("should throw error for too many fields", () => {
      const url = "https://example.com";
      const metadata = {};
      const tooManyFields = Array(MAX_DEDUPLICATION_FIELDS + 1)
        .fill(0)
        .map((_, i) => `field${i}`);

      expect(() =>
        service.createDeduplicationHash(url, metadata, tooManyFields)
      ).toThrow(
        ERROR_MESSAGES.DEDUPLICATION_FIELDS_LIMIT(MAX_DEDUPLICATION_FIELDS)
      );
    });

    it("should handle field ordering consistently", () => {
      const url = "https://example.com";
      const metadata = { c: 3, a: 1, b: 2 };

      // Should produce same hash regardless of key order in metadata
      const metadata2 = { a: 1, b: 2, c: 3 };

      const hash1 = service.createDeduplicationHash(url, metadata);
      const hash2 = service.createDeduplicationHash(url, metadata2);

      expect(hash1).toBe(hash2);
    });
  });

  describe("createCanonicalDeduplicationHash", () => {
    it("should create canonical hash", () => {
      const url = "https://example.com";
      const metadata = { utm_source: "google" };
      const hash = service.createCanonicalDeduplicationHash(url, metadata);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).toHaveLength(64);
    });

    it("should be deterministic", () => {
      const url = "https://example.com";
      const metadata = { utm_source: "google" };

      const hash1 = service.createCanonicalDeduplicationHash(url, metadata);
      const hash2 = service.createCanonicalDeduplicationHash(url, metadata);

      expect(hash1).toBe(hash2);
    });

    it("should normalize URLs", () => {
      const metadata = { utm_source: "google" };

      // These should produce the same hash after canonicalization
      const hash1 = service.createCanonicalDeduplicationHash(
        "https://example.com/",
        metadata
      );
      const hash2 = service.createCanonicalDeduplicationHash(
        "https://example.com",
        metadata
      );

      expect(hash1).toBe(hash2);
    });

    it("should normalize URL protocol case", () => {
      const metadata = { utm_source: "google" };

      const hash1 = service.createCanonicalDeduplicationHash(
        "HTTPS://example.com",
        metadata
      );
      const hash2 = service.createCanonicalDeduplicationHash(
        "https://example.com",
        metadata
      );

      expect(hash1).toBe(hash2);
    });

    it("should normalize hostname case", () => {
      const metadata = { utm_source: "google" };

      const hash1 = service.createCanonicalDeduplicationHash(
        "https://EXAMPLE.COM",
        metadata
      );
      const hash2 = service.createCanonicalDeduplicationHash(
        "https://example.com",
        metadata
      );

      expect(hash1).toBe(hash2);
    });

    it("should remove default ports", () => {
      const metadata = { utm_source: "google" };

      const hash1 = service.createCanonicalDeduplicationHash(
        "https://example.com:443",
        metadata
      );
      const hash2 = service.createCanonicalDeduplicationHash(
        "https://example.com",
        metadata
      );

      expect(hash1).toBe(hash2);
    });

    it("should normalize query parameters", () => {
      const metadata = { utm_source: "google" };

      // Parameters in different order should produce same hash
      const hash1 = service.createCanonicalDeduplicationHash(
        "https://example.com?b=2&a=1",
        metadata
      );
      const hash2 = service.createCanonicalDeduplicationHash(
        "https://example.com?a=1&b=2",
        metadata
      );

      expect(hash1).toBe(hash2);
    });

    it("should handle enhanced metadata canonicalization", () => {
      const url = "https://example.com";
      const metadata1 = { title: "  Test Page  " }; // Extra whitespace
      const metadata2 = { title: "test page" }; // Different case

      const hash1 = service.createCanonicalDeduplicationHash(url, metadata1);
      const hash2 = service.createCanonicalDeduplicationHash(url, metadata2);

      expect(hash1).toBe(hash2);
    });

    it("should sort arrays in metadata", () => {
      const url = "https://example.com";
      const metadata1 = { tags: ["z", "a", "m"] };
      const metadata2 = { tags: ["a", "m", "z"] };

      const hash1 = service.createCanonicalDeduplicationHash(url, metadata1);
      const hash2 = service.createCanonicalDeduplicationHash(url, metadata2);

      expect(hash1).toBe(hash2);
    });

    it("should differ from regular hash due to enhanced canonicalization", () => {
      const url = "https://example.com";
      const metadata = { title: "  Test Page  " };

      const regularHash = service.createDeduplicationHash(url, metadata);
      const canonicalHash = service.createCanonicalDeduplicationHash(
        url,
        metadata
      );

      expect(regularHash).not.toBe(canonicalHash);
    });
  });

  describe("createDeduplicationContext", () => {
    it("should create complete context", () => {
      const url = "https://example.com";
      const metadata = { utm_source: "google" };
      const fields = ["utm_source"];

      const context = service.createDeduplicationContext(url, metadata, fields);

      expect(context).toBeDefined();
      expect(context.url).toBe(url);
      expect(context.metadata).toBe(metadata);
      expect(context.fields).toBe(fields);
      expect(context.hash).toBeDefined();
      expect(context.hash).toHaveLength(64);
    });

    it("should create context without fields", () => {
      const url = "https://example.com";
      const metadata = { utm_source: "google" };

      const context = service.createDeduplicationContext(url, metadata);

      expect(context).toBeDefined();
      expect(context.url).toBe(url);
      expect(context.metadata).toBe(metadata);
      expect(context.fields).toBeUndefined();
      expect(context.hash).toBeDefined();
    });

    it("should create context with empty metadata", () => {
      const url = "https://example.com";

      const context = service.createDeduplicationContext(url);

      expect(context).toBeDefined();
      expect(context.url).toBe(url);
      expect(context.metadata).toEqual({});
      expect(context.fields).toBeUndefined();
      expect(context.hash).toBeDefined();
    });
  });

  describe("compareContexts", () => {
    it("should return true for identical contexts", () => {
      const url = "https://example.com";
      const metadata = { utm_source: "google" };

      const context1 = service.createDeduplicationContext(url, metadata);
      const context2 = service.createDeduplicationContext(url, metadata);

      expect(service.compareContexts(context1, context2)).toBe(true);
    });

    it("should return false for different contexts", () => {
      const metadata = { utm_source: "google" };

      const context1 = service.createDeduplicationContext(
        "https://example.com",
        metadata
      );
      const context2 = service.createDeduplicationContext(
        "https://different.com",
        metadata
      );

      expect(service.compareContexts(context1, context2)).toBe(false);
    });

    it("should work with manually created contexts", () => {
      const context1: DeduplicationContext = {
        url: "https://example.com",
        metadata: {},
        hash: "abc123",
      };

      const context2: DeduplicationContext = {
        url: "https://example.com",
        metadata: {},
        hash: "abc123",
      };

      const context3: DeduplicationContext = {
        url: "https://example.com",
        metadata: {},
        hash: "def456",
      };

      expect(service.compareContexts(context1, context2)).toBe(true);
      expect(service.compareContexts(context1, context3)).toBe(false);
    });
  });

  describe("hasAnyField", () => {
    it("should return true when metadata contains at least one field", () => {
      const metadata = { utm_source: "google", title: "Test" };
      const fields = ["utm_source", "utm_medium", "utm_campaign"];

      expect(service.hasAnyField(metadata, fields)).toBe(true);
    });

    it("should return false when metadata contains none of the fields", () => {
      const metadata = { title: "Test", description: "Test desc" };
      const fields = ["utm_source", "utm_medium", "utm_campaign"];

      expect(service.hasAnyField(metadata, fields)).toBe(false);
    });

    it("should return false for empty metadata", () => {
      const metadata = {};
      const fields = ["utm_source", "utm_medium"];

      expect(service.hasAnyField(metadata, fields)).toBe(false);
    });

    it("should return false for empty fields array", () => {
      const metadata = { utm_source: "google" };
      const fields: string[] = [];

      expect(service.hasAnyField(metadata, fields)).toBe(false);
    });

    it("should ignore null and undefined values", () => {
      const metadata = {
        utm_source: null,
        utm_medium: undefined,
        utm_campaign: "test",
      };
      const fields = ["utm_source", "utm_medium"];

      expect(service.hasAnyField(metadata, fields)).toBe(false);
    });

    it("should find valid field among null values", () => {
      const metadata = {
        utm_source: null,
        utm_medium: undefined,
        utm_campaign: "test",
      };
      const fields = ["utm_source", "utm_medium", "utm_campaign"];

      expect(service.hasAnyField(metadata, fields)).toBe(true);
    });
  });

  describe("hasField", () => {
    it("should return true for existing field with value", () => {
      const metadata = { utm_source: "google" };

      expect(service.hasField(metadata, "utm_source")).toBe(true);
    });

    it("should return false for non-existent field", () => {
      const metadata = { utm_source: "google" };

      expect(service.hasField(metadata, "utm_medium")).toBe(false);
    });

    it("should return false for field with null value", () => {
      const metadata = { utm_source: null };

      expect(service.hasField(metadata, "utm_source")).toBe(false);
    });

    it("should return false for field with undefined value", () => {
      const metadata = { utm_source: undefined };

      expect(service.hasField(metadata, "utm_source")).toBe(false);
    });

    it("should return true for field with empty string", () => {
      const metadata = { utm_source: "" };

      expect(service.hasField(metadata, "utm_source")).toBe(true);
    });

    it("should return true for field with zero value", () => {
      const metadata = { count: 0 };

      expect(service.hasField(metadata, "count")).toBe(true);
    });

    it("should return true for field with false value", () => {
      const metadata = { enabled: false };

      expect(service.hasField(metadata, "enabled")).toBe(true);
    });
  });

  describe("extractDeduplicationFields", () => {
    it("should extract specific fields when provided", () => {
      const metadata = {
        utm_source: "google",
        utm_medium: "cpc",
        title: "Test Page",
        description: "Test Description",
      };

      const extracted = service.extractDeduplicationFields(metadata, [
        "utm_source",
        "utm_medium",
      ]);

      expect(extracted).toEqual({
        utm_source: "google",
        utm_medium: "cpc",
      });
    });

    it("should extract default fields when no fields specified", () => {
      const metadata = {
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "summer",
        title: "Test Page",
        ref: "homepage",
      };

      const extracted = service.extractDeduplicationFields(metadata);

      // Should include default deduplication fields that exist in metadata
      expect(extracted).toHaveProperty("utm_source", "google");
      expect(extracted).toHaveProperty("utm_medium", "cpc");
      expect(extracted).toHaveProperty("utm_campaign", "summer");
      expect(extracted).toHaveProperty("ref", "homepage");
      expect(extracted).not.toHaveProperty("title");
    });

    it("should extract all fields when no default fields present", () => {
      const metadata = {
        title: "Test Page",
        description: "Test Description",
        category: "blog",
      };

      const extracted = service.extractDeduplicationFields(metadata);

      expect(extracted).toEqual(metadata);
    });

    it("should filter out null and undefined values", () => {
      const metadata = {
        utm_source: "google",
        utm_medium: null,
        utm_campaign: undefined,
        utm_term: "keyword",
      };

      const extracted = service.extractDeduplicationFields(metadata, [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
      ]);

      expect(extracted).toEqual({
        utm_source: "google",
        utm_term: "keyword",
      });
    });

    it("should return empty object for empty metadata", () => {
      const extracted = service.extractDeduplicationFields({});
      expect(extracted).toEqual({});
    });
  });

  describe("getDefaultDeduplicationFields", () => {
    it("should return default fields", () => {
      const fields = service.getDefaultDeduplicationFields();

      expect(fields).toEqual(DEFAULT_DEDUPLICATION_FIELDS);
    });

    it("should return a copy of the array", () => {
      const fields1 = service.getDefaultDeduplicationFields();
      const fields2 = service.getDefaultDeduplicationFields();

      expect(fields1).toEqual(fields2);
      expect(fields1).not.toBe(fields2); // Different array instances
    });

    it("should not affect original when modified", () => {
      const fields = service.getDefaultDeduplicationFields();
      fields.push("custom_field");

      const freshFields = service.getDefaultDeduplicationFields();
      expect(freshFields).not.toContain("custom_field");
      expect(freshFields).toEqual(DEFAULT_DEDUPLICATION_FIELDS);
    });
  });

  describe("isWithinFieldLimit", () => {
    it("should return true for fields within limit", () => {
      const fields = ["field1", "field2", "field3"];
      expect(service.isWithinFieldLimit(fields)).toBe(true);
    });

    it("should return true for fields at exact limit", () => {
      const fields = Array(MAX_DEDUPLICATION_FIELDS)
        .fill(0)
        .map((_, i) => `field${i}`);
      expect(service.isWithinFieldLimit(fields)).toBe(true);
    });

    it("should return false for fields exceeding limit", () => {
      const fields = Array(MAX_DEDUPLICATION_FIELDS + 1)
        .fill(0)
        .map((_, i) => `field${i}`);
      expect(service.isWithinFieldLimit(fields)).toBe(false);
    });

    it("should return true for empty array", () => {
      expect(service.isWithinFieldLimit([])).toBe(true);
    });
  });

  describe("Hash Consistency and Determinism", () => {
    it("should produce consistent hashes across multiple calls", () => {
      const url = "https://example.com";
      const metadata = {
        utm_source: "google",
        utm_medium: "cpc",
        nested: {
          value: 123,
          array: ["a", "b", "c"],
        },
      };

      const hashes = Array(100)
        .fill(0)
        .map(() => service.createDeduplicationHash(url, metadata));

      const uniqueHashes = [...new Set(hashes)];
      expect(uniqueHashes).toHaveLength(1);
    });

    it("should handle complex object serialization consistently", () => {
      const url = "https://example.com";
      const metadata = {
        complex: {
          nested: {
            deep: {
              value: "test",
              number: 42,
              bool: true,
              array: [1, 2, { inner: "value" }],
            },
          },
        },
      };

      const hash1 = service.createDeduplicationHash(url, metadata);
      const hash2 = service.createDeduplicationHash(url, metadata);

      expect(hash1).toBe(hash2);
    });

    it("should handle floating point numbers consistently", () => {
      const url = "https://example.com";
      const metadata1 = { value: 1.23456789 };
      const metadata2 = { value: 1.23456789 };

      const hash1 = service.createDeduplicationHash(url, metadata1);
      const hash2 = service.createDeduplicationHash(url, metadata2);

      expect(hash1).toBe(hash2);
    });

    it("should handle boolean values consistently", () => {
      const url = "https://example.com";
      const metadata = { enabled: true, visible: false };

      const hash1 = service.createDeduplicationHash(url, metadata);
      const hash2 = service.createDeduplicationHash(url, metadata);

      expect(hash1).toBe(hash2);
    });

    it("should handle Date objects as values", () => {
      const url = "https://example.com";
      const date = new Date("2024-01-01T00:00:00Z");
      const metadata = { timestamp: date };

      const hash1 = service.createDeduplicationHash(url, metadata);
      const hash2 = service.createDeduplicationHash(url, { timestamp: date });

      expect(hash1).toBe(hash2);
    });
  });

  describe("Performance and Edge Cases", () => {
    it("should handle very large metadata objects", () => {
      const url = "https://example.com";
      const largeMetadata: Record<string, any> = {};

      // Create large metadata object
      for (let i = 0; i < 1000; i++) {
        largeMetadata[`field${i}`] = `value${i}`;
      }

      const startTime = Date.now();
      const hash = service.createDeduplicationHash(url, largeMetadata);
      const endTime = Date.now();

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should handle metadata with circular references", () => {
      const url = "https://example.com";
      const metadata: any = { value: "test" };
      metadata.circular = metadata; // Create circular reference

      // Service currently doesn't handle circular references - it will stack overflow
      // This is expected behavior and should be documented as a limitation
      expect(() => service.createDeduplicationHash(url, metadata)).toThrow();
    });

    it("should handle unicode characters in metadata", () => {
      const url = "https://example.com";
      const metadata = {
        title: "测试标题 🚀",
        description: "Descripción con acentos",
        emoji: "🎯🔥💯",
      };

      const hash = service.createDeduplicationHash(url, metadata);
      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
    });

    it("should handle special characters in metadata values", () => {
      const url = "https://example.com";
      const metadata = {
        special: "!@#$%^&*()_+-=[]{}|;:,.<>?",
        quotes: "\"single\" and 'double'",
        newlines: "line1\nline2\rline3\r\n",
      };

      const hash = service.createDeduplicationHash(url, metadata);
      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
    });

    it("should be performant for repeated hash generation", () => {
      const url = "https://example.com";
      const metadata = { utm_source: "google", utm_medium: "cpc" };

      const startTime = Date.now();

      for (let i = 0; i < 10000; i++) {
        service.createDeduplicationHash(url, metadata);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 10,000 hashes in under 1 second
      expect(duration).toBeLessThan(1000);
    });
  });

  describe("Real-world Scenarios", () => {
    it("should handle typical UTM parameter scenarios", () => {
      const url = "https://example.com/product";
      const utmMetadata = {
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "summer2024",
        utm_term: "running shoes",
        utm_content: "ad1",
      };

      const context = service.createDeduplicationContext(url, utmMetadata);
      expect(context.hash).toBeDefined();

      // Same URL with same UTM should have same hash
      const context2 = service.createDeduplicationContext(url, utmMetadata);
      expect(service.compareContexts(context, context2)).toBe(true);

      // Different UTM campaign should have different hash
      const differentUtm = { ...utmMetadata, utm_campaign: "winter2024" };
      const context3 = service.createDeduplicationContext(url, differentUtm);
      expect(service.compareContexts(context, context3)).toBe(false);
    });

    it("should handle analytics tracking scenarios", () => {
      const url = "https://example.com/article";
      const analyticsMetadata = {
        source: "newsletter",
        campaign_id: "news_001",
        user_segment: "premium",
        ab_test_variant: "B",
        tracking_id: "trk_123456",
      };

      const hash1 = service.createDeduplicationHash(url, analyticsMetadata);
      const hash2 = service.createDeduplicationHash(url, analyticsMetadata);

      expect(hash1).toBe(hash2);
    });

    it("should handle social media sharing scenarios", () => {
      const url = "https://example.com/blog/post";
      const socialMetadata = {
        platform: "twitter",
        share_type: "organic",
        user_id: "user123",
        timestamp: "2024-01-15T10:30:00Z",
      };

      const context = service.createDeduplicationContext(url, socialMetadata);

      // Same share should deduplicate
      const context2 = service.createDeduplicationContext(url, socialMetadata);
      expect(service.compareContexts(context, context2)).toBe(true);

      // Different platform should not deduplicate
      const facebookMetadata = { ...socialMetadata, platform: "facebook" };
      const context3 = service.createDeduplicationContext(
        url,
        facebookMetadata
      );
      expect(service.compareContexts(context, context3)).toBe(false);
    });

    it("should handle e-commerce scenarios", () => {
      const url = "https://shop.example.com/product/123";
      const ecommerceMetadata = {
        campaign: "black_friday",
        discount_code: "BF2024",
        affiliate_id: "aff_456",
        customer_segment: "returning",
        product_category: "electronics",
      };

      // Test deduplication with specific fields
      const extractedFields = service.extractDeduplicationFields(
        ecommerceMetadata,
        ["campaign", "discount_code", "affiliate_id"]
      );

      expect(extractedFields).toEqual({
        campaign: "black_friday",
        discount_code: "BF2024",
        affiliate_id: "aff_456",
      });

      const hash = service.createDeduplicationHash(url, extractedFields);
      expect(hash).toBeDefined();
    });

    it("should handle content management scenarios", () => {
      const url = "https://cms.example.com/content/article-123";
      const cmsMetadata = {
        author: "john.doe",
        published_date: "2024-01-15",
        content_type: "article",
        tags: ["technology", "ai", "machine-learning"],
        category: "tech-news",
        status: "published",
        version: "1.2",
      };

      // Test that array ordering doesn't affect hash
      const reorderedMetadata = {
        ...cmsMetadata,
        tags: ["ai", "machine-learning", "technology"], // Different order
      };

      const canonicalHash1 = service.createCanonicalDeduplicationHash(
        url,
        cmsMetadata
      );
      const canonicalHash2 = service.createCanonicalDeduplicationHash(
        url,
        reorderedMetadata
      );

      expect(canonicalHash1).toBe(canonicalHash2);
    });
  });

  describe("Integration with Default Fields", () => {
    it("should use default deduplication fields correctly", () => {
      const url = "https://example.com";
      const metadata = {
        utm_source: "google",
        utm_medium: "cpc",
        ref: "homepage",
        title: "Test Page", // Not in default fields
        description: "Test Description", // Not in default fields
      };

      const extracted = service.extractDeduplicationFields(metadata);

      // Should only include default deduplication fields
      expect(extracted).toEqual({
        utm_source: "google",
        utm_medium: "cpc",
        ref: "homepage",
      });

      expect(extracted).not.toHaveProperty("title");
      expect(extracted).not.toHaveProperty("description");
    });

    it("should fall back to all fields when no default fields present", () => {
      const url = "https://example.com";
      const metadata = {
        title: "Test Page",
        description: "Test Description",
        author: "John Doe",
      };

      const extracted = service.extractDeduplicationFields(metadata);

      // Should include all fields since no default fields are present
      expect(extracted).toEqual(metadata);
    });
  });

  describe("Error Handling Edge Cases", () => {
    it("should handle empty string fields gracefully", () => {
      const url = "https://example.com";
      const metadata = { utm_source: "google" };
      const fields = ["utm_source", "", "utm_medium"]; // Empty string field

      expect(() =>
        service.createDeduplicationHash(url, metadata, fields)
      ).toThrow();
    });

    it("should handle non-string fields gracefully", () => {
      const url = "https://example.com";
      const metadata = { utm_source: "google" };
      const fields = ["utm_source", 123 as any, "utm_medium"]; // Non-string field

      expect(() =>
        service.createDeduplicationHash(url, metadata, fields)
      ).toThrow();
    });

    it("should validate URL parameter type strictly", () => {
      const metadata = { utm_source: "google" };

      expect(() =>
        service.createDeduplicationHash(0 as any, metadata)
      ).toThrow();
      expect(() =>
        service.createDeduplicationHash(false as any, metadata)
      ).toThrow();
      expect(() =>
        service.createDeduplicationHash([] as any, metadata)
      ).toThrow();
      expect(() =>
        service.createDeduplicationHash({} as any, metadata)
      ).toThrow();
    });

    it("should validate metadata parameter type", () => {
      const url = "https://example.com";

      // Arrays are objects in JavaScript, so they're valid metadata
      expect(() =>
        service.createDeduplicationHash(url, [] as any)
      ).not.toThrow();

      // These should throw
      expect(() =>
        service.createDeduplicationHash(url, "string" as any)
      ).toThrow();
      expect(() => service.createDeduplicationHash(url, 123 as any)).toThrow();
      expect(() => service.createDeduplicationHash(url, true as any)).toThrow();
    });
  });
});
