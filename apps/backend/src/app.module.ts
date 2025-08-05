import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WinstonModule } from "nest-winston";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { HealthModule } from "./health/health.module";
import { LinkModule } from "./link/link.module";
import { SlugModule } from "./slug/slug.module";
import { Link } from "./link/entities/link.entity";
import { SlugSpaceUsage } from "./slug/entities/slug-space-usage.entity";
import { APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import { createLoggerConfig } from "./config/logger.config";
import { RequestLoggerMiddleware } from "./middleware/request-logger.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        createLoggerConfig(configService),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("POSTGRES_HOST", "localhost"),
        port: configService.get("POSTGRES_PORT", 5432),
        username: configService.get("POSTGRES_USER", "postgres"),
        password: configService.get("POSTGRES_PASSWORD", "password"),
        database: configService.get("POSTGRES_DB", "url_shortener"),
        entities: [Link, SlugSpaceUsage],
        synchronize: configService.get("NODE_ENV") !== "production",
        // logging: configService.get("NODE_ENV") === "development",
      }),
      inject: [ConfigService],
    }),
    HealthModule,
    SlugModule,
    LinkModule, // make sure it's at last
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes("*");
  }
}
