import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle("URL Shortener API")
    .setDescription("A fast and reliable URL shortening service")
    .setVersion("1.0")
    .addTag("url-shortener")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, cleanupOpenApiDoc(document));
}
