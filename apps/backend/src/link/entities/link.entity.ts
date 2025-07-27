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
export class Link {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 20, unique: true })
  slug!: string;

  @Column({ type: "text" })
  url!: string;

  @Column({ type: "jsonb", default: {} })
  metadata!: LinkMetadata;

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
