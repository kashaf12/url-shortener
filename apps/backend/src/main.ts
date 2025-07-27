import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

import { AppModule } from "./app.module";
import { cleanupOpenApiDoc } from "nestjs-zod";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Replace default NestJS logger with Winston
  const winstonLogger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(winstonLogger);

  // Enable CORS for frontend integration
  app.enableCors();

  // Set global prefix for API routes
  app.setGlobalPrefix("v1");

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("URL Shortener API")
    .setDescription("A fast and reliable URL shortening service")
    .setVersion("1.0")
    .addTag("url-shortener")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("v1/docs", app, cleanupOpenApiDoc(document));

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
