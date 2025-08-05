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
  // app.setGlobalPrefix("v1");

  setupSwagger(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 8000);
  const host = configService.get<string>("HOST", "http://localhost:8000");

  await app.listen(port);
  console.log(
    `🌍 Application is running in ${configService.get("NODE_ENV")} mode`,
    "Bootstrap"
  );

  console.log(`🚀 Application is running on: ${host}`, "Bootstrap");
  console.log(`📚 API Documentation: ${host}/docs`, "Bootstrap");
}
void bootstrap();
