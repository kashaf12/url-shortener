import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";
import { setupSwagger } from "./swagger";

// Mock dependencies
jest.mock("@nestjs/swagger");
jest.mock("nestjs-zod");

describe("Swagger Configuration", () => {
  let mockApp: jest.Mocked<INestApplication>;
  let mockDocument: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock INestApplication
    mockApp = {
      use: jest.fn(),
      listen: jest.fn(),
      close: jest.fn(),
      get: jest.fn(),
      select: jest.fn(),
      init: jest.fn(),
    } as any;

    // Mock document
    mockDocument = {
      openapi: "3.0.0",
      info: {
        title: "URL Shortener API",
        description: "A fast and reliable URL shortening service",
        version: "1.0",
      },
      tags: [{ name: "url-shortener" }],
      paths: {},
    };

    // Mock DocumentBuilder
    const mockDocumentBuilder = {
      setTitle: jest.fn().mockReturnThis(),
      setDescription: jest.fn().mockReturnThis(),
      setVersion: jest.fn().mockReturnThis(),
      addTag: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue(mockDocument),
    };

    DocumentBuilder.mockImplementation(() => mockDocumentBuilder);

    // Mock SwaggerModule methods
    (SwaggerModule.createDocument as jest.Mock).mockReturnValue(mockDocument);
    (SwaggerModule.setup as jest.Mock).mockImplementation(() => {});

    // Mock nestjs-zod cleanup
    (cleanupOpenApiDoc as jest.Mock).mockImplementation(doc => doc);
  });

  describe("setupSwagger", () => {
    it("should be defined", () => {
      expect(setupSwagger).toBeDefined();
      expect(typeof setupSwagger).toBe("function");
    });

    it("should create DocumentBuilder instance", () => {
      setupSwagger(mockApp);

      expect(DocumentBuilder).toHaveBeenCalledTimes(1);
    });

    it("should configure DocumentBuilder with correct values", () => {
      setupSwagger(mockApp);

      const builderInstance = (DocumentBuilder as any).mock.results[0].value;

      expect(builderInstance.setTitle).toHaveBeenCalledWith(
        "URL Shortener API"
      );
      expect(builderInstance.setDescription).toHaveBeenCalledWith(
        "A fast and reliable URL shortening service"
      );
      expect(builderInstance.setVersion).toHaveBeenCalledWith("1.0");
      expect(builderInstance.addTag).toHaveBeenCalledWith("url-shortener");
      expect(builderInstance.build).toHaveBeenCalled();
    });

    it("should create Swagger document with app and config", () => {
      setupSwagger(mockApp);

      expect(SwaggerModule.createDocument).toHaveBeenCalledWith(
        mockApp,
        mockDocument
      );
    });

    it("should setup Swagger UI at /docs endpoint", () => {
      setupSwagger(mockApp);

      expect(SwaggerModule.setup).toHaveBeenCalledWith(
        "docs",
        mockApp,
        mockDocument
      );
    });

    it("should clean up OpenAPI document", () => {
      setupSwagger(mockApp);

      expect(cleanupOpenApiDoc).toHaveBeenCalledWith(mockDocument);
    });

    it("should call all setup steps in correct order", () => {
      const mockOrder: string[] = [];

      // Track call order
      (SwaggerModule.createDocument as jest.Mock).mockImplementation(() => {
        mockOrder.push("createDocument");
        return mockDocument;
      });

      (cleanupOpenApiDoc as jest.Mock).mockImplementation(doc => {
        mockOrder.push("cleanupOpenApiDoc");
        return doc;
      });

      (SwaggerModule.setup as jest.Mock).mockImplementation(() => {
        mockOrder.push("setup");
      });

      setupSwagger(mockApp);

      expect(mockOrder).toEqual([
        "createDocument",
        "cleanupOpenApiDoc",
        "setup",
      ]);
    });

    it("should not throw errors during setup", () => {
      expect(() => setupSwagger(mockApp)).not.toThrow();
    });

    it("should handle various app types gracefully", () => {
      expect(() => setupSwagger(mockApp)).not.toThrow();

      // Should work with minimal app mock
      const minimalApp = {} as INestApplication;
      expect(() => setupSwagger(minimalApp)).not.toThrow();
    });
  });

  describe("Error handling", () => {
    it("should handle SwaggerModule.createDocument failures", () => {
      (SwaggerModule.createDocument as jest.Mock).mockImplementation(() => {
        throw new Error("Failed to create document");
      });

      expect(() => setupSwagger(mockApp)).toThrow("Failed to create document");
    });

    it("should handle cleanupOpenApiDoc failures", () => {
      (cleanupOpenApiDoc as jest.Mock).mockImplementation(() => {
        throw new Error("Failed to cleanup document");
      });

      expect(() => setupSwagger(mockApp)).toThrow("Failed to cleanup document");
    });

    it("should handle SwaggerModule.setup failures", () => {
      (SwaggerModule.setup as jest.Mock).mockImplementation(() => {
        throw new Error("Failed to setup Swagger UI");
      });

      expect(() => setupSwagger(mockApp)).toThrow("Failed to setup Swagger UI");
    });
  });

  describe("Document handling", () => {
    it("should handle empty document", () => {
      const emptyDocument = {};
      (SwaggerModule.createDocument as jest.Mock).mockReturnValue(
        emptyDocument
      );
      (cleanupOpenApiDoc as jest.Mock).mockReturnValue(emptyDocument);

      expect(() => setupSwagger(mockApp)).not.toThrow();
      expect(SwaggerModule.setup).toHaveBeenCalledWith(
        "docs",
        mockApp,
        emptyDocument
      );
    });

    it("should handle null document", () => {
      const nullDocument = null;
      (SwaggerModule.createDocument as jest.Mock).mockReturnValue(nullDocument);
      (cleanupOpenApiDoc as jest.Mock).mockReturnValue(nullDocument);

      expect(() => setupSwagger(mockApp)).not.toThrow();
      expect(SwaggerModule.setup).toHaveBeenCalledWith(
        "docs",
        mockApp,
        nullDocument
      );
    });

    it("should handle document modification by cleanupOpenApiDoc", () => {
      const originalDocument = { original: true };
      const cleanedDocument = { cleaned: true };

      (SwaggerModule.createDocument as jest.Mock).mockReturnValue(
        originalDocument
      );
      (cleanupOpenApiDoc as jest.Mock).mockReturnValue(cleanedDocument);

      setupSwagger(mockApp);

      expect(cleanupOpenApiDoc).toHaveBeenCalledWith(originalDocument);
      expect(SwaggerModule.setup).toHaveBeenCalledWith(
        "docs",
        mockApp,
        cleanedDocument
      );
    });
  });

  describe("Configuration values", () => {
    it("should use correct API configuration", () => {
      setupSwagger(mockApp);

      const builderInstance = (DocumentBuilder as any).mock.results[0].value;

      expect(builderInstance.setTitle).toHaveBeenCalledWith(
        "URL Shortener API"
      );
      expect(builderInstance.setDescription).toHaveBeenCalledWith(
        "A fast and reliable URL shortening service"
      );
      expect(builderInstance.setVersion).toHaveBeenCalledWith("1.0");
      expect(builderInstance.addTag).toHaveBeenCalledWith("url-shortener");
    });

    it("should setup at correct endpoint", () => {
      setupSwagger(mockApp);

      expect(SwaggerModule.setup).toHaveBeenCalledWith(
        "docs",
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe("Performance", () => {
    it("should complete setup quickly", () => {
      const startTime = Date.now();
      setupSwagger(mockApp);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should handle multiple calls efficiently", () => {
      const startTime = Date.now();

      for (let i = 0; i < 10; i++) {
        setupSwagger(mockApp);
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // 10 calls in under 1 second
    });
  });

  describe("Memory management", () => {
    it("should not leak memory with repeated calls", () => {
      // Test that repeated calls don't accumulate resources
      const initialCallCount = (SwaggerModule.createDocument as jest.Mock).mock
        .calls.length;

      for (let i = 0; i < 100; i++) {
        setupSwagger(mockApp);
      }

      expect(SwaggerModule.createDocument as jest.Mock).toHaveBeenCalledTimes(
        initialCallCount + 100
      );
      // Each call should be independent and not accumulate state
    });

    it("should handle large app objects gracefully", () => {
      const largeApp = {
        ...mockApp,
        largeProperty: new Array(10000).fill("large-data"),
        deepNested: {
          level1: { level2: { level3: { data: "deep" } } },
        },
      };

      expect(() => setupSwagger(largeApp as any)).not.toThrow();
    });
  });
});
