import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

import { AppModule } from "./app.module";
import { setupSwagger } from "./config/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Replace default NestJS logger with Winston
  const winstonLogger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(winstonLogger);

  // Enable CORS for frontend integration
  app.enableCors();

  // Set global prefix for API routes
  app.setGlobalPrefix("v1");

  setupSwagger(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 8000);

  await app.listen(port);
  winstonLogger.log(
    `🌍 Application is running in ${configService.get("NODE_ENV")} mode`,
    "Bootstrap"
  );

  winstonLogger.log(
    `🚀 Application is running on: http://localhost:${port}/v1`,
    "Bootstrap"
  );
  winstonLogger.log(
    `📚 API Documentation: http://localhost:${port}/v1/docs`,
    "Bootstrap"
  );
}
void bootstrap();
