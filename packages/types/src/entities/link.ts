import { z } from "zod";

// Link metadata interface
export const LinkMetadataSchema = z
  .object({
    title: z.string().optional(),
    tags: z.array(z.string()).optional(),
    user_name: z.string().optional(),
    source: z.string().optional(),
  })
  .catchall(z.union([z.string(), z.array(z.string())])); // Allow additional properties

export type LinkMetadata = z.infer<typeof LinkMetadataSchema>;

// Core Link entity interface
export const LinkSchema = z.object({
  id: z.uuid(),
  slug: z.string().min(1).max(20),
  url: z.url(),
  metadata: LinkMetadataSchema,
  click_count: z.number().int().min(0).nonnegative().default(0),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
  last_clicked_at: z.iso.datetime().nullable().optional(),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
  source: z.enum(["public_web", "dashboard", "api"]).default("public_web"),
});

export type Link = z.infer<typeof LinkSchema>;

// Link entity for API responses (dates as ISO strings)
export const LinkResponseSchema = z.object({
  id: z.uuid(),
  slug: z.string().min(1).max(20),
  url: z.url(),
  // metadata: LinkMetadataSchema,
  // click_count: z.number().int().min(0),
  // created_at: z.string().datetime(),
  // updated_at: z.string().datetime(),
});

export type LinkResponse = z.infer<typeof LinkResponseSchema>;
