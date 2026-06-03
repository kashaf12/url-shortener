import { SlugSpaceUsage } from "./slug-space-usage.entity";

describe("SlugSpaceUsage Entity", () => {
  let spaceUsage: SlugSpaceUsage;

  beforeEach(() => {
    spaceUsage = new SlugSpaceUsage();
  });

  describe("Entity Structure", () => {
    it("should create a new SlugSpaceUsage entity", () => {
      expect(spaceUsage).toBeInstanceOf(SlugSpaceUsage);
      expect(spaceUsage).toBeDefined();
    });

    it("should have all required properties", () => {
      expect(spaceUsage.hasOwnProperty("id")).toBe(true);
      expect(spaceUsage.hasOwnProperty("strategy")).toBe(true);
      expect(spaceUsage.hasOwnProperty("alphabet_hash")).toBe(true);
      expect(spaceUsage.hasOwnProperty("alphabet")).toBe(true);
      expect(spaceUsage.hasOwnProperty("length")).toBe(true);
      expect(spaceUsage.hasOwnProperty("namespace")).toBe(true);
      expect(spaceUsage.hasOwnProperty("usage_count")).toBe(true);
      expect(spaceUsage.hasOwnProperty("total_space")).toBe(true);
      expect(spaceUsage.hasOwnProperty("usage_percentage")).toBe(true);
      expect(spaceUsage.hasOwnProperty("warning_threshold")).toBe(true);
      expect(spaceUsage.hasOwnProperty("critical_threshold")).toBe(true);
      expect(spaceUsage.hasOwnProperty("is_warning")).toBe(true);
      expect(spaceUsage.hasOwnProperty("is_critical")).toBe(true);
      expect(spaceUsage.hasOwnProperty("is_exhausted")).toBe(true);
      expect(spaceUsage.hasOwnProperty("warning_reached_at")).toBe(true);
      expect(spaceUsage.hasOwnProperty("critical_reached_at")).toBe(true);
      expect(spaceUsage.hasOwnProperty("exhausted_at")).toBe(true);
      expect(spaceUsage.hasOwnProperty("last_calculated_at")).toBe(true);
      expect(spaceUsage.hasOwnProperty("created_at")).toBe(true);
      expect(spaceUsage.hasOwnProperty("updated_at")).toBe(true);
    });

    it("should have correct TypeScript types", () => {
      spaceUsage.id = "uuid-string";
      spaceUsage.strategy = "nanoid";
      spaceUsage.alphabet_hash = "hash123";
      spaceUsage.alphabet = "ABC123";
      spaceUsage.length = 7;
      spaceUsage.namespace = "test";
      spaceUsage.usage_count = 100;
      spaceUsage.total_space = 1000;
      spaceUsage.usage_percentage = 0.1;
      spaceUsage.warning_threshold = 0.75;
      spaceUsage.critical_threshold = 0.9;
      spaceUsage.is_warning = false;
      spaceUsage.is_critical = false;
      spaceUsage.is_exhausted = false;
      spaceUsage.warning_reached_at = new Date();
      spaceUsage.critical_reached_at = new Date();
      spaceUsage.exhausted_at = new Date();
      spaceUsage.last_calculated_at = new Date();
      spaceUsage.created_at = new Date();
      spaceUsage.updated_at = new Date();

      expect(typeof spaceUsage.id).toBe("string");
      expect(typeof spaceUsage.strategy).toBe("string");
      expect(typeof spaceUsage.alphabet_hash).toBe("string");
      expect(typeof spaceUsage.alphabet).toBe("string");
      expect(typeof spaceUsage.length).toBe("number");
      expect(typeof spaceUsage.namespace).toBe("string");
      expect(typeof spaceUsage.usage_count).toBe("number");
      expect(typeof spaceUsage.total_space).toBe("number");
      expect(typeof spaceUsage.usage_percentage).toBe("number");
      expect(typeof spaceUsage.warning_threshold).toBe("number");
      expect(typeof spaceUsage.critical_threshold).toBe("number");
      expect(typeof spaceUsage.is_warning).toBe("boolean");
      expect(typeof spaceUsage.is_critical).toBe("boolean");
      expect(typeof spaceUsage.is_exhausted).toBe("boolean");
      expect(spaceUsage.warning_reached_at).toBeInstanceOf(Date);
      expect(spaceUsage.critical_reached_at).toBeInstanceOf(Date);
      expect(spaceUsage.exhausted_at).toBeInstanceOf(Date);
      expect(spaceUsage.last_calculated_at).toBeInstanceOf(Date);
      expect(spaceUsage.created_at).toBeInstanceOf(Date);
      expect(spaceUsage.updated_at).toBeInstanceOf(Date);
    });

    it("should have all entity methods", () => {
      expect(typeof spaceUsage.isApproachingExhaustion).toBe("function");
      expect(typeof spaceUsage.isCriticallyFull).toBe("function");
      expect(typeof spaceUsage.getRemainingSpace).toBe("function");
      expect(typeof spaceUsage.getUtilizationPercentage).toBe("function");
      expect(typeof spaceUsage.getSpaceKey).toBe("function");
      expect(typeof spaceUsage.shouldPreventGeneration).toBe("function");
      expect(typeof spaceUsage.getRecommendedAction).toBe("function");
    });
  });

  describe("Property Validation", () => {
    describe("strategy", () => {
      it("should accept valid strategy names", () => {
        const validStrategies = [
          "nanoid",
          "uuid",
          "base58",
          "custom",
          "sequential",
          "short",
          "a",
          "verylongstrategyname",
        ];

        validStrategies.forEach(strategy => {
          expect(() => {
            spaceUsage.strategy = strategy;
          }).not.toThrow();
          expect(spaceUsage.strategy).toBe(strategy);
        });
      });

      it("should handle maximum strategy length (20 chars)", () => {
        const maxStrategy = "a".repeat(20);

        expect(() => {
          spaceUsage.strategy = maxStrategy;
        }).not.toThrow();
        expect(spaceUsage.strategy).toBe(maxStrategy);
      });
    });

    describe("alphabet_hash", () => {
      it("should accept valid hash strings", () => {
        const validHashes = [
          "a1b2c3d4",
          "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890", // 64 chars
          "sha256hash",
          "md5hash",
          "short",
        ];

        validHashes.forEach(hash => {
          expect(() => {
            spaceUsage.alphabet_hash = hash;
          }).not.toThrow();
          expect(spaceUsage.alphabet_hash).toBe(hash);
        });
      });

      it("should handle maximum hash length (64 chars)", () => {
        const maxHash = "a".repeat(64);

        expect(() => {
          spaceUsage.alphabet_hash = maxHash;
        }).not.toThrow();
        expect(spaceUsage.alphabet_hash).toBe(maxHash);
      });
    });

    describe("alphabet", () => {
      it("should accept various alphabet types", () => {
        const validAlphabets = [
          "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
          "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_",
          "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz",
          "ABC123",
          "01",
          "A",
          "",
        ];

        validAlphabets.forEach(alphabet => {
          expect(() => {
            spaceUsage.alphabet = alphabet;
          }).not.toThrow();
          expect(spaceUsage.alphabet).toBe(alphabet);
        });
      });

      it("should handle very long alphabets", () => {
        const longAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(100);

        expect(() => {
          spaceUsage.alphabet = longAlphabet;
        }).not.toThrow();
        expect(spaceUsage.alphabet).toBe(longAlphabet);
      });

      it("should handle special characters in alphabet", () => {
        const specialAlphabets = [
          "!@#$%^&*()_+-=[]{}|;':\",./<>?",
          "αβγδεζηθικλμνξοπρστυφχψω",
          "🚀🌟💻📱⚡🔥",
          "Áéíóú àèìòù äëïöü",
        ];

        specialAlphabets.forEach(alphabet => {
          expect(() => {
            spaceUsage.alphabet = alphabet;
          }).not.toThrow();
          expect(spaceUsage.alphabet).toBe(alphabet);
        });
      });
    });

    describe("length", () => {
      it("should accept valid length values", () => {
        const validLengths = [1, 2, 4, 7, 10, 12, 15, 20, 21, 50, 100];

        validLengths.forEach(length => {
          expect(() => {
            spaceUsage.length = length;
          }).not.toThrow();
          expect(spaceUsage.length).toBe(length);
        });
      });

      it("should handle boundary values", () => {
        expect(() => {
          spaceUsage.length = 0;
        }).not.toThrow();
        expect(spaceUsage.length).toBe(0);

        expect(() => {
          spaceUsage.length = -1;
        }).not.toThrow();
        expect(spaceUsage.length).toBe(-1);

        expect(() => {
          spaceUsage.length = Number.MAX_SAFE_INTEGER;
        }).not.toThrow();
        expect(spaceUsage.length).toBe(Number.MAX_SAFE_INTEGER);
      });
    });

    describe("namespace", () => {
      it("should accept null namespace", () => {
        expect(() => {
          spaceUsage.namespace = null;
        }).not.toThrow();
        expect(spaceUsage.namespace).toBeNull();
      });

      it("should accept valid namespace values", () => {
        const validNamespaces = [
          "user-123",
          "org_456",
          "team.789",
          "project:abc",
          "a",
          "namespace-with-many-hyphens-and-characters",
        ];

        validNamespaces.forEach(namespace => {
          expect(() => {
            spaceUsage.namespace = namespace;
          }).not.toThrow();
          expect(spaceUsage.namespace).toBe(namespace);
        });
      });

      it("should handle maximum namespace length (50 chars)", () => {
        const maxNamespace = "a".repeat(50);

        expect(() => {
          spaceUsage.namespace = maxNamespace;
        }).not.toThrow();
        expect(spaceUsage.namespace).toBe(maxNamespace);
      });
    });

    describe("numeric fields", () => {
      it("should accept valid usage_count values", () => {
        const validCounts = [0, 1, 100, 1000, 1000000, Number.MAX_SAFE_INTEGER];

        validCounts.forEach(count => {
          expect(() => {
            spaceUsage.usage_count = count;
          }).not.toThrow();
          expect(spaceUsage.usage_count).toBe(count);
        });
      });

      it("should accept valid total_space values", () => {
        const validSpaces = [0, 1, 64, 4096, 16777216, Number.MAX_SAFE_INTEGER];

        validSpaces.forEach(space => {
          expect(() => {
            spaceUsage.total_space = space;
          }).not.toThrow();
          expect(spaceUsage.total_space).toBe(space);
        });
      });

      it("should accept valid percentage values", () => {
        const validPercentages = [0, 0.1, 0.5, 0.75, 0.9, 0.99, 1.0];

        validPercentages.forEach(percentage => {
          expect(() => {
            spaceUsage.usage_percentage = percentage;
          }).not.toThrow();
          expect(spaceUsage.usage_percentage).toBe(percentage);
        });
      });

      it("should accept valid threshold values", () => {
        const validThresholds = [0.1, 0.5, 0.75, 0.8, 0.9, 0.95, 0.99];

        validThresholds.forEach(threshold => {
          expect(() => {
            spaceUsage.warning_threshold = threshold;
            spaceUsage.critical_threshold = threshold;
          }).not.toThrow();
          expect(spaceUsage.warning_threshold).toBe(threshold);
          expect(spaceUsage.critical_threshold).toBe(threshold);
        });
      });

      it("should handle edge numeric values", () => {
        expect(() => {
          spaceUsage.usage_count = -1;
          spaceUsage.total_space = -1;
          spaceUsage.usage_percentage = -0.5;
          spaceUsage.warning_threshold = 1.5;
          spaceUsage.critical_threshold = 2.0;
        }).not.toThrow();
      });
    });

    describe("boolean fields", () => {
      it("should accept boolean values", () => {
        const booleanFields = [
          "is_warning",
          "is_critical",
          "is_exhausted",
        ] as const;
        const booleanValues = [true, false];

        booleanFields.forEach(field => {
          booleanValues.forEach(value => {
            expect(() => {
              spaceUsage[field] = value;
            }).not.toThrow();
            expect(spaceUsage[field]).toBe(value);
          });
        });
      });

      it("should handle truthy/falsy values", () => {
        expect(() => {
          spaceUsage.is_warning = 1 as any;
          spaceUsage.is_critical = 0 as any;
          spaceUsage.is_exhausted = "true" as any;
        }).not.toThrow();

        expect(spaceUsage.is_warning).toBe(1);
        expect(spaceUsage.is_critical).toBe(0);
        expect(spaceUsage.is_exhausted).toBe("true");
      });
    });

    describe("timestamp fields", () => {
      it("should accept null for optional timestamp fields", () => {
        const nullableFields = [
          "warning_reached_at",
          "critical_reached_at",
          "exhausted_at",
          "last_calculated_at",
        ] as const;

        nullableFields.forEach(field => {
          expect(() => {
            spaceUsage[field] = null;
          }).not.toThrow();
          expect(spaceUsage[field]).toBeNull();
        });
      });

      it("should accept valid Date objects", () => {
        const now = new Date();
        const past = new Date("2020-01-01");
        const future = new Date("2030-12-31");

        const timestampFields = [
          "warning_reached_at",
          "critical_reached_at",
          "exhausted_at",
          "last_calculated_at",
          "created_at",
          "updated_at",
        ] as const;

        timestampFields.forEach(field => {
          [now, past, future].forEach(date => {
            expect(() => {
              spaceUsage[field] = date;
            }).not.toThrow();
            expect(spaceUsage[field]).toBe(date);
          });
        });
      });

      it("should handle edge date values", () => {
        const edgeDates = [
          new Date(0), // Unix epoch
          new Date(-8640000000000000), // Min date
          new Date(8640000000000000), // Max date
        ];

        edgeDates.forEach(date => {
          expect(() => {
            spaceUsage.created_at = date;
            spaceUsage.warning_reached_at = date;
          }).not.toThrow();
        });
      });
    });
  });

  describe("Entity Methods", () => {
    beforeEach(() => {
      // Set up a baseline entity
      spaceUsage.usage_percentage = 0.5;
      spaceUsage.warning_threshold = 0.75;
      spaceUsage.critical_threshold = 0.9;
      spaceUsage.usage_count = 100;
      spaceUsage.total_space = 1000;
      spaceUsage.is_warning = false;
      spaceUsage.is_critical = false;
      spaceUsage.is_exhausted = false;
    });

    describe("isApproachingExhaustion", () => {
      it("should return false when below warning threshold", () => {
        spaceUsage.usage_percentage = 0.5; // 50% < 75%
        expect(spaceUsage.isApproachingExhaustion()).toBe(false);
      });

      it("should return true when at warning threshold", () => {
        spaceUsage.usage_percentage = 0.75; // 75% = 75%
        expect(spaceUsage.isApproachingExhaustion()).toBe(true);
      });

      it("should return true when above warning threshold", () => {
        spaceUsage.usage_percentage = 0.8; // 80% > 75%
        expect(spaceUsage.isApproachingExhaustion()).toBe(true);
      });

      it("should handle edge cases", () => {
        spaceUsage.usage_percentage = 0.74999;
        spaceUsage.warning_threshold = 0.75;
        expect(spaceUsage.isApproachingExhaustion()).toBe(false);

        spaceUsage.usage_percentage = 0.75001;
        expect(spaceUsage.isApproachingExhaustion()).toBe(true);
      });

      it("should handle custom warning thresholds", () => {
        spaceUsage.warning_threshold = 0.6; // 60%

        spaceUsage.usage_percentage = 0.5; // Below
        expect(spaceUsage.isApproachingExhaustion()).toBe(false);

        spaceUsage.usage_percentage = 0.7; // Above
        expect(spaceUsage.isApproachingExhaustion()).toBe(true);
      });
    });

    describe("isCriticallyFull", () => {
      it("should return false when below critical threshold", () => {
        spaceUsage.usage_percentage = 0.8; // 80% < 90%
        expect(spaceUsage.isCriticallyFull()).toBe(false);
      });

      it("should return true when at critical threshold", () => {
        spaceUsage.usage_percentage = 0.9; // 90% = 90%
        expect(spaceUsage.isCriticallyFull()).toBe(true);
      });

      it("should return true when above critical threshold", () => {
        spaceUsage.usage_percentage = 0.95; // 95% > 90%
        expect(spaceUsage.isCriticallyFull()).toBe(true);
      });

      it("should handle edge cases", () => {
        spaceUsage.usage_percentage = 0.89999;
        spaceUsage.critical_threshold = 0.9;
        expect(spaceUsage.isCriticallyFull()).toBe(false);

        spaceUsage.usage_percentage = 0.90001;
        expect(spaceUsage.isCriticallyFull()).toBe(true);
      });

      it("should handle custom critical thresholds", () => {
        spaceUsage.critical_threshold = 0.8; // 80%

        spaceUsage.usage_percentage = 0.75; // Below
        expect(spaceUsage.isCriticallyFull()).toBe(false);

        spaceUsage.usage_percentage = 0.85; // Above
        expect(spaceUsage.isCriticallyFull()).toBe(true);
      });
    });

    describe("getRemainingSpace", () => {
      it("should calculate remaining space correctly", () => {
        spaceUsage.total_space = 1000;
        spaceUsage.usage_count = 300;

        expect(spaceUsage.getRemainingSpace()).toBe(700);
      });

      it("should handle zero usage", () => {
        spaceUsage.total_space = 1000;
        spaceUsage.usage_count = 0;

        expect(spaceUsage.getRemainingSpace()).toBe(1000);
      });

      it("should handle full usage", () => {
        spaceUsage.total_space = 1000;
        spaceUsage.usage_count = 1000;

        expect(spaceUsage.getRemainingSpace()).toBe(0);
      });

      it("should handle overuse scenario", () => {
        spaceUsage.total_space = 1000;
        spaceUsage.usage_count = 1200; // Over capacity

        expect(spaceUsage.getRemainingSpace()).toBe(-200);
      });

      it("should handle large numbers", () => {
        spaceUsage.total_space = Number.MAX_SAFE_INTEGER;
        spaceUsage.usage_count = 1000000;

        expect(spaceUsage.getRemainingSpace()).toBe(
          Number.MAX_SAFE_INTEGER - 1000000
        );
      });
    });

    describe("getUtilizationPercentage", () => {
      it("should convert decimal to percentage", () => {
        spaceUsage.usage_percentage = 0.5;
        expect(spaceUsage.getUtilizationPercentage()).toBe(50);

        spaceUsage.usage_percentage = 0.75;
        expect(spaceUsage.getUtilizationPercentage()).toBe(75);

        spaceUsage.usage_percentage = 0.9999;
        expect(spaceUsage.getUtilizationPercentage()).toBe(99.99);
      });

      it("should handle zero percentage", () => {
        spaceUsage.usage_percentage = 0;
        expect(spaceUsage.getUtilizationPercentage()).toBe(0);
      });

      it("should handle 100% usage", () => {
        spaceUsage.usage_percentage = 1.0;
        expect(spaceUsage.getUtilizationPercentage()).toBe(100);
      });

      it("should handle over 100% usage", () => {
        spaceUsage.usage_percentage = 1.2;
        expect(spaceUsage.getUtilizationPercentage()).toBe(120);
      });

      it("should handle decimal precision", () => {
        spaceUsage.usage_percentage = 0.123456;
        expect(spaceUsage.getUtilizationPercentage()).toBeCloseTo(12.3456);
      });
    });

    describe("getSpaceKey", () => {
      it("should generate key without namespace", () => {
        spaceUsage.strategy = "nanoid";
        spaceUsage.alphabet_hash = "abc123";
        spaceUsage.length = 7;
        spaceUsage.namespace = null;

        expect(spaceUsage.getSpaceKey()).toBe("nanoid:abc123:7");
      });

      it("should generate key with namespace", () => {
        spaceUsage.strategy = "uuid";
        spaceUsage.alphabet_hash = "def456";
        spaceUsage.length = 10;
        spaceUsage.namespace = "user-123";

        expect(spaceUsage.getSpaceKey()).toBe("uuid:def456:10:user-123");
      });

      it("should handle empty namespace", () => {
        spaceUsage.strategy = "nanoid";
        spaceUsage.alphabet_hash = "xyz789";
        spaceUsage.length = 5;
        spaceUsage.namespace = "";

        expect(spaceUsage.getSpaceKey()).toBe("nanoid:xyz789:5");
      });

      it("should handle special characters in components", () => {
        spaceUsage.strategy = "custom-strategy";
        spaceUsage.alphabet_hash = "hash:with:colons";
        spaceUsage.length = 15;
        spaceUsage.namespace = "namespace:with:colons";

        expect(spaceUsage.getSpaceKey()).toBe(
          "custom-strategy:hash:with:colons:15:namespace:with:colons"
        );
      });

      it("should maintain consistency", () => {
        spaceUsage.strategy = "test";
        spaceUsage.alphabet_hash = "test123";
        spaceUsage.length = 8;
        spaceUsage.namespace = "test-ns";

        const key1 = spaceUsage.getSpaceKey();
        const key2 = spaceUsage.getSpaceKey();

        expect(key1).toBe(key2);
      });
    });

    describe("shouldPreventGeneration", () => {
      it("should prevent when exhausted", () => {
        spaceUsage.is_exhausted = true;
        spaceUsage.usage_percentage = 0.5;
        spaceUsage.critical_threshold = 0.9;

        expect(spaceUsage.shouldPreventGeneration()).toBe(true);
      });

      it("should prevent when at critical threshold", () => {
        spaceUsage.is_exhausted = false;
        spaceUsage.usage_percentage = 0.9;
        spaceUsage.critical_threshold = 0.9;

        expect(spaceUsage.shouldPreventGeneration()).toBe(true);
      });

      it("should prevent when above critical threshold", () => {
        spaceUsage.is_exhausted = false;
        spaceUsage.usage_percentage = 0.95;
        spaceUsage.critical_threshold = 0.9;

        expect(spaceUsage.shouldPreventGeneration()).toBe(true);
      });

      it("should allow when below critical threshold", () => {
        spaceUsage.is_exhausted = false;
        spaceUsage.usage_percentage = 0.85;
        spaceUsage.critical_threshold = 0.9;

        expect(spaceUsage.shouldPreventGeneration()).toBe(false);
      });

      it("should prioritize exhausted flag", () => {
        spaceUsage.is_exhausted = true;
        spaceUsage.usage_percentage = 0.1; // Very low usage
        spaceUsage.critical_threshold = 0.9;

        expect(spaceUsage.shouldPreventGeneration()).toBe(true);
      });
    });

    describe("getRecommendedAction", () => {
      it("should recommend 'exhausted' when exhausted", () => {
        spaceUsage.is_exhausted = true;
        spaceUsage.usage_percentage = 0.5;

        expect(spaceUsage.getRecommendedAction()).toBe("exhausted");
      });

      it("should recommend 'critical' when critically full", () => {
        spaceUsage.is_exhausted = false;
        spaceUsage.usage_percentage = 0.95;
        spaceUsage.critical_threshold = 0.9;

        expect(spaceUsage.getRecommendedAction()).toBe("critical");
      });

      it("should recommend 'warning' when approaching exhaustion", () => {
        spaceUsage.is_exhausted = false;
        spaceUsage.usage_percentage = 0.8;
        spaceUsage.warning_threshold = 0.75;
        spaceUsage.critical_threshold = 0.9;

        expect(spaceUsage.getRecommendedAction()).toBe("warning");
      });

      it("should recommend 'continue' when safe", () => {
        spaceUsage.is_exhausted = false;
        spaceUsage.usage_percentage = 0.5;
        spaceUsage.warning_threshold = 0.75;
        spaceUsage.critical_threshold = 0.9;

        expect(spaceUsage.getRecommendedAction()).toBe("continue");
      });

      it("should prioritize exhausted over other states", () => {
        spaceUsage.is_exhausted = true;
        spaceUsage.usage_percentage = 0.95; // Would be critical
        spaceUsage.critical_threshold = 0.9;

        expect(spaceUsage.getRecommendedAction()).toBe("exhausted");
      });

      it("should prioritize critical over warning", () => {
        spaceUsage.is_exhausted = false;
        spaceUsage.usage_percentage = 0.95; // Above both thresholds
        spaceUsage.warning_threshold = 0.75;
        spaceUsage.critical_threshold = 0.9;

        expect(spaceUsage.getRecommendedAction()).toBe("critical");
      });

      it("should handle edge threshold cases", () => {
        // Exactly at warning threshold
        spaceUsage.is_exhausted = false;
        spaceUsage.usage_percentage = 0.75;
        spaceUsage.warning_threshold = 0.75;
        spaceUsage.critical_threshold = 0.9;

        expect(spaceUsage.getRecommendedAction()).toBe("warning");

        // Exactly at critical threshold
        spaceUsage.usage_percentage = 0.9;
        expect(spaceUsage.getRecommendedAction()).toBe("critical");
      });
    });
  });

  describe("Entity State Management", () => {
    it("should maintain property values after assignment", () => {
      const testData = {
        id: "test-uuid-456",
        strategy: "nanoid",
        alphabet_hash: "testhash456",
        alphabet: "ABC123def",
        length: 8,
        namespace: "test-space",
        usage_count: 500,
        total_space: 10000,
        usage_percentage: 0.05,
        warning_threshold: 0.75,
        critical_threshold: 0.9,
        is_warning: false,
        is_critical: false,
        is_exhausted: false,
        warning_reached_at: null,
        critical_reached_at: null,
        exhausted_at: null,
        last_calculated_at: new Date("2023-01-01"),
        created_at: new Date("2023-01-01"),
        updated_at: new Date("2023-01-02"),
      };

      Object.assign(spaceUsage, testData);

      expect(spaceUsage.id).toBe(testData.id);
      expect(spaceUsage.strategy).toBe(testData.strategy);
      expect(spaceUsage.alphabet_hash).toBe(testData.alphabet_hash);
      expect(spaceUsage.alphabet).toBe(testData.alphabet);
      expect(spaceUsage.length).toBe(testData.length);
      expect(spaceUsage.namespace).toBe(testData.namespace);
      expect(spaceUsage.usage_count).toBe(testData.usage_count);
      expect(spaceUsage.total_space).toBe(testData.total_space);
      expect(spaceUsage.usage_percentage).toBe(testData.usage_percentage);
      expect(spaceUsage.warning_threshold).toBe(testData.warning_threshold);
      expect(spaceUsage.critical_threshold).toBe(testData.critical_threshold);
      expect(spaceUsage.is_warning).toBe(testData.is_warning);
      expect(spaceUsage.is_critical).toBe(testData.is_critical);
      expect(spaceUsage.is_exhausted).toBe(testData.is_exhausted);
      expect(spaceUsage.warning_reached_at).toBe(testData.warning_reached_at);
      expect(spaceUsage.critical_reached_at).toBe(testData.critical_reached_at);
      expect(spaceUsage.exhausted_at).toBe(testData.exhausted_at);
      expect(spaceUsage.last_calculated_at).toBe(testData.last_calculated_at);
      expect(spaceUsage.created_at).toBe(testData.created_at);
      expect(spaceUsage.updated_at).toBe(testData.updated_at);
    });

    it("should handle partial property updates", () => {
      spaceUsage.usage_count = 100;
      spaceUsage.is_warning = false;
      spaceUsage.usage_percentage = 0.1;

      // Update some properties
      spaceUsage.usage_count = 800;
      spaceUsage.is_warning = true;
      spaceUsage.usage_percentage = 0.8;

      expect(spaceUsage.usage_count).toBe(800);
      expect(spaceUsage.is_warning).toBe(true);
      expect(spaceUsage.usage_percentage).toBe(0.8);
    });

    it("should handle state transitions correctly", () => {
      // Start in safe state
      spaceUsage.usage_percentage = 0.5;
      spaceUsage.warning_threshold = 0.75;
      spaceUsage.critical_threshold = 0.9;
      spaceUsage.is_warning = false;
      spaceUsage.is_critical = false;
      spaceUsage.is_exhausted = false;

      expect(spaceUsage.getRecommendedAction()).toBe("continue");

      // Move to warning state
      spaceUsage.usage_percentage = 0.8;
      spaceUsage.is_warning = true;
      expect(spaceUsage.getRecommendedAction()).toBe("warning");

      // Move to critical state
      spaceUsage.usage_percentage = 0.95;
      spaceUsage.is_critical = true;
      expect(spaceUsage.getRecommendedAction()).toBe("critical");

      // Move to exhausted state
      spaceUsage.is_exhausted = true;
      expect(spaceUsage.getRecommendedAction()).toBe("exhausted");
    });
  });

  describe("Real-world Usage Scenarios", () => {
    it("should handle initial space creation", () => {
      const newSpace = Object.assign(new SlugSpaceUsage(), {
        id: "new-space-id",
        strategy: "nanoid",
        alphabet_hash: "abc123hash",
        alphabet:
          "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_",
        length: 7,
        namespace: null,
        usage_count: 0,
        total_space: Math.pow(64, 7), // 64^7
        usage_percentage: 0.0,
        warning_threshold: 0.75,
        critical_threshold: 0.9,
        is_warning: false,
        is_critical: false,
        is_exhausted: false,
        warning_reached_at: null,
        critical_reached_at: null,
        exhausted_at: null,
        last_calculated_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      });

      expect(newSpace.usage_count).toBe(0);
      expect(newSpace.usage_percentage).toBe(0);
      expect(newSpace.getRecommendedAction()).toBe("continue");
      expect(newSpace.shouldPreventGeneration()).toBe(false);
      expect(newSpace.getRemainingSpace()).toBe(Math.pow(64, 7));
    });

    it("should handle space usage progression", () => {
      spaceUsage.total_space = 1000;
      spaceUsage.warning_threshold = 0.75;
      spaceUsage.critical_threshold = 0.9;

      // Start with low usage
      spaceUsage.usage_count = 100;
      spaceUsage.usage_percentage = 0.1;
      expect(spaceUsage.getRecommendedAction()).toBe("continue");

      // Progress to warning
      spaceUsage.usage_count = 750;
      spaceUsage.usage_percentage = 0.75;
      spaceUsage.is_warning = true;
      spaceUsage.warning_reached_at = new Date();
      expect(spaceUsage.getRecommendedAction()).toBe("warning");

      // Progress to critical
      spaceUsage.usage_count = 900;
      spaceUsage.usage_percentage = 0.9;
      spaceUsage.is_critical = true;
      spaceUsage.critical_reached_at = new Date();
      expect(spaceUsage.getRecommendedAction()).toBe("critical");

      // Progress to exhausted
      spaceUsage.usage_count = 999;
      spaceUsage.usage_percentage = 0.999;
      spaceUsage.is_exhausted = true;
      spaceUsage.exhausted_at = new Date();
      expect(spaceUsage.getRecommendedAction()).toBe("exhausted");
    });

    it("should handle namespace-specific spaces", () => {
      const userSpaces = [
        Object.assign(new SlugSpaceUsage(), {
          strategy: "nanoid",
          namespace: "user-123",
          alphabet_hash: "hash1",
          length: 7,
          usage_count: 50,
        }),
        Object.assign(new SlugSpaceUsage(), {
          strategy: "nanoid",
          namespace: "user-456",
          alphabet_hash: "hash1", // Same alphabet
          length: 7, // Same length
          usage_count: 150, // Different usage
        }),
        Object.assign(new SlugSpaceUsage(), {
          strategy: "nanoid",
          namespace: null, // Global namespace
          alphabet_hash: "hash1",
          length: 7,
          usage_count: 1000,
        }),
      ];

      expect(userSpaces[0].getSpaceKey()).toContain("user-123");
      expect(userSpaces[1].getSpaceKey()).toContain("user-456");
      expect(userSpaces[2].getSpaceKey()).not.toContain("user");

      expect(userSpaces[0].usage_count).not.toBe(userSpaces[1].usage_count);
      expect(userSpaces[1].usage_count).not.toBe(userSpaces[2].usage_count);
    });

    it("should handle different strategy configurations", () => {
      const strategies = [
        {
          strategy: "nanoid",
          alphabet: "ABC123",
          length: 6,
          expectedSpace: Math.pow(6, 6),
        },
        {
          strategy: "uuid",
          alphabet: "0123456789abcdef",
          length: 8,
          expectedSpace: Math.pow(16, 8),
        },
        {
          strategy: "base58",
          alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz",
          length: 5,
          expectedSpace: Math.pow(58, 5),
        },
      ];

      strategies.forEach((config, index) => {
        const space = Object.assign(new SlugSpaceUsage(), {
          id: `space-${index}`,
          strategy: config.strategy,
          alphabet: config.alphabet,
          length: config.length,
          total_space: config.expectedSpace,
        });

        expect(space.strategy).toBe(config.strategy);
        expect(space.alphabet).toBe(config.alphabet);
        expect(space.length).toBe(config.length);
        expect(space.total_space).toBe(config.expectedSpace);
      });
    });

    it("should handle threshold configuration changes", () => {
      spaceUsage.usage_percentage = 0.8;

      // Conservative thresholds
      spaceUsage.warning_threshold = 0.6;
      spaceUsage.critical_threshold = 0.7;
      expect(spaceUsage.isApproachingExhaustion()).toBe(true);
      expect(spaceUsage.isCriticallyFull()).toBe(true);

      // Liberal thresholds
      spaceUsage.warning_threshold = 0.85;
      spaceUsage.critical_threshold = 0.95;
      expect(spaceUsage.isApproachingExhaustion()).toBe(false);
      expect(spaceUsage.isCriticallyFull()).toBe(false);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle method calls with uninitialized properties", () => {
      const emptySpace = new SlugSpaceUsage();

      // Most methods should work with undefined/null properties
      expect(() => {
        emptySpace.isApproachingExhaustion();
        emptySpace.isCriticallyFull();
        emptySpace.getRemainingSpace();
        emptySpace.getUtilizationPercentage();
        emptySpace.shouldPreventGeneration();
        emptySpace.getRecommendedAction();
      }).not.toThrow();

      // getSpaceKey requires length property to be defined
      emptySpace.strategy = "test";
      emptySpace.alphabet_hash = "test";
      emptySpace.length = 7;

      expect(() => {
        emptySpace.getSpaceKey();
      }).not.toThrow();
    });

    it("should handle zero total space", () => {
      spaceUsage.total_space = 0;
      spaceUsage.usage_count = 0;

      expect(spaceUsage.getRemainingSpace()).toBe(0);
    });

    it("should handle negative values", () => {
      spaceUsage.usage_count = -100;
      spaceUsage.total_space = 1000;
      spaceUsage.usage_percentage = -0.1;

      expect(spaceUsage.getRemainingSpace()).toBe(1100);
      expect(spaceUsage.getUtilizationPercentage()).toBe(-10);
    });

    it("should handle very large numbers", () => {
      spaceUsage.total_space = Number.MAX_SAFE_INTEGER;
      spaceUsage.usage_count = Number.MAX_SAFE_INTEGER - 1000;

      expect(spaceUsage.getRemainingSpace()).toBe(1000);
    });

    it("should handle floating point precision", () => {
      spaceUsage.usage_percentage = 0.1 + 0.2; // 0.30000000000000004
      spaceUsage.warning_threshold = 0.3;

      expect(spaceUsage.isApproachingExhaustion()).toBe(true); // Due to floating point precision
    });
  });

  describe("Entity Serialization", () => {
    it("should serialize to JSON correctly", () => {
      const testSpace = Object.assign(new SlugSpaceUsage(), {
        id: "test-space-id",
        strategy: "nanoid",
        alphabet_hash: "hash123",
        alphabet: "ABC123",
        length: 7,
        namespace: "test",
        usage_count: 100,
        total_space: 1000,
        usage_percentage: 0.1,
        warning_threshold: 0.75,
        critical_threshold: 0.9,
        is_warning: false,
        is_critical: false,
        is_exhausted: false,
        warning_reached_at: null,
        critical_reached_at: new Date("2023-01-01"),
        exhausted_at: null,
        last_calculated_at: new Date("2023-01-02"),
        created_at: new Date("2023-01-01"),
        updated_at: new Date("2023-01-02"),
      });

      const serialized = JSON.stringify(testSpace);
      const parsed = JSON.parse(serialized);

      expect(parsed.id).toBe("test-space-id");
      expect(parsed.strategy).toBe("nanoid");
      expect(parsed.alphabet_hash).toBe("hash123");
      expect(parsed.usage_count).toBe(100);
      expect(parsed.usage_percentage).toBe(0.1);
      expect(parsed.is_warning).toBe(false);
      expect(parsed.warning_reached_at).toBeNull();
      expect(parsed.critical_reached_at).toBe("2023-01-01T00:00:00.000Z");
    });

    it("should handle serialization of methods", () => {
      const serialized = JSON.stringify(spaceUsage);
      const parsed = JSON.parse(serialized);

      // Methods should not be serialized
      expect(parsed.isApproachingExhaustion).toBeUndefined();
      expect(parsed.isCriticallyFull).toBeUndefined();
      expect(parsed.getRemainingSpace).toBeUndefined();
      expect(parsed.getUtilizationPercentage).toBeUndefined();
      expect(parsed.getSpaceKey).toBeUndefined();
      expect(parsed.shouldPreventGeneration).toBeUndefined();
      expect(parsed.getRecommendedAction).toBeUndefined();
    });
  });
});
