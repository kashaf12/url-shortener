import { Injectable, NestMiddleware, Inject } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers["user-agent"] || "";
    const contentLength = headers["content-length"] || "0";

    const startTime = Date.now();
    const requestId = this.generateRequestId();

    // Add request ID to request object for use in other parts of the application
    (req as any).requestId = requestId;

    // Log incoming request
    this.logger.info("Incoming Request", {
      requestId,
      method,
      url: originalUrl,
      ip,
      userAgent,
      contentLength,
      timestamp: new Date().toISOString(),
    });

    // Override res.end to capture response details
    const originalEnd = res.end;
    let responseBody = "";
    const logger = this.logger; // Capture logger reference for use in closure

    // Capture response body if it's JSON
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      responseBody = JSON.stringify(body);
      return originalJson(body);
    };

    res.end = function (chunk?: any, encoding?: any) {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      const responseSize = res.get("content-length") || "0";

      // Log response details
      const responseLog: any = {
        requestId,
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
        responseSize,
        timestamp: new Date().toISOString(),
      };

      // Include response body for non-2xx status codes or if it's small
      if (statusCode >= 400 || (responseBody && responseBody.length < 1000)) {
        responseLog.responseBody = responseBody;
      }

      // Log at appropriate level based on status code
      if (statusCode >= 500) {
        logger.error("Response Sent", responseLog);
      } else if (statusCode >= 400) {
        logger.warn("Response Sent", responseLog);
      } else {
        logger.info("Response Sent", responseLog);
      }

      return originalEnd.call(this, chunk, encoding);
    };

    next();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
