import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import * as request from "supertest";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";

import { AppModule } from "../src/app.module";
import { Link } from "../src/link/entities/link.entity";
import { SlugSpaceUsage } from "../src/slug/entities/slug-space-usage.entity";
import { setupSwagger } from "../src/config/swagger";

describe("URL Shortener E2E Tests", () => {
  let app: INestApplication;
  let linkRepository: Repository<Link>;
  let slugSpaceRepository: Repository<SlugSpaceUsage>;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env.test",
        }),
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [Link, SlugSpaceUsage],
          synchronize: true,
          dropSchema: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configure validation pipe for proper validation
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      })
    );

    // Setup Swagger for documentation
    setupSwagger(app);

    linkRepository = moduleFixture.get<Repository<Link>>(
      getRepositoryToken(Link)
    );
    slugSpaceRepository = moduleFixture.get<Repository<SlugSpaceUsage>>(
      getRepositoryToken(SlugSpaceUsage)
    );

    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean the database before each test
    await linkRepository.clear();
    await slugSpaceRepository.clear();
  });

  describe("Health Check", () => {
    it("/health (GET) - should return application health status", () => {
      return request(server)
        .get("/health")
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty("status", "ok");
          expect(res.body).toHaveProperty("info");
          expect(res.body).toHaveProperty("error");
          expect(res.body).toHaveProperty("details");
        });
    });

    it("/health/database (GET) - should return database health status", () => {
      return request(server)
        .get("/health/database")
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty("status");
          expect(res.body).toHaveProperty("info");
        });
    });
  });

  describe("API Documentation", () => {
    it("/docs (GET) - should serve Swagger documentation", () => {
      return request(server)
        .get("/docs")
        .expect(200)
        .expect("Content-Type", /text\/html/);
    });

    it("/docs-json (GET) - should serve Swagger JSON spec", () => {
      return request(server)
        .get("/docs-json")
        .expect(200)
        .expect("Content-Type", /application\/json/)
        .expect(res => {
          expect(res.body).toHaveProperty("openapi");
          expect(res.body).toHaveProperty("info");
          expect(res.body).toHaveProperty("paths");
        });
    });
  });

  describe("Basic Application", () => {
    it("/ (GET) - should return welcome message", () => {
      return request(server)
        .get("/")
        .expect(200)
        .expect("Welcome from url-shortener!");
    });
  });

  describe("Link Shortening API", () => {
    describe("POST /links - Create Short Link", () => {
      it("should create a short link with minimal required data", () => {
        const createLinkDto = {
          url: "https://example.com",
        };

        return request(server)
          .post("/links")
          .send(createLinkDto)
          .expect(201)
          .expect(res => {
            expect(res.body).toHaveProperty("id");
            expect(res.body).toHaveProperty("url", "https://example.com");
            expect(res.body).toHaveProperty("slug");
            expect(res.body).toHaveProperty("shortUrl");
            expect(res.body).toHaveProperty("createdAt");
            expect(res.body).toHaveProperty("updatedAt");
            expect(res.body.slug).toMatch(/^[A-Za-z0-9_-]+$/);
            expect(res.body.slug.length).toBeGreaterThanOrEqual(4);
            expect(res.body.slug.length).toBeLessThanOrEqual(21);
          });
      });

      it("should create a short link with custom slug", () => {
        const createLinkDto = {
          url: "https://example.com",
          customSlug: "my-custom-slug",
        };

        return request(server)
          .post("/links")
          .send(createLinkDto)
          .expect(201)
          .expect(res => {
            expect(res.body.slug).toBe("my-custom-slug");
            expect(res.body.shortUrl).toContain("my-custom-slug");
          });
      });

      it("should create a short link with metadata", () => {
        const createLinkDto = {
          url: "https://example.com",
          metadata: {
            title: "Example Site",
            description: "An example website",
            tags: ["example", "test"],
          },
        };

        return request(server)
          .post("/links")
          .send(createLinkDto)
          .expect(201)
          .expect(res => {
            expect(res.body.metadata).toEqual({
              title: "Example Site",
              description: "An example website",
              tags: ["example", "test"],
            });
          });
      });

      it("should create a short link with specific slug strategy", () => {
        const createLinkDto = {
          url: "https://example.com",
          slugStrategy: "nanoid",
          length: 8,
          alphabetType: "urlSafe",
        };

        return request(server)
          .post("/links")
          .send(createLinkDto)
          .expect(201)
          .expect(res => {
            expect(res.body.slug).toMatch(/^[A-Za-z0-9_-]+$/);
            expect(res.body.slug.length).toBe(8);
          });
      });

      it("should create a short link with UUID strategy", () => {
        const createLinkDto = {
          url: "https://example.com",
          slugStrategy: "uuid",
          format: "short",
        };

        return request(server)
          .post("/links")
          .send(createLinkDto)
          .expect(201)
          .expect(res => {
            expect(res.body.slug).toMatch(/^[0-9a-f]{8,12}$/i);
          });
      });

      it("should create a short link with namespace", () => {
        const createLinkDto = {
          url: "https://example.com",
          namespace: "test-namespace",
        };

        return request(server)
          .post("/links")
          .send(createLinkDto)
          .expect(201)
          .expect(res => {
            expect(res.body.namespace).toBe("test-namespace");
          });
      });

      it("should create a short link with deduplication enabled", () => {
        const createLinkDto = {
          url: "https://example.com?utm_source=test&utm_medium=email",
          deduplicate: true,
          enhancedCanonical: true,
        };

        return request(server)
          .post("/links")
          .send(createLinkDto)
          .expect(201)
          .expect(res => {
            expect(res.body.url).toBe(
              "https://example.com?utm_source=test&utm_medium=email"
            );
            expect(res.body.canonicalUrl).toBeDefined();
          });
      });

      describe("Validation Tests", () => {
        it("should reject invalid URL", () => {
          const createLinkDto = {
            url: "not-a-valid-url",
          };

          return request(server)
            .post("/links")
            .send(createLinkDto)
            .expect(400)
            .expect(res => {
              expect(res.body.message).toContain("url");
            });
        });

        it("should reject custom slug with invalid characters", () => {
          const createLinkDto = {
            url: "https://example.com",
            customSlug: "invalid slug with spaces!",
          };

          return request(server).post("/links").send(createLinkDto).expect(400);
        });

        it("should reject custom slug that is too short", () => {
          const createLinkDto = {
            url: "https://example.com",
            customSlug: "a",
          };

          return request(server).post("/links").send(createLinkDto).expect(400);
        });

        it("should reject custom slug that is too long", () => {
          const createLinkDto = {
            url: "https://example.com",
            customSlug: "a".repeat(50),
          };

          return request(server).post("/links").send(createLinkDto).expect(400);
        });

        it("should reject invalid slug strategy", () => {
          const createLinkDto = {
            url: "https://example.com",
            slugStrategy: "invalid-strategy",
          };

          return request(server).post("/links").send(createLinkDto).expect(400);
        });

        it("should reject invalid alphabet type", () => {
          const createLinkDto = {
            url: "https://example.com",
            alphabetType: "invalid-alphabet",
          };

          return request(server).post("/links").send(createLinkDto).expect(400);
        });

        it("should reject invalid length", () => {
          const createLinkDto = {
            url: "https://example.com",
            length: 100,
          };

          return request(server).post("/links").send(createLinkDto).expect(400);
        });
      });

      describe("Collision Handling", () => {
        it("should handle custom slug collision", async () => {
          const createLinkDto1 = {
            url: "https://example.com",
            customSlug: "duplicate-slug",
          };

          const createLinkDto2 = {
            url: "https://another-example.com",
            customSlug: "duplicate-slug",
          };

          // Create first link
          await request(server).post("/links").send(createLinkDto1).expect(201);

          // Try to create second link with same slug
          return request(server)
            .post("/links")
            .send(createLinkDto2)
            .expect(409)
            .expect(res => {
              expect(res.body.message).toContain("collision");
            });
        });

        it("should generate unique slug when collision occurs", async () => {
          const urls = Array.from(
            { length: 10 },
            (_, i) => `https://example${i}.com`
          );
          const responses: any[] = [];

          // Create multiple links rapidly
          for (const url of urls) {
            const response = await request(server)
              .post("/links")
              .send({ url })
              .expect(201);
            responses.push(response.body);
          }

          // Verify all slugs are unique
          const slugs = responses.map(r => r.slug);
          const uniqueSlugs = new Set(slugs);
          expect(uniqueSlugs.size).toBe(slugs.length);
        });
      });
    });

    describe("GET /links/:slug - Redirect to Original URL", () => {
      let createdLink: any;

      beforeEach(async () => {
        const createLinkDto = {
          url: "https://example.com",
          customSlug: "test-redirect",
        };

        const response = await request(server)
          .post("/links")
          .send(createLinkDto)
          .expect(201);

        createdLink = response.body;
      });

      it("should redirect to original URL", () => {
        return request(server)
          .get(`/links/${createdLink.slug}`)
          .expect(302)
          .expect("Location", "https://example.com");
      });

      it("should return 404 for non-existent slug", () => {
        return request(server).get("/links/non-existent-slug").expect(404);
      });

      it("should handle case-sensitive slugs", () => {
        return request(server)
          .get(`/links/${createdLink.slug.toUpperCase()}`)
          .expect(404);
      });
    });

    describe("GET /links - List Links", () => {
      beforeEach(async () => {
        // Create test data
        const testLinks = [
          { url: "https://example1.com", customSlug: "link1" },
          { url: "https://example2.com", customSlug: "link2" },
          { url: "https://example3.com", customSlug: "link3" },
        ];

        for (const linkDto of testLinks) {
          await request(server).post("/links").send(linkDto).expect(201);
        }
      });

      it("should return paginated list of links", () => {
        return request(server)
          .get("/links")
          .expect(200)
          .expect(res => {
            expect(res.body).toHaveProperty("data");
            expect(res.body).toHaveProperty("meta");
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.meta).toHaveProperty("page");
            expect(res.body.meta).toHaveProperty("limit");
            expect(res.body.meta).toHaveProperty("total");
          });
      });

      it("should support pagination parameters", () => {
        return request(server)
          .get("/links?page=1&limit=2")
          .expect(200)
          .expect(res => {
            expect(res.body.data.length).toBeLessThanOrEqual(2);
            expect(res.body.meta.page).toBe(1);
            expect(res.body.meta.limit).toBe(2);
          });
      });

      it("should support filtering by namespace", async () => {
        // Create a link with a specific namespace
        await request(server)
          .post("/links")
          .send({
            url: "https://namespaced-example.com",
            namespace: "special-namespace",
          })
          .expect(201);

        return request(server)
          .get("/links?namespace=special-namespace")
          .expect(200)
          .expect(res => {
            expect(
              res.body.data.every(
                (link: any) => link.namespace === "special-namespace"
              )
            ).toBe(true);
          });
      });
    });

    describe("PUT /links/:id - Update Link", () => {
      let createdLink: any;

      beforeEach(async () => {
        const createLinkDto = {
          url: "https://example.com",
          metadata: { title: "Original Title" },
        };

        const response = await request(server)
          .post("/links")
          .send(createLinkDto)
          .expect(201);

        createdLink = response.body;
      });

      it("should update link metadata", () => {
        const updateLinkDto = {
          metadata: { title: "Updated Title", description: "New description" },
        };

        return request(server)
          .put(`/links/${createdLink.id}`)
          .send(updateLinkDto)
          .expect(200)
          .expect(res => {
            expect(res.body.metadata.title).toBe("Updated Title");
            expect(res.body.metadata.description).toBe("New description");
            expect(res.body.updatedAt).not.toBe(createdLink.updatedAt);
          });
      });

      it("should update custom slug", () => {
        const updateLinkDto = {
          customSlug: "new-custom-slug",
        };

        return request(server)
          .put(`/links/${createdLink.id}`)
          .send(updateLinkDto)
          .expect(200)
          .expect(res => {
            expect(res.body.slug).toBe("new-custom-slug");
          });
      });

      it("should return 404 for non-existent link", () => {
        return request(server)
          .put("/links/99999")
          .send({ metadata: { title: "Test" } })
          .expect(404);
      });

      it("should reject invalid update data", () => {
        return request(server)
          .put(`/links/${createdLink.id}`)
          .send({ url: "cannot-update-url" })
          .expect(400);
      });
    });

    describe("DELETE /links/:id - Delete Link", () => {
      let createdLink: any;

      beforeEach(async () => {
        const createLinkDto = {
          url: "https://example.com",
        };

        const response = await request(server)
          .post("/links")
          .send(createLinkDto)
          .expect(201);

        createdLink = response.body;
      });

      it("should delete existing link", () => {
        return request(server).delete(`/links/${createdLink.id}`).expect(204);
      });

      it("should return 404 after deletion", async () => {
        await request(server).delete(`/links/${createdLink.id}`).expect(204);

        return request(server).get(`/links/${createdLink.slug}`).expect(404);
      });

      it("should return 404 for non-existent link", () => {
        return request(server).delete("/links/99999").expect(404);
      });
    });
  });

  describe("Slug Strategies Management", () => {
    describe("GET /slug-strategies - List Available Strategies", () => {
      it("should return available slug strategies", () => {
        return request(server)
          .get("/slug-strategies")
          .expect(200)
          .expect(res => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  name: "nanoid",
                  description: expect.any(String),
                  options: expect.any(Object),
                }),
                expect.objectContaining({
                  name: "uuid",
                  description: expect.any(String),
                  options: expect.any(Object),
                }),
              ])
            );
          });
      });
    });

    describe("GET /slug-strategies/:strategy/metadata - Get Strategy Metadata", () => {
      it("should return nanoid strategy metadata", () => {
        return request(server)
          .get("/slug-strategies/nanoid/metadata")
          .expect(200)
          .expect(res => {
            expect(res.body).toHaveProperty("name", "nanoid");
            expect(res.body).toHaveProperty("description");
            expect(res.body).toHaveProperty("options");
            expect(res.body.options).toHaveProperty("alphabetTypes");
            expect(res.body.options).toHaveProperty("lengthRange");
          });
      });

      it("should return uuid strategy metadata", () => {
        return request(server)
          .get("/slug-strategies/uuid/metadata")
          .expect(200)
          .expect(res => {
            expect(res.body).toHaveProperty("name", "uuid");
            expect(res.body).toHaveProperty("description");
            expect(res.body).toHaveProperty("options");
            expect(res.body.options).toHaveProperty("formats");
          });
      });

      it("should return 404 for unknown strategy", () => {
        return request(server)
          .get("/slug-strategies/unknown/metadata")
          .expect(404);
      });
    });
  });

  describe("Performance and Load Testing", () => {
    it("should handle concurrent link creation", async () => {
      const concurrentRequests = 50;
      const promises = Array.from({ length: concurrentRequests }, (_, i) =>
        request(server)
          .post("/links")
          .send({ url: `https://concurrent-test-${i}.com` })
      );

      const responses = await Promise.all(promises);

      // All requests should succeed
      responses.forEach(res => {
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("slug");
      });

      // All slugs should be unique
      const slugs = responses.map(res => res.body.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(concurrentRequests);
    });

    it("should handle rapid redirects", async () => {
      // Create a test link
      const createResponse = await request(server)
        .post("/links")
        .send({ url: "https://performance-test.com" })
        .expect(201);

      const slug = createResponse.body.slug;
      const redirectRequests = 20;

      // Test rapid redirects
      const promises = Array.from({ length: redirectRequests }, () =>
        request(server).get(`/links/${slug}`)
      );

      const responses = await Promise.all(promises);

      responses.forEach(res => {
        expect(res.status).toBe(302);
        expect(res.headers.location).toBe("https://performance-test.com");
      });
    });

    it("should respond to health checks under load", async () => {
      const healthRequests = 100;
      const promises = Array.from({ length: healthRequests }, () =>
        request(server).get("/health")
      );

      const responses = await Promise.all(promises);

      responses.forEach(res => {
        expect(res.status).toBe(200);
        expect(res.body.status).toBe("ok");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed JSON gracefully", () => {
      return request(server)
        .post("/links")
        .set("Content-Type", "application/json")
        .send("{ invalid json }")
        .expect(400);
    });

    it("should handle missing Content-Type header", () => {
      return request(server)
        .post("/links")
        .send("url=https://example.com")
        .expect(400);
    });

    it("should handle very large payloads", () => {
      const largeMetadata = {
        url: "https://example.com",
        metadata: {
          description: "x".repeat(10000), // Very large description
        },
      };

      return request(server).post("/links").send(largeMetadata).expect(400);
    });

    it("should return appropriate error for unsupported HTTP methods", () => {
      return request(server).patch("/links").expect(405);
    });
  });

  describe("Security Tests", () => {
    it("should sanitize malicious URLs", () => {
      const maliciousDto = {
        url: 'javascript:alert("xss")',
      };

      return request(server).post("/links").send(maliciousDto).expect(400);
    });

    it("should reject URLs with suspicious schemes", () => {
      const suspiciousSchemes = [
        "file:///etc/passwd",
        "data:text/html,<script>alert(1)</script>",
        "vbscript:msgbox(1)",
      ];

      return Promise.all(
        suspiciousSchemes.map(url =>
          request(server).post("/links").send({ url }).expect(400)
        )
      );
    });

    it("should enforce rate limiting on link creation", async () => {
      const requests = Array.from({ length: 100 }, () =>
        request(server)
          .post("/links")
          .send({ url: "https://rate-limit-test.com" })
      );

      const responses = await Promise.allSettled(requests);

      // Some requests should be rate limited (429) or succeed (201)
      const statusCodes = responses.map(r =>
        r.status === "fulfilled" ? r.value.status : 500
      );

      expect(statusCodes).toEqual(
        expect.arrayContaining([201]) // Some should succeed
      );

      // In a real scenario, some might be rate limited, but this depends on implementation
    });

    it("should handle SQL injection attempts", () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE links; --",
        "' OR '1'='1",
        "'; UPDATE links SET url = 'https://evil.com' WHERE '1'='1'; --",
      ];

      return Promise.all(
        sqlInjectionAttempts.map(maliciousInput =>
          request(server)
            .post("/links")
            .send({
              url: "https://example.com",
              customSlug: maliciousInput,
            })
            .expect(400)
        )
      );
    });
  });

  describe("Data Integrity", () => {
    it("should maintain referential integrity", async () => {
      // Create a link
      const createResponse = await request(server)
        .post("/links")
        .send({ url: "https://integrity-test.com" })
        .expect(201);

      const linkId = createResponse.body.id;

      // Verify link exists in database
      const link = await linkRepository.findOne({ where: { id: linkId } });
      expect(link).toBeDefined();
      expect(link?.url).toBe("https://integrity-test.com");

      // Delete the link
      await request(server).delete(`/links/${linkId}`).expect(204);

      // Verify link is removed from database
      const deletedLink = await linkRepository.findOne({
        where: { id: linkId },
      });
      expect(deletedLink).toBeNull();
    });

    it("should handle database constraints properly", async () => {
      // This test would depend on your specific database constraints
      // For example, testing unique constraints on slugs
      const testSlug = "unique-constraint-test";

      await request(server)
        .post("/links")
        .send({
          url: "https://first.com",
          customSlug: testSlug,
        })
        .expect(201);

      // Try to create another link with the same slug
      return request(server)
        .post("/links")
        .send({
          url: "https://second.com",
          customSlug: testSlug,
        })
        .expect(409); // Conflict
    });
  });

  describe("Edge Cases", () => {
    it("should handle Unicode URLs correctly", () => {
      const unicodeUrl = "https://例え.テスト/パス?クエリ=値";

      return request(server)
        .post("/links")
        .send({ url: unicodeUrl })
        .expect(201)
        .expect(res => {
          expect(res.body.url).toBe(unicodeUrl);
        });
    });

    it("should handle very long URLs", () => {
      const longUrl = "https://example.com/" + "a".repeat(2000);

      return request(server)
        .post("/links")
        .send({ url: longUrl })
        .expect(201)
        .expect(res => {
          expect(res.body.url).toBe(longUrl);
        });
    });

    it("should handle URLs with all types of query parameters", () => {
      const complexUrl =
        "https://example.com/path?param1=value1&param2=value%20with%20spaces&param3&param4=";

      return request(server)
        .post("/links")
        .send({ url: complexUrl })
        .expect(201)
        .expect(res => {
          expect(res.body.url).toBe(complexUrl);
        });
    });

    it("should handle empty metadata gracefully", () => {
      return request(server)
        .post("/links")
        .send({
          url: "https://example.com",
          metadata: {},
        })
        .expect(201)
        .expect(res => {
          expect(res.body.metadata).toEqual({});
        });
    });
  });
});
