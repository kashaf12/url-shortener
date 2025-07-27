import { Injectable, Inject } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

@Injectable()
export class HealthService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger
  ) {}

  getHealthStatus() {
    this.logger.debug("Health status check requested");
    return "ok";
  }

  getHealthCheck() {
    const healthData = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    this.logger.debug("Detailed health check requested", healthData);
    return healthData;
  }
}
