import { ConfigService } from "@nestjs/config";
import { WinstonModuleOptions } from "nest-winston";
import { format, transports } from "winston";

export const createLoggerConfig = (
  configService: ConfigService
): WinstonModuleOptions => {
  const nodeEnv = configService.get<string>("NODE_ENV", "development");
  const logLevel = configService.get<string>(
    "LOG_LEVEL",
    nodeEnv === "production" ? "info" : "debug"
  );
  const service = configService.get<string>(
    "SERVICE_NAME",
    "url-shortener-api"
  );

  const baseFormat = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    format.errors({ stack: true }),
    format.label({ label: service }),
    format.splat()
  );

  const developmentFormat = format.combine(
    baseFormat,
    format.colorize({ all: true }),
    format.printf(info => {
      const { timestamp, level, message, label, ...rest } = info;

      const { metadata, ...others } = rest;

      const meta = metadata || others;

      const metaStr =
        meta && Object.keys(meta).length > 0
          ? `\n${JSON.stringify(meta, null, 2)}`
          : "";

      return `${String(timestamp)} [${String(label)}] ${String(level)}: ${String(message)}${metaStr}`;
    })
  );

  const productionFormat = format.combine(baseFormat, format.json());

  const logTransports: any[] = [];

  logTransports.push(
    new transports.Console({
      level: logLevel,
      format: nodeEnv === "production" ? productionFormat : developmentFormat,
      handleExceptions: true,
      handleRejections: true,
    })
  );

  if (nodeEnv === "production") {
    logTransports.push(
      new transports.File({
        filename: "logs/combined.log",
        level: "info",
        format: productionFormat,
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
        tailable: true,
      }),
      new transports.File({
        filename: "logs/error.log",
        level: "error",
        format: productionFormat,
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
        tailable: true,
        handleExceptions: true,
        handleRejections: true,
      })
    );
  }

  return {
    level: logLevel,
    format: nodeEnv === "production" ? productionFormat : developmentFormat,
    transports: logTransports,
    exitOnError: false,
    silent: configService.get("LOGGER_SILENT", false),
  };
};
