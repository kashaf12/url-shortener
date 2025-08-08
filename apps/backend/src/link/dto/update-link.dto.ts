import { createZodDto } from "nestjs-zod";
import { ShortenRequestSchema } from "@url-shortener/types";

// Partial update DTO for links (mainly for metadata updates)
export class UpdateLinkDto extends createZodDto(
  ShortenRequestSchema.partial().omit({ url: true })
) {}
