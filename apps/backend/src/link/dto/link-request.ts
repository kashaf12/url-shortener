import { createZodDto } from "nestjs-zod";
import { UnshortenRequestSchema } from "@url-shortener/types";

export class UnshortenRequestDto extends createZodDto(UnshortenRequestSchema) {}
