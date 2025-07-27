import { createZodDto } from "nestjs-zod";
import {
  ShortenResponseSchema,
  UnshortenRequestSchema,
  UnshortenResponseSchema,
} from "@url-shortener/types";

export class ShortenResponseDto extends createZodDto(ShortenResponseSchema) {}

export class UnshortenResponseDto extends createZodDto(
  UnshortenResponseSchema
) {}
