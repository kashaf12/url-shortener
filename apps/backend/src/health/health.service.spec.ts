import { Test, TestingModule } from "@nestjs/testing";
import { HealthService } from "./health.service";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";

describe("HealthService", () => {
  let service: HealthService;
  let mockLogger: any;

  beforeEach(async () => {
    // Create a mock logger
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return health status", () => {
    const result = service.getHealthStatus();
    expect(result).toBe("ok");
    expect(mockLogger.debug).toHaveBeenCalledWith(
      "Health status check requested"
    );
  });

  it("should return detailed health check", () => {
    const result = service.getHealthCheck();
    expect(result.status).toBe("ok");
    expect(result.timestamp).toBeDefined();
    expect(result.uptime).toBeDefined();
    expect(mockLogger.debug).toHaveBeenCalledWith(
      "Detailed health check requested",
      result
    );
  });
});
