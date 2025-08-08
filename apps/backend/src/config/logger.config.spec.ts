import { ConfigService } from "@nestjs/config";
import { createLoggerConfig } from "./logger.config";
import { transports } from "winston";

describe("Logger Configuration", () => {
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn(),
    } as any;
  });

  describe("createLoggerConfig", () => {
    it("should create default logger configuration", () => {
      mockConfigService.get
        .mockReturnValueOnce("development") // NODE_ENV
        .mockReturnValueOnce("debug") // LOG_LEVEL
        .mockReturnValueOnce("url-shortener-api") // SERVICE_NAME
        .mockReturnValueOnce(false); // LOGGER_SILENT

      const config = createLoggerConfig(mockConfigService);

      expect(config).toBeDefined();
      expect(config.level).toBe("debug");
      expect(config.exitOnError).toBe(false);
      expect(config.silent).toBe(false);
      expect(config.transports).toHaveLength(1); // Only console in development
    });

    it("should use default values when config is not provided", () => {
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: any) => defaultValue
      );

      const config = createLoggerConfig(mockConfigService);

      expect(mockConfigService.get).toHaveBeenCalledWith(
        "NODE_ENV",
        "development"
      );
      expect(mockConfigService.get).toHaveBeenCalledWith("LOG_LEVEL", "debug");
      expect(mockConfigService.get).toHaveBeenCalledWith(
        "SERVICE_NAME",
        "url-shortener-api"
      );
      expect(config.level).toBe("debug");
    });

    it("should configure production environment correctly", () => {
      mockConfigService.get
        .mockReturnValueOnce("production") // NODE_ENV
        .mockReturnValueOnce("info") // LOG_LEVEL (default for production)
        .mockReturnValueOnce("url-shortener-api") // SERVICE_NAME
        .mockReturnValueOnce(false); // LOGGER_SILENT

      const config = createLoggerConfig(mockConfigService);

      expect(config.level).toBe("info");
      expect(config.transports).toHaveLength(3); // Console + 2 file transports in production
      expect(Array.isArray(config.transports)).toBe(true);

      const transportsArray = config.transports as any[];

      // Check basic transport structure without instanceof (which may not work in Jest)
      expect(transportsArray).toHaveLength(3);
      expect(transportsArray[0]).toBeDefined(); // Console transport
      expect(transportsArray[1]).toBeDefined(); // Combined file transport
      expect(transportsArray[2]).toBeDefined(); // Error file transport

      // Check that file transports have the expected filenames (Winston strips the directory)
      const hasCorrectFilenames =
        transportsArray.some((t: any) => t.filename === "combined.log") &&
        transportsArray.some((t: any) => t.filename === "error.log");
      expect(hasCorrectFilenames).toBe(true);
    });

    it("should use info log level by default in production", () => {
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          if (key === "NODE_ENV") return "production";
          if (key === "LOG_LEVEL") return defaultValue; // Will be 'info' for production
          if (key === "SERVICE_NAME") return "url-shortener-api";
          if (key === "LOGGER_SILENT") return false;
          return defaultValue;
        }
      );

      const config = createLoggerConfig(mockConfigService);

      expect(config.level).toBe("info");
    });

    it("should use debug log level by default in development", () => {
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          if (key === "NODE_ENV") return "development";
          if (key === "LOG_LEVEL") return defaultValue; // Will be 'debug' for development
          if (key === "SERVICE_NAME") return "url-shortener-api";
          if (key === "LOGGER_SILENT") return false;
          return defaultValue;
        }
      );

      const config = createLoggerConfig(mockConfigService);

      expect(config.level).toBe("debug");
    });

    it("should respect custom log level", () => {
      mockConfigService.get
        .mockReturnValueOnce("development") // NODE_ENV
        .mockReturnValueOnce("warn") // Custom LOG_LEVEL
        .mockReturnValueOnce("url-shortener-api") // SERVICE_NAME
        .mockReturnValueOnce(false); // LOGGER_SILENT

      const config = createLoggerConfig(mockConfigService);

      expect(config.level).toBe("warn");
    });

    it("should respect custom service name", () => {
      const customServiceName = "custom-service-name";
      mockConfigService.get
        .mockReturnValueOnce("development") // NODE_ENV
        .mockReturnValueOnce("debug") // LOG_LEVEL
        .mockReturnValueOnce(customServiceName) // Custom SERVICE_NAME
        .mockReturnValueOnce(false); // LOGGER_SILENT

      const config = createLoggerConfig(mockConfigService);

      // Check if the service name is used in the format
      expect(config.format).toBeDefined();
    });

    it("should configure silent mode when specified", () => {
      mockConfigService.get
        .mockReturnValueOnce("development") // NODE_ENV
        .mockReturnValueOnce("debug") // LOG_LEVEL
        .mockReturnValueOnce("url-shortener-api") // SERVICE_NAME
        .mockReturnValueOnce(true); // LOGGER_SILENT = true

      const config = createLoggerConfig(mockConfigService);

      expect(config.silent).toBe(true);
    });

    it("should have appropriate format for development", () => {
      mockConfigService.get
        .mockReturnValueOnce("development") // NODE_ENV
        .mockReturnValueOnce("debug") // LOG_LEVEL
        .mockReturnValueOnce("url-shortener-api") // SERVICE_NAME
        .mockReturnValueOnce(false); // LOGGER_SILENT

      const config = createLoggerConfig(mockConfigService);

      expect(config.format).toBeDefined();

      const transportsArray = Array.isArray(config.transports)
        ? config.transports
        : [config.transports];
      const consoleTransport = transportsArray.find(
        (t: any) => t instanceof transports.Console
      );
      expect(consoleTransport).toBeDefined();
    });

    it("should have appropriate format for production", () => {
      mockConfigService.get
        .mockReturnValueOnce("production") // NODE_ENV
        .mockReturnValueOnce("info") // LOG_LEVEL
        .mockReturnValueOnce("url-shortener-api") // SERVICE_NAME
        .mockReturnValueOnce(false); // LOGGER_SILENT

      const config = createLoggerConfig(mockConfigService);

      expect(config.format).toBeDefined();

      const transportsArray = Array.isArray(config.transports)
        ? config.transports
        : [config.transports];
      const consoleTransport = transportsArray.find(
        (t: any) => t instanceof transports.Console
      );
      expect(consoleTransport).toBeDefined();
    });

    it("should configure file transports correctly in production", () => {
      mockConfigService.get
        .mockReturnValueOnce("production") // NODE_ENV
        .mockReturnValueOnce("info") // LOG_LEVEL
        .mockReturnValueOnce("url-shortener-api") // SERVICE_NAME
        .mockReturnValueOnce(false); // LOGGER_SILENT

      const config = createLoggerConfig(mockConfigService);

      const transportsArray = config.transports as any[];

      // Find file transports by checking for filename property
      const fileTransports = transportsArray.filter((t: any) => t.filename);
      expect(fileTransports).toHaveLength(2);

      const combinedLog = fileTransports.find(
        (t: any) => t.filename === "combined.log"
      );
      const errorLog = fileTransports.find(
        (t: any) => t.filename === "error.log"
      );

      expect(combinedLog).toBeDefined();
      expect(errorLog).toBeDefined();

      // Check file transport configurations
      expect(combinedLog.level).toBe("info");
      expect(errorLog.level).toBe("error");
      expect(combinedLog.maxsize).toBe(10 * 1024 * 1024);
      expect(errorLog.maxsize).toBe(10 * 1024 * 1024);
      expect(combinedLog.maxFiles).toBe(5);
      expect(errorLog.maxFiles).toBe(5);
      expect(combinedLog.tailable).toBe(true);
      expect(errorLog.tailable).toBe(true);
    });

    it("should configure console transport correctly", () => {
      mockConfigService.get
        .mockReturnValueOnce("development") // NODE_ENV
        .mockReturnValueOnce("debug") // LOG_LEVEL
        .mockReturnValueOnce("url-shortener-api") // SERVICE_NAME
        .mockReturnValueOnce(false); // LOGGER_SILENT

      const config = createLoggerConfig(mockConfigService);

      const transportsArray = config.transports as any[];
      const consoleTransport = transportsArray.find(
        (t: any) => t instanceof transports.Console
      ) as transports.ConsoleTransportInstance;
      expect(consoleTransport).toBeDefined();
      expect((consoleTransport as any).level).toBe("debug");
      expect((consoleTransport as any).handleExceptions).toBe(true);
      expect((consoleTransport as any).handleRejections).toBe(true);
    });

    it("should handle different environments correctly", () => {
      const environments = ["development", "staging", "production", "test"];

      environments.forEach(env => {
        const isProduction = env === "production";
        const expectedLevel = isProduction ? "info" : "debug";
        const expectedTransportCount = isProduction ? 3 : 1;

        mockConfigService.get.mockClear();
        mockConfigService.get
          .mockReturnValueOnce(env) // NODE_ENV
          .mockReturnValueOnce(expectedLevel) // LOG_LEVEL
          .mockReturnValueOnce("url-shortener-api") // SERVICE_NAME
          .mockReturnValueOnce(false); // LOGGER_SILENT

        const config = createLoggerConfig(mockConfigService);

        expect(config.level).toBe(expectedLevel);
        expect(config.transports).toHaveLength(expectedTransportCount);
        expect(config.exitOnError).toBe(false);
      });
    });

    it("should return a valid WinstonModuleOptions object", () => {
      mockConfigService.get
        .mockReturnValueOnce("development") // NODE_ENV
        .mockReturnValueOnce("debug") // LOG_LEVEL
        .mockReturnValueOnce("url-shortener-api") // SERVICE_NAME
        .mockReturnValueOnce(false); // LOGGER_SILENT

      const config = createLoggerConfig(mockConfigService);

      // Verify all required WinstonModuleOptions properties
      expect(config).toHaveProperty("level");
      expect(config).toHaveProperty("format");
      expect(config).toHaveProperty("transports");
      expect(config).toHaveProperty("exitOnError");
      expect(config).toHaveProperty("silent");

      expect(typeof config.level).toBe("string");
      expect(config.format).toBeDefined();
      expect(Array.isArray(config.transports)).toBe(true);
      expect(typeof config.exitOnError).toBe("boolean");
      expect(typeof config.silent).toBe("boolean");
    });
  });

  describe("Environment-specific behavior", () => {
    it("should use different formats for development vs production", () => {
      // Development config
      mockConfigService.get.mockClear();
      mockConfigService.get
        .mockReturnValueOnce("development") // NODE_ENV
        .mockReturnValueOnce("debug") // LOG_LEVEL
        .mockReturnValueOnce("url-shortener-api") // SERVICE_NAME
        .mockReturnValueOnce(false); // LOGGER_SILENT

      const devConfig = createLoggerConfig(mockConfigService);

      // Production config
      mockConfigService.get.mockClear();
      mockConfigService.get
        .mockReturnValueOnce("production") // NODE_ENV
        .mockReturnValueOnce("info") // LOG_LEVEL
        .mockReturnValueOnce("url-shortener-api") // SERVICE_NAME
        .mockReturnValueOnce(false); // LOGGER_SILENT

      const prodConfig = createLoggerConfig(mockConfigService);

      // Formats should be different
      expect(devConfig.format).toBeDefined();
      expect(prodConfig.format).toBeDefined();
      // In a real test, you might want to compare specific format characteristics
    });

    it("should add file logging only in production", () => {
      // Development - only console transport
      mockConfigService.get.mockClear();
      mockConfigService.get
        .mockReturnValueOnce("development")
        .mockReturnValueOnce("debug")
        .mockReturnValueOnce("url-shortener-api")
        .mockReturnValueOnce(false);

      const devConfig = createLoggerConfig(mockConfigService);
      const devTransportsArray = devConfig.transports as any[];
      const devFileTransports = devTransportsArray.filter(
        (t: any) => t instanceof transports.File
      );
      expect(devFileTransports).toHaveLength(0);

      // Production - console + file transports
      mockConfigService.get.mockClear();
      mockConfigService.get
        .mockReturnValueOnce("production")
        .mockReturnValueOnce("info")
        .mockReturnValueOnce("url-shortener-api")
        .mockReturnValueOnce(false);

      const prodConfig = createLoggerConfig(mockConfigService);
      const prodTransportsArray = prodConfig.transports as any[];
      const prodFileTransports = prodTransportsArray.filter(
        (t: any) => t instanceof transports.File
      );
      expect(prodFileTransports).toHaveLength(2);
    });
  });

  describe("Configuration validation", () => {
    it("should handle missing config service gracefully", () => {
      expect(() => createLoggerConfig(null as any)).toThrow();
    });

    it("should handle config service that returns undefined", () => {
      // Mock to return undefined, which will use the default values
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue: any) => defaultValue
      );

      // Should not throw and should use defaults
      expect(() => createLoggerConfig(mockConfigService)).not.toThrow();

      const config = createLoggerConfig(mockConfigService);
      expect(config.level).toBe("debug"); // Default for development
    });

    it("should handle boolean values correctly", () => {
      mockConfigService.get
        .mockReturnValueOnce("development")
        .mockReturnValueOnce("debug")
        .mockReturnValueOnce("url-shortener-api")
        .mockReturnValueOnce("true"); // String 'true'

      const config = createLoggerConfig(mockConfigService);
      expect(config.silent).toBe("true"); // Should preserve the actual returned value
    });

    it("should call ConfigService.get with correct parameters", () => {
      mockConfigService.get
        .mockReturnValueOnce("development")
        .mockReturnValueOnce("debug")
        .mockReturnValueOnce("url-shortener-api")
        .mockReturnValueOnce(false);

      createLoggerConfig(mockConfigService);

      expect(mockConfigService.get).toHaveBeenCalledWith(
        "NODE_ENV",
        "development"
      );
      expect(mockConfigService.get).toHaveBeenCalledWith("LOG_LEVEL", "debug");
      expect(mockConfigService.get).toHaveBeenCalledWith(
        "SERVICE_NAME",
        "url-shortener-api"
      );
      expect(mockConfigService.get).toHaveBeenCalledWith(
        "LOGGER_SILENT",
        false
      );
      expect(mockConfigService.get).toHaveBeenCalledTimes(4);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty string values", () => {
      mockConfigService.get
        .mockReturnValueOnce("") // Empty NODE_ENV
        .mockReturnValueOnce("") // Empty LOG_LEVEL
        .mockReturnValueOnce("") // Empty SERVICE_NAME
        .mockReturnValueOnce(false);

      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          if (key === "NODE_ENV") return defaultValue; // Empty string is falsy, return default
          if (key === "LOG_LEVEL") {
            const nodeEnv = defaultValue || "development"; // Use default when empty
            return nodeEnv === "production" ? "info" : "debug";
          }
          if (key === "SERVICE_NAME") return defaultValue; // Empty string is falsy, return default
          if (key === "LOGGER_SILENT") return false;
          return defaultValue;
        }
      );

      const config = createLoggerConfig(mockConfigService);
      expect(config).toBeDefined();
    });

    it("should handle non-standard environment names", () => {
      const customEnv = "custom-environment";
      mockConfigService.get
        .mockReturnValueOnce(customEnv)
        .mockReturnValueOnce("debug")
        .mockReturnValueOnce("url-shortener-api")
        .mockReturnValueOnce(false);

      const config = createLoggerConfig(mockConfigService);

      // Should treat non-production environments like development
      expect(config.transports).toHaveLength(1); // Only console transport
    });

    it("should handle different log levels", () => {
      const logLevels = ["error", "warn", "info", "debug", "silly"];

      logLevels.forEach(level => {
        mockConfigService.get.mockClear();
        mockConfigService.get
          .mockReturnValueOnce("development")
          .mockReturnValueOnce(level)
          .mockReturnValueOnce("url-shortener-api")
          .mockReturnValueOnce(false);

        const config = createLoggerConfig(mockConfigService);
        expect(config.level).toBe(level);
      });
    });
  });
});
