import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("slug_space_usage")
@Index(
  "idx_strategy_alphabet_length",
  ["strategy", "alphabet_hash", "length"],
  { unique: true }
)
@Index(
  "idx_strategy_alphabet_length_namespace",
  ["strategy", "alphabet_hash", "length", "namespace"],
  { unique: true }
)
@Index("idx_namespace", ["namespace"])
@Index("idx_usage_count", ["usage_count"])
export class SlugSpaceUsage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "varchar",
    length: 20,
    comment: "Slug generation strategy (nanoid, uuid, etc.)",
  })
  strategy!: string;

  @Column({
    type: "varchar",
    length: 64,
    comment: "SHA-256 hash of the alphabet for space uniqueness",
  })
  alphabet_hash!: string;

  @Column({
    type: "text",
    comment: "Full alphabet string used for generation",
  })
  alphabet!: string;

  @Column({
    type: "integer",
    comment: "Slug length for this space configuration",
  })
  length!: number;

  @Column({
    type: "varchar",
    length: 50,
    nullable: true,
    comment: "Optional namespace for scoped slug generation",
  })
  namespace!: string | null;

  @Column({
    type: "bigint",
    default: 0,
    comment: "Current number of slugs used in this space",
  })
  usage_count!: number;

  @Column({
    type: "bigint",
    comment: "Total theoretical space size (alphabet_size ^ length)",
  })
  total_space!: number;

  @Column({
    type: "decimal",
    precision: 5,
    scale: 4,
    default: 0.0,
    comment: "Current usage percentage (usage_count / total_space)",
  })
  usage_percentage!: number;

  @Column({
    type: "decimal",
    precision: 5,
    scale: 4,
    default: 0.75,
    comment: "Warning threshold (0.75 = 75%)",
  })
  warning_threshold!: number;

  @Column({
    type: "decimal",
    precision: 5,
    scale: 4,
    default: 0.9,
    comment: "Critical threshold (0.90 = 90%)",
  })
  critical_threshold!: number;

  @Column({
    type: "boolean",
    default: false,
    comment: "Whether this space has reached warning threshold",
  })
  is_warning!: boolean;

  @Column({
    type: "boolean",
    default: false,
    comment: "Whether this space has reached critical threshold",
  })
  is_critical!: boolean;

  @Column({
    type: "boolean",
    default: false,
    comment: "Whether this space is considered exhausted",
  })
  is_exhausted!: boolean;

  @Column({
    type: "timestamp",
    nullable: true,
    comment: "When warning threshold was first reached",
  })
  warning_reached_at!: Date | null;

  @Column({
    type: "timestamp",
    nullable: true,
    comment: "When critical threshold was first reached",
  })
  critical_reached_at!: Date | null;

  @Column({
    type: "timestamp",
    nullable: true,
    comment: "When space was marked as exhausted",
  })
  exhausted_at!: Date | null;

  @Column({
    type: "timestamp",
    nullable: true,
    comment: "Last time usage statistics were recalculated",
  })
  last_calculated_at!: Date | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  /**
   * Calculate if the space is approaching exhaustion
   */
  isApproachingExhaustion(): boolean {
    return this.usage_percentage >= this.warning_threshold;
  }

  /**
   * Calculate if the space is critically full
   */
  isCriticallyFull(): boolean {
    return this.usage_percentage >= this.critical_threshold;
  }

  /**
   * Get remaining space in this configuration
   */
  getRemainingSpace(): number {
    return this.total_space - this.usage_count;
  }

  /**
   * Get space utilization as a percentage (0-100)
   */
  getUtilizationPercentage(): number {
    return Number(this.usage_percentage) * 100;
  }

  /**
   * Create a unique key for this space configuration
   */
  getSpaceKey(): string {
    const parts = [this.strategy, this.alphabet_hash, this.length.toString()];
    if (this.namespace) {
      parts.push(this.namespace);
    }
    return parts.join(":");
  }

  /**
   * Check if this space should prevent new slug generation
   */
  shouldPreventGeneration(): boolean {
    return (
      this.is_exhausted || this.usage_percentage >= this.critical_threshold
    );
  }

  /**
   * Get recommended action based on current usage
   */
  getRecommendedAction(): "continue" | "warning" | "critical" | "exhausted" {
    if (this.is_exhausted) return "exhausted";
    if (this.isCriticallyFull()) return "critical";
    if (this.isApproachingExhaustion()) return "warning";
    return "continue";
  }
}
