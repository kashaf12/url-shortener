import { Test, TestingModule } from "@nestjs/testing";
import { AppService } from "./app.service";

describe("AppService", () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe("Service Instantiation", () => {
    it("should be defined", () => {
      expect(service).toBeDefined();
    });

    it("should be an instance of AppService", () => {
      expect(service).toBeInstanceOf(AppService);
    });

    it("should have Injectable decorator applied", () => {
      expect(AppService).toBeDefined();
      expect(typeof AppService).toBe("function");
    });
  });

  describe("getHello", () => {
    it("should be defined as a method", () => {
      expect(service.getHello).toBeDefined();
      expect(typeof service.getHello).toBe("function");
    });

    it("should return the correct welcome message", () => {
      const result = service.getHello();
      expect(result).toBe("Welcome from url-shortener!");
    });

    it("should return a string", () => {
      const result = service.getHello();
      expect(typeof result).toBe("string");
    });

    it("should return consistent results on multiple calls", () => {
      const result1 = service.getHello();
      const result2 = service.getHello();
      const result3 = service.getHello();

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(result1).toBe(result3);
    });

    it("should not return null or undefined", () => {
      const result = service.getHello();
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
    });

    it("should return a non-empty string", () => {
      const result = service.getHello();
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return a message containing the application name", () => {
      const result = service.getHello();
      expect(result).toContain("url-shortener");
    });

    it("should return a welcome message", () => {
      const result = service.getHello();
      expect(result.toLowerCase()).toContain("welcome");
    });

    it("should not throw any errors", () => {
      expect(() => service.getHello()).not.toThrow();
    });

    it("should complete execution quickly", () => {
      const startTime = Date.now();
      service.getHello();
      const endTime = Date.now();

      // Should complete in less than 1ms for such a simple operation
      expect(endTime - startTime).toBeLessThan(1);
    });
  });

  describe("Service Behavior", () => {
    it("should maintain state between calls", () => {
      // Since this is a simple service with no state, test that it behaves consistently
      const initialCall = service.getHello();

      // Simulate some time passing
      const laterCall = service.getHello();

      expect(initialCall).toBe(laterCall);
    });

    it("should be stateless (no side effects)", () => {
      // Test that calling the method doesn't change any internal state
      const beforeCall = { ...service };
      service.getHello();
      const afterCall = { ...service };

      expect(beforeCall).toEqual(afterCall);
    });

    it("should handle multiple concurrent calls", async () => {
      // Test concurrent execution
      const promises = Array(10)
        .fill(null)
        .map(() => Promise.resolve(service.getHello()));

      const results = await Promise.all(promises);

      // All results should be identical
      results.forEach(result => {
        expect(result).toBe("Welcome from url-shortener!");
      });

      // Verify all results are the same
      const uniqueResults = [...new Set(results)];
      expect(uniqueResults).toHaveLength(1);
    });
  });

  describe("Method Properties", () => {
    it("should have correct method signature", () => {
      expect(service.getHello.length).toBe(0); // No parameters
    });

    it("should not have getHello as its own property", () => {
      expect(
        Object.prototype.hasOwnProperty.call(
          Object.getPrototypeOf(service),
          "getHello"
        )
      ).toBe(true);
    });

    it("should be enumerable in the prototype", () => {
      const descriptor = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(service),
        "getHello"
      );
      expect(descriptor).toBeDefined();
      expect(descriptor?.enumerable).toBe(false); // Class methods are non-enumerable by default
    });

    it("should be writable and configurable", () => {
      const descriptor = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(service),
        "getHello"
      );
      expect(descriptor?.writable).toBe(true);
      expect(descriptor?.configurable).toBe(true);
    });
  });

  describe("Integration with NestJS", () => {
    it("should be properly injectable", () => {
      // Test that the service can be injected by NestJS
      expect(service).toBeInstanceOf(AppService);
    });

    it("should work in a NestJS module context", async () => {
      // Create a new module to test injection
      const testModule = await Test.createTestingModule({
        providers: [AppService],
      }).compile();

      const testService = testModule.get<AppService>(AppService);
      expect(testService).toBeDefined();
      expect(testService.getHello()).toBe("Welcome from url-shortener!");

      await testModule.close();
    });

    it("should support singleton behavior", async () => {
      const module = await Test.createTestingModule({
        providers: [AppService],
      }).compile();

      const service1 = module.get<AppService>(AppService);
      const service2 = module.get<AppService>(AppService);

      // Should be the same instance (singleton)
      expect(service1).toBe(service2);

      await module.close();
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle toString conversion properly", () => {
      const result = service.getHello();
      expect(result.toString()).toBe("Welcome from url-shortener!");
    });

    it("should handle JSON serialization", () => {
      const result = service.getHello();
      expect(() => JSON.stringify({ message: result })).not.toThrow();

      const serialized = JSON.stringify({ message: result });
      const parsed = JSON.parse(serialized);
      expect(parsed.message).toBe("Welcome from url-shortener!");
    });

    it("should handle comparison operations", () => {
      const result1 = service.getHello();
      const result2 = "Welcome from url-shortener!";

      expect(result1 === result2).toBe(true);
      expect(result1 == result2).toBe(true);
      expect(Object.is(result1, result2)).toBe(true);
    });

    it("should handle string manipulation methods", () => {
      const result = service.getHello();

      expect(result.toUpperCase()).toBe("WELCOME FROM URL-SHORTENER!");
      expect(result.toLowerCase()).toBe("welcome from url-shortener!");
      expect(result.charAt(0)).toBe("W");
      expect(result.substring(0, 7)).toBe("Welcome");
      expect(result.indexOf("url-shortener")).toBeGreaterThan(-1);
    });

    it("should maintain immutability", () => {
      const result = service.getHello();
      const originalResult = result;

      // Attempt to modify (should not affect original)
      const modifiedResult = result.toUpperCase();

      expect(result).toBe(originalResult);
      expect(modifiedResult).not.toBe(result);
    });
  });

  describe("Performance and Memory", () => {
    it("should not leak memory on repeated calls", () => {
      // Test that repeated calls don't cause memory issues
      const results = [];
      for (let i = 0; i < 1000; i++) {
        results.push(service.getHello());
      }

      // All results should be the same string
      const uniqueResults = [...new Set(results)];
      expect(uniqueResults).toHaveLength(1);
      expect(uniqueResults[0]).toBe("Welcome from url-shortener!");
    });

    it("should execute efficiently", () => {
      const iterations = 10000;
      const startTime = process.hrtime.bigint();

      for (let i = 0; i < iterations; i++) {
        service.getHello();
      }

      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

      // Should complete 10,000 iterations in less than 10ms
      expect(duration).toBeLessThan(10);
    });
  });

  describe("Message Content Validation", () => {
    it("should return exactly the expected message format", () => {
      const result = service.getHello();
      const expectedPattern = /^Welcome from [a-z-]+!$/;
      expect(result).toMatch(expectedPattern);
    });

    it("should have proper capitalization", () => {
      const result = service.getHello();
      expect(result.charAt(0)).toBe("W"); // First letter capitalized
      expect(result).toMatch(/^[A-Z]/); // Starts with capital letter
    });

    it("should end with exclamation mark", () => {
      const result = service.getHello();
      expect(result.endsWith("!")).toBe(true);
      expect(result.charAt(result.length - 1)).toBe("!");
    });

    it("should contain appropriate spacing", () => {
      const result = service.getHello();
      expect(result).toContain(" "); // Contains spaces
      expect(result.split(" ")).toHaveLength(3); // "Welcome", "from", "url-shortener!"
    });

    it("should not contain any unwanted characters", () => {
      const result = service.getHello();

      // Should not contain newlines, tabs, or other control characters
      expect(result).not.toMatch(/[\n\r\t]/);

      // Should not contain HTML tags
      expect(result).not.toMatch(/<[^>]*>/);

      // Should not contain special characters except hyphen and exclamation
      expect(result).toMatch(/^[A-Za-z\s\-!]+$/);
    });

    it("should have reasonable length", () => {
      const result = service.getHello();

      expect(result.length).toBeGreaterThan(10);
      expect(result.length).toBeLessThan(50);
      expect(result.length).toBe(27); // Exact expected length
    });
  });
});
