import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { LinkMetadata } from "@url-shortener/types";

@Entity("links")
@Index("idx_slug", ["slug"], { unique: true })
@Index("idx_url_metadata", ["url", "metadata"])
@Index("idx_url_metadata_hash", ["url", "metadata_hash"], { unique: true })
@Index("idx_metadata_hash", ["metadata_hash"])
// @Index("idx_namespace", ["namespace"])
@Index("idx_slug_namespace", ["slug", "namespace"], { unique: true })
export class Link {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 20, unique: true })
  slug!: string;

  @Column({ type: "text" })
  url!: string;

  @Column({ type: "jsonb", default: {} })
  metadata!: LinkMetadata;

  @Column({
    type: "varchar",
    length: 64,
    nullable: true,
    comment: "SHA-256 hash of URL + filtered metadata for deduplication",
  })
  metadata_hash!: string | null;

  @Column({
    type: "varchar",
    length: 20,
    default: "nanoid",
    comment: "Slug generation strategy used",
  })
  slug_strategy!: string;

  @Column({
    type: "integer",
    default: 7,
    comment: "Length of the generated slug",
  })
  slug_length!: number;

  @Column({
    type: "varchar",
    length: 50,
    nullable: true,
    comment: "Optional namespace for scoped slug generation",
  })
  namespace!: string | null;

  @Column({ type: "integer", default: 0 })
  click_count!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ type: "timestamp", nullable: true })
  last_clicked_at!: Date | null;

  @Column({
    type: "enum",
    enum: ["active", "inactive", "archived"],
    default: "active",
  })
  status!: "active" | "inactive" | "archived";

  @Column({
    type: "enum",
    enum: ["public_web", "dashboard", "api"],
    default: "public_web",
  })
  source!: "public_web" | "dashboard" | "api";
}
