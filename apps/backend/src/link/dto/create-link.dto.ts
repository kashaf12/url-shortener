import { createZodDto } from "nestjs-zod";
import { ShortenRequestSchema } from "@url-shortener/types";

export class CreateLinkDto extends createZodDto(ShortenRequestSchema) {}
