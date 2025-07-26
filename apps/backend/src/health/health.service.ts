import { Injectable } from "@nestjs/common";

@Injectable()
export class HealthService {
  getHealthStatus() {
    return "ok";
  }
  getHealthCheck() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
