import { Test, TestingModule } from "@nestjs/testing";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";

describe("HealthController", () => {
  let controller: HealthController;
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
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return health check", () => {
    const result = controller.checkHealth();
    expect(result.status).toBe("ok");
    expect(result.timestamp).toBeDefined();
    expect(result.uptime).toBeDefined();
  });
});
