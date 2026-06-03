import { Test, TestingModule } from "@nestjs/testing";
import { RequestLoggerMiddleware } from "./request-logger.middleware";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Request, Response, NextFunction } from "express";

describe("RequestLoggerMiddleware", () => {
  let middleware: RequestLoggerMiddleware;
  let mockLogger: any;
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: NextFunction;

  beforeEach(async () => {
    // Mock Winston logger
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestLoggerMiddleware,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    middleware = module.get<RequestLoggerMiddleware>(RequestLoggerMiddleware);
  });

  beforeEach(() => {
    // Reset mock request
    mockRequest = {
      method: "GET",
      originalUrl: "/api/test",
      ip: "127.0.0.1",
      headers: {
        "user-agent": "test-agent",
        "content-length": "100",
      },
    };

    // Reset mock response
    mockResponse = {
      statusCode: 200,
      end: jest.fn().mockReturnValue(mockResponse),
      json: jest.fn().mockReturnValue(mockResponse),
      get: jest.fn().mockReturnValue("50"),
    };

    // Reset mock next
    mockNext = jest.fn();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("Middleware Functionality", () => {
    it("should be defined", () => {
      expect(middleware).toBeDefined();
    });

    it("should implement NestMiddleware interface", () => {
      expect(middleware.use).toBeDefined();
      expect(typeof middleware.use).toBe("function");
    });

    it("should call next() function", () => {
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("Request Logging", () => {
    it("should log incoming request with all required fields", () => {
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Incoming Request",
        expect.objectContaining({
          requestId: expect.stringMatching(/^req_\d+_[a-z0-9]{9}$/),
          method: "GET",
          url: "/api/test",
          ip: "127.0.0.1",
          userAgent: "test-agent",
          contentLength: "100",
          timestamp: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
          ),
        })
      );
    });

    it("should handle missing user-agent header", () => {
      mockRequest.headers = { "content-length": "100" };
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Incoming Request",
        expect.objectContaining({
          userAgent: "",
        })
      );
    });

    it("should handle missing content-length header", () => {
      mockRequest.headers = { "user-agent": "test-agent" };
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Incoming Request",
        expect.objectContaining({
          contentLength: "0",
        })
      );
    });

    it("should handle missing headers entirely", () => {
      mockRequest.headers = {};
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Incoming Request",
        expect.objectContaining({
          userAgent: "",
          contentLength: "0",
        })
      );
    });

    it("should add requestId to request object", () => {
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect((mockRequest as any).requestId).toBeDefined();
      expect((mockRequest as any).requestId).toMatch(/^req_\d+_[a-z0-9]{9}$/);
    });

    it("should generate unique request IDs", () => {
      const request1 = { ...mockRequest };
      const request2 = { ...mockRequest };
      const response1 = { ...mockResponse };
      const response2 = { ...mockResponse };

      middleware.use(request1 as Request, response1 as Response, mockNext);
      middleware.use(request2 as Request, response2 as Response, mockNext);

      expect((request1 as any).requestId).toBeDefined();
      expect((request2 as any).requestId).toBeDefined();
      expect((request1 as any).requestId).not.toBe((request2 as any).requestId);
    });
  });

  describe("Response Logging", () => {
    it("should override response.end and log response", done => {
      mockResponse.statusCode = 200;

      // Set up mock to verify response logging
      const originalEnd = mockResponse.end;
      mockResponse.end = jest.fn(function (
        this: any,
        chunk?: any,
        encoding?: any
      ) {
        // Verify that the response was logged
        setTimeout(() => {
          expect(mockLogger.info).toHaveBeenCalledWith(
            "Response Sent",
            expect.objectContaining({
              requestId: expect.stringMatching(/^req_\d+_[a-z0-9]{9}$/),
              method: "GET",
              url: "/api/test",
              statusCode: 200,
              duration: expect.stringMatching(/^\d+ms$/),
              responseSize: "50",
              timestamp: expect.stringMatching(
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
              ),
            })
          );
          done();
        }, 0);
        return originalEnd.call(this, chunk, encoding);
      });

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Trigger response end
      mockResponse.end();
    });

    it("should log client errors with warn level", done => {
      mockResponse.statusCode = 404;

      const originalEnd = mockResponse.end;
      mockResponse.end = jest.fn(function (
        this: any,
        chunk?: any,
        encoding?: any
      ) {
        setTimeout(() => {
          expect(mockLogger.warn).toHaveBeenCalledWith(
            "Response Sent",
            expect.objectContaining({
              statusCode: 404,
            })
          );
          done();
        }, 0);
        return originalEnd.call(this, chunk, encoding);
      });

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      mockResponse.end();
    });

    it("should log server errors with error level", done => {
      mockResponse.statusCode = 500;

      const originalEnd = mockResponse.end;
      mockResponse.end = jest.fn(function (
        this: any,
        chunk?: any,
        encoding?: any
      ) {
        setTimeout(() => {
          expect(mockLogger.error).toHaveBeenCalledWith(
            "Response Sent",
            expect.objectContaining({
              statusCode: 500,
            })
          );
          done();
        }, 0);
        return originalEnd.call(this, chunk, encoding);
      });

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      mockResponse.end();
    });

    it("should handle missing content-length in response", done => {
      mockResponse.get = jest.fn().mockReturnValue(undefined);

      const originalEnd = mockResponse.end;
      mockResponse.end = jest.fn(function (
        this: any,
        chunk?: any,
        encoding?: any
      ) {
        setTimeout(() => {
          expect(mockLogger.info).toHaveBeenCalledWith(
            "Response Sent",
            expect.objectContaining({
              responseSize: "0",
            })
          );
          done();
        }, 0);
        return originalEnd.call(this, chunk, encoding);
      });

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      mockResponse.end();
    });

    it("should measure response duration accurately", done => {
      const startTime = Date.now();

      const originalEnd = mockResponse.end;
      mockResponse.end = jest.fn(function (
        this: any,
        chunk?: any,
        encoding?: any
      ) {
        setTimeout(() => {
          const logCall = mockLogger.info.mock.calls.find(
            (call: any) => call[0] === "Response Sent"
          );
          expect(logCall).toBeDefined();

          const duration = parseInt(logCall[1].duration.replace("ms", ""));
          const actualDuration = Date.now() - startTime;

          // Duration should be reasonable (within 100ms tolerance due to test timing)
          expect(duration).toBeGreaterThanOrEqual(0);
          expect(duration).toBeLessThan(actualDuration + 100);
          done();
        }, 10);
        return originalEnd.call(this, chunk, encoding);
      });

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Wait a bit before triggering end to ensure measurable duration
      setTimeout(() => {
        mockResponse.end();
      }, 10);
    });
  });

  describe("JSON Response Capture", () => {
    it("should capture JSON response body", done => {
      const responseData = { message: "Success", data: { id: 1 } };

      // Mock the json method to capture response body
      const originalJson = mockResponse.json;
      mockResponse.json = jest.fn(function (this: any, body: any) {
        return originalJson.call(this, body);
      });

      const originalEnd = mockResponse.end;
      mockResponse.end = jest.fn(function (
        this: any,
        chunk?: any,
        encoding?: any
      ) {
        setTimeout(() => {
          expect(mockLogger.info).toHaveBeenCalledWith(
            "Response Sent",
            expect.objectContaining({
              responseBody: JSON.stringify(responseData),
            })
          );
          done();
        }, 0);
        return originalEnd.call(this, chunk, encoding);
      });

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Simulate calling res.json()
      mockResponse.json(responseData);
      mockResponse.end();
    });

    it("should include response body for error responses", done => {
      mockResponse.statusCode = 400;
      const errorResponse = { error: "Bad Request", message: "Invalid input" };

      const originalJson = mockResponse.json;
      mockResponse.json = jest.fn(function (this: any, body: any) {
        return originalJson.call(this, body);
      });

      const originalEnd = mockResponse.end;
      mockResponse.end = jest.fn(function (
        this: any,
        chunk?: any,
        encoding?: any
      ) {
        setTimeout(() => {
          expect(mockLogger.warn).toHaveBeenCalledWith(
            "Response Sent",
            expect.objectContaining({
              responseBody: JSON.stringify(errorResponse),
            })
          );
          done();
        }, 0);
        return originalEnd.call(this, chunk, encoding);
      });

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      mockResponse.json(errorResponse);
      mockResponse.end();
    });

    it("should not include large response bodies for success responses", done => {
      mockResponse.statusCode = 200;
      const largeResponse = { data: "x".repeat(2000) }; // > 1000 chars

      const originalJson = mockResponse.json;
      mockResponse.json = jest.fn(function (this: any, body: any) {
        return originalJson.call(this, body);
      });

      const originalEnd = mockResponse.end;
      mockResponse.end = jest.fn(function (
        this: any,
        chunk?: any,
        encoding?: any
      ) {
        setTimeout(() => {
          const logCall = mockLogger.info.mock.calls.find(
            (call: any) => call[0] === "Response Sent"
          );
          expect(logCall[1]).not.toHaveProperty("responseBody");
          done();
        }, 0);
        return originalEnd.call(this, chunk, encoding);
      });

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      mockResponse.json(largeResponse);
      mockResponse.end();
    });

    it("should include large response bodies for error responses", done => {
      mockResponse.statusCode = 500;
      const largeErrorResponse = {
        error: "Internal Error",
        details: "x".repeat(2000),
      };

      const originalJson = mockResponse.json;
      mockResponse.json = jest.fn(function (this: any, body: any) {
        return originalJson.call(this, body);
      });

      const originalEnd = mockResponse.end;
      mockResponse.end = jest.fn(function (
        this: any,
        chunk?: any,
        encoding?: any
      ) {
        setTimeout(() => {
          expect(mockLogger.error).toHaveBeenCalledWith(
            "Response Sent",
            expect.objectContaining({
              responseBody: JSON.stringify(largeErrorResponse),
            })
          );
          done();
        }, 0);
        return originalEnd.call(this, chunk, encoding);
      });

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      mockResponse.json(largeErrorResponse);
      mockResponse.end();
    });
  });

  describe("Request ID Generation", () => {
    it("should generate request ID with correct format", () => {
      const requestId = (middleware as any).generateRequestId();

      expect(requestId).toMatch(/^req_\d+_[a-z0-9]{9}$/);
      expect(requestId).toContain("req_");
      expect(requestId.split("_")).toHaveLength(3);
    });

    it("should generate unique request IDs", () => {
      const id1 = (middleware as any).generateRequestId();
      const id2 = (middleware as any).generateRequestId();
      const id3 = (middleware as any).generateRequestId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it("should include timestamp in request ID", () => {
      const beforeTime = Date.now();
      const requestId = (middleware as any).generateRequestId();
      const afterTime = Date.now();

      const timestamp = parseInt(requestId.split("_")[1]);
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });

    it("should include random component in request ID", () => {
      const requestId = (middleware as any).generateRequestId();
      const randomPart = requestId.split("_")[2];

      expect(randomPart).toHaveLength(9);
      expect(randomPart).toMatch(/^[a-z0-9]{9}$/);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle request without headers", () => {
      mockRequest.headers = undefined as any;

      expect(() => {
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).not.toThrow();

      expect(mockNext).toHaveBeenCalled();
    });

    it("should handle different HTTP methods", () => {
      const methods = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
        "OPTIONS",
        "HEAD",
      ];

      methods.forEach(method => {
        mockRequest.method = method;
        jest.clearAllMocks();

        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockLogger.info).toHaveBeenCalledWith(
          "Incoming Request",
          expect.objectContaining({ method })
        );
      });
    });

    it("should handle different status codes correctly", async () => {
      const testCases = [
        { statusCode: 200, expectedLevel: "info" },
        { statusCode: 201, expectedLevel: "info" },
        { statusCode: 301, expectedLevel: "info" },
        { statusCode: 400, expectedLevel: "warn" },
        { statusCode: 401, expectedLevel: "warn" },
        { statusCode: 404, expectedLevel: "warn" },
        { statusCode: 500, expectedLevel: "error" },
        { statusCode: 502, expectedLevel: "error" },
        { statusCode: 503, expectedLevel: "error" },
      ];

      for (const { statusCode, expectedLevel } of testCases) {
        // Reset mocks for each test
        jest.clearAllMocks();

        const testRequest = { ...mockRequest };
        const testResponse = { ...mockResponse, statusCode };

        const originalEnd = testResponse.end;
        let responseLogged = false;

        testResponse.end = jest.fn(function (
          this: any,
          chunk?: any,
          encoding?: any
        ) {
          responseLogged = true;
          return originalEnd.call(this, chunk, encoding);
        });

        middleware.use(
          testRequest as Request,
          testResponse as Response,
          mockNext
        );
        testResponse.end();

        // Wait for async response logging
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(responseLogged).toBe(true);
        expect(mockLogger[expectedLevel]).toHaveBeenCalledWith(
          "Response Sent",
          expect.objectContaining({ statusCode })
        );
      }
    });

    it("should preserve original response.end functionality", done => {
      const testChunk = "test data";
      const testEncoding = "utf8";
      let originalEndCalled = false;

      const originalEnd = mockResponse.end;
      mockResponse.end = jest.fn(function (
        this: any,
        chunk?: any,
        encoding?: any
      ) {
        originalEndCalled = true;
        expect(chunk).toBe(testChunk);
        expect(encoding).toBe(testEncoding);

        setTimeout(() => {
          expect(originalEndCalled).toBe(true);
          done();
        }, 0);
        return originalEnd.call(this, chunk, encoding);
      });

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      mockResponse.end(testChunk, testEncoding);
    });

    it("should handle response without JSON calls", done => {
      const originalEnd = mockResponse.end;
      mockResponse.end = jest.fn(function (
        this: any,
        chunk?: any,
        encoding?: any
      ) {
        setTimeout(() => {
          const logCall = mockLogger.info.mock.calls.find(
            (call: any) => call[0] === "Response Sent"
          );
          expect(logCall[1]).not.toHaveProperty("responseBody");
          done();
        }, 0);
        return originalEnd.call(this, chunk, encoding);
      });

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      mockResponse.end();
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complete request-response cycle", done => {
      const testData = {
        message: "Success",
        timestamp: new Date().toISOString(),
      };

      mockResponse.statusCode = 201;
      const originalJson = mockResponse.json;
      mockResponse.json = jest.fn(function (this: any, body: any) {
        return originalJson.call(this, body);
      });

      const originalEnd = mockResponse.end;
      mockResponse.end = jest.fn(function (
        this: any,
        chunk?: any,
        encoding?: any
      ) {
        setTimeout(() => {
          // Verify request was logged
          expect(mockLogger.info).toHaveBeenNthCalledWith(
            1,
            "Incoming Request",
            expect.objectContaining({
              method: "GET",
              url: "/api/test",
            })
          );

          // Verify response was logged
          expect(mockLogger.info).toHaveBeenNthCalledWith(
            2,
            "Response Sent",
            expect.objectContaining({
              statusCode: 201,
              responseBody: JSON.stringify(testData),
            })
          );

          expect(mockLogger.info).toHaveBeenCalledTimes(2);
          done();
        }, 0);
        return originalEnd.call(this, chunk, encoding);
      });

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Simulate controller processing
      mockResponse.json(testData);
      mockResponse.end();
    });

    it("should maintain request ID consistency across request and response logs", done => {
      const originalEnd = mockResponse.end;
      mockResponse.end = jest.fn(function (
        this: any,
        chunk?: any,
        encoding?: any
      ) {
        setTimeout(() => {
          const requestLog = mockLogger.info.mock.calls[0];
          const responseLog = mockLogger.info.mock.calls[1];

          expect(requestLog[1].requestId).toBe(responseLog[1].requestId);
          done();
        }, 0);
        return originalEnd.call(this, chunk, encoding);
      });

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      mockResponse.end();
    });

    it("should handle concurrent requests independently", async () => {
      const request1 = { ...mockRequest, originalUrl: "/api/test1" };
      const request2 = { ...mockRequest, originalUrl: "/api/test2" };
      const response1 = { ...mockResponse, statusCode: 200 };
      const response2 = { ...mockResponse, statusCode: 404 };

      // Set up response1 end
      const originalEnd1 = response1.end;
      response1.end = jest.fn(function (
        this: any,
        chunk?: any,
        encoding?: any
      ) {
        return originalEnd1.call(this, chunk, encoding);
      });

      // Set up response2 end
      const originalEnd2 = response2.end;
      response2.end = jest.fn(function (
        this: any,
        chunk?: any,
        encoding?: any
      ) {
        return originalEnd2.call(this, chunk, encoding);
      });

      // Process both requests
      middleware.use(request1 as Request, response1 as Response, mockNext);
      middleware.use(request2 as Request, response2 as Response, mockNext);

      // End both responses
      response1.end();
      response2.end();

      // Wait for async completion
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify different request IDs
      expect((request1 as any).requestId).not.toBe((request2 as any).requestId);

      // Verify all logs were created
      expect(mockLogger.info).toHaveBeenCalledTimes(3); // 2 requests + 1 success response
      expect(mockLogger.warn).toHaveBeenCalledTimes(1); // 1 error response
    });
  });
});
