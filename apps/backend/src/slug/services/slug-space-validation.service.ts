import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";
import { SlugSpaceUsage } from "../entities/slug-space-usage.entity";
import { SlugGenerationOptions } from "../strategies/slug-generation.interface";
import {
  resolveAlphabet,
  clampSlugLength,
} from "../constants/slug-generation.constants";
import { SpaceValidationResult, SpaceUsageStats } from "@url-shortener/types";

/**
 * Service for validating and tracking slug space exhaustion
 *
 * This service provides:
 * - Pre-validation of slug generation requests to prevent exhaustion
 * - Real-time tracking of slug space usage across configurations
 * - Early warning system for approaching space limits
 * - Recommendations for configuration adjustments
 * - Automated space recalculation and optimization
 */
@Injectable()
export class SlugSpaceValidationService {
  private readonly logger = new Logger(SlugSpaceValidationService.name);

  constructor(
    @InjectRepository(SlugSpaceUsage)
    private readonly spaceUsageRepository: Repository<SlugSpaceUsage>,
    private readonly configService: ConfigService
  ) {}

  /**
   * Validate if a slug generation request can proceed without exhausting space
   */
  async validateSlugGeneration(
    strategy: string,
    options: SlugGenerationOptions = {},
    namespace?: string
  ): Promise<SpaceValidationResult> {
    // Resolve configuration parameters
    const resolvedAlphabet = this.resolveAlphabet(options);
    const resolvedLength = this.resolveLength(options);
    const alphabetHash = this.createAlphabetHash(resolvedAlphabet);

    // Find existing space usage record
    let spaceUsage = await this.findSpaceUsage(
      strategy,
      alphabetHash,
      resolvedLength,
      namespace
    );

    // Create or update space usage tracking
    if (!spaceUsage) {
      spaceUsage = await this.createSpaceUsage(
        strategy,
        resolvedAlphabet,
        alphabetHash,
        resolvedLength,
        namespace
      );
    } else {
      // Update usage count if stale
      await this.updateSpaceUsageIfStale(spaceUsage);
    }

    // Generate validation result
    return this.generateValidationResult(
      spaceUsage,
      strategy,
      resolvedAlphabet,
      alphabetHash,
      resolvedLength,
      namespace
    );
  }

  /**
   * Track the creation of a new slug in the space
   */
  async trackSlugCreation(
    strategy: string,
    options: SlugGenerationOptions = {},
    namespace?: string | null
  ): Promise<void> {
    const resolvedAlphabet = this.resolveAlphabet(options);
    const resolvedLength = this.resolveLength(options);
    const alphabetHash = this.createAlphabetHash(resolvedAlphabet);

    try {
      await this.incrementSpaceUsage(
        strategy,
        alphabetHash,
        resolvedLength,
        namespace || undefined
      );
    } catch (error) {
      this.logger.error("Failed to track slug creation", {
        strategy,
        alphabetHash,
        length: resolvedLength,
        namespace,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get comprehensive space usage statistics
   */
  async getSpaceUsageStats(strategy?: string): Promise<SpaceUsageStats[]> {
    const queryBuilder = this.spaceUsageRepository.createQueryBuilder("space");

    if (strategy) {
      queryBuilder.where("space.strategy = :strategy", { strategy });
    }

    const spaceUsages = await queryBuilder.getMany();

    // Group by strategy for aggregation
    const groupedStats = new Map<
      string,
      {
        totalConfigurations: number;
        usagePercentages: number[];
        warningCount: number;
        criticalCount: number;
        exhaustedCount: number;
      }
    >();

    for (const space of spaceUsages) {
      const key = space.strategy;

      if (!groupedStats.has(key)) {
        groupedStats.set(key, {
          totalConfigurations: 0,
          usagePercentages: [],
          warningCount: 0,
          criticalCount: 0,
          exhaustedCount: 0,
        });
      }

      const stats = groupedStats.get(key)!;
      stats.totalConfigurations++;
      stats.usagePercentages.push(Number(space.usage_percentage));

      if (space.is_warning) stats.warningCount++;
      if (space.is_critical) stats.criticalCount++;
      if (space.is_exhausted) stats.exhaustedCount++;
    }

    // Convert to result format
    return Array.from(groupedStats.entries()).map(([strategyName, stats]) => {
      const averageUsage =
        stats.usagePercentages.length > 0
          ? stats.usagePercentages.reduce((sum, val) => sum + val, 0) /
            stats.usagePercentages.length
          : 0;

      const maxUsage =
        stats.usagePercentages.length > 0
          ? Math.max(...stats.usagePercentages)
          : 0;

      return {
        strategy: strategyName,
        alphabetHash: "", // Not meaningful in aggregated stats
        length: 0, // Not meaningful in aggregated stats
        totalConfigurations: stats.totalConfigurations,
        averageUsage,
        maxUsage,
        warningCount: stats.warningCount,
        criticalCount: stats.criticalCount,
        exhaustedCount: stats.exhaustedCount,
      };
    });
  }

  /**
   * Recalculate space usage for all configurations
   */
  async recalculateAllSpaceUsage(): Promise<void> {
    this.logger.log("Starting recalculation of all space usage");

    const spaceUsages = await this.spaceUsageRepository.find();
    let processed = 0;
    let errors = 0;

    for (const spaceUsage of spaceUsages) {
      try {
        await this.recalculateSpaceUsage(spaceUsage);
        processed++;
      } catch (error) {
        this.logger.error("Failed to recalculate space usage", {
          spaceId: spaceUsage.id,
          strategy: spaceUsage.strategy,
          error: error instanceof Error ? error.message : String(error),
        });
        errors++;
      }
    }

    this.logger.log("Completed space usage recalculation", {
      totalSpaces: spaceUsages.length,
      processed,
      errors,
    });
  }

  /**
   * Get spaces that need attention (warning, critical, or exhausted)
   */
  async getSpacesNeedingAttention(): Promise<SlugSpaceUsage[]> {
    return this.spaceUsageRepository.find({
      where: [
        { is_warning: true },
        { is_critical: true },
        { is_exhausted: true },
      ],
      order: { usage_percentage: "DESC" },
    });
  }

  /**
   * Clean up old or unused space usage records
   */
  async cleanupSpaceUsage(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.spaceUsageRepository
      .createQueryBuilder()
      .delete()
      .where("usage_count = 0 AND created_at < :cutoffDate", { cutoffDate })
      .execute();

    this.logger.log("Cleaned up unused space usage records", {
      deletedCount: result.affected || 0,
      cutoffDate,
    });

    return result.affected || 0;
  }

  /**
   * Find existing space usage record
   */
  private async findSpaceUsage(
    strategy: string,
    alphabetHash: string,
    length: number,
    namespace?: string
  ): Promise<SlugSpaceUsage | null> {
    const queryBuilder = this.spaceUsageRepository
      .createQueryBuilder("space")
      .where("space.strategy = :strategy", { strategy })
      .andWhere("space.alphabet_hash = :alphabetHash", { alphabetHash })
      .andWhere("space.length = :length", { length });

    if (namespace) {
      queryBuilder.andWhere("space.namespace = :namespace", { namespace });
    } else {
      queryBuilder.andWhere("space.namespace IS NULL");
    }

    return queryBuilder.getOne();
  }

  /**
   * Create new space usage tracking record
   */
  private async createSpaceUsage(
    strategy: string,
    alphabet: string,
    alphabetHash: string,
    length: number,
    namespace?: string
  ): Promise<SlugSpaceUsage> {
    const totalSpace = this.calculateTotalSpace(alphabet, length);
    const currentUsage = await this.countCurrentUsage(
      strategy,
      alphabetHash,
      length,
      namespace
    );

    const spaceUsage = this.spaceUsageRepository.create({
      strategy,
      alphabet,
      alphabet_hash: alphabetHash,
      length,
      namespace,
      usage_count: currentUsage,
      total_space: totalSpace,
      usage_percentage: totalSpace > 0 ? currentUsage / totalSpace : 0,
      warning_threshold: this.getWarningThreshold(),
      critical_threshold: this.getCriticalThreshold(),
      last_calculated_at: new Date(),
    });

    this.updateSpaceStatus(spaceUsage);

    return this.spaceUsageRepository.save(spaceUsage);
  }

  /**
   * Update space usage if data is stale
   */
  private async updateSpaceUsageIfStale(
    spaceUsage: SlugSpaceUsage
  ): Promise<void> {
    const staleThreshold = this.configService.get<number>(
      "SPACE_USAGE_STALE_MINUTES",
      15
    );
    const staleTime = new Date();
    staleTime.setMinutes(staleTime.getMinutes() - staleThreshold);

    if (
      !spaceUsage.last_calculated_at ||
      spaceUsage.last_calculated_at < staleTime
    ) {
      await this.recalculateSpaceUsage(spaceUsage);
    }
  }

  /**
   * Recalculate space usage for a specific configuration
   */
  private async recalculateSpaceUsage(
    spaceUsage: SlugSpaceUsage
  ): Promise<void> {
    const currentUsage = await this.countCurrentUsage(
      spaceUsage.strategy,
      spaceUsage.alphabet_hash,
      spaceUsage.length,
      spaceUsage.namespace || undefined
    );

    const oldUsagePercentage = Number(spaceUsage.usage_percentage);
    spaceUsage.usage_count = currentUsage;
    spaceUsage.usage_percentage =
      spaceUsage.total_space > 0 ? currentUsage / spaceUsage.total_space : 0;
    spaceUsage.last_calculated_at = new Date();

    this.updateSpaceStatus(spaceUsage);

    await this.spaceUsageRepository.save(spaceUsage);

    // Log significant changes
    const newUsagePercentage = Number(spaceUsage.usage_percentage);
    if (Math.abs(newUsagePercentage - oldUsagePercentage) > 0.01) {
      // 1% change
      this.logger.log("Space usage updated", {
        strategy: spaceUsage.strategy,
        alphabetHash: spaceUsage.alphabet_hash,
        length: spaceUsage.length,
        namespace: spaceUsage.namespace,
        oldUsage: oldUsagePercentage,
        newUsage: newUsagePercentage,
        totalSpace: spaceUsage.total_space,
        usedSpace: currentUsage,
      });
    }
  }

  /**
   * Increment space usage count
   */
  private async incrementSpaceUsage(
    strategy: string,
    alphabetHash: string,
    length: number,
    namespace?: string
  ): Promise<void> {
    const queryBuilder = this.spaceUsageRepository
      .createQueryBuilder()
      .update(SlugSpaceUsage)
      .set({
        usage_count: () => "usage_count + 1",
        usage_percentage: () =>
          "CASE WHEN total_space > 0 THEN (usage_count + 1)::decimal / total_space ELSE 0 END",
        updated_at: new Date(),
      })
      .where("strategy = :strategy", { strategy })
      .andWhere("alphabet_hash = :alphabetHash", { alphabetHash })
      .andWhere("length = :length", { length });

    if (namespace) {
      queryBuilder.andWhere("namespace = :namespace", { namespace });
    } else {
      queryBuilder.andWhere("namespace IS NULL");
    }

    await queryBuilder.execute();

    // Update status flags if needed
    const spaceUsage = await this.findSpaceUsage(
      strategy,
      alphabetHash,
      length,
      namespace || undefined
    );
    if (spaceUsage) {
      const needsStatusUpdate = this.updateSpaceStatus(spaceUsage);
      if (needsStatusUpdate) {
        await this.spaceUsageRepository.save(spaceUsage);
      }
    }
  }

  /**
   * Count current usage for a space configuration
   */
  private async countCurrentUsage(
    strategy: string,
    alphabetHash: string,
    length: number,
    namespace?: string
  ): Promise<number> {
    // Query the existing SlugSpaceUsage record to get the current usage count
    const spaceUsage = await this.findSpaceUsage(
      strategy,
      alphabetHash,
      length,
      namespace
    );

    if (spaceUsage) {
      return spaceUsage.usage_count;
    }

    // If no existing record, start with 0
    return 0;
  }

  /**
   * Calculate total theoretical space for alphabet and length
   */
  private calculateTotalSpace(alphabet: string, length: number): number {
    if (alphabet.length === 0 || length <= 0) {
      return 0;
    }

    // For very large spaces, we need to handle potential overflow
    const alphabetSize = alphabet.length;
    let totalSpace = 1;

    for (let i = 0; i < length; i++) {
      // Check for potential overflow
      if (totalSpace > Number.MAX_SAFE_INTEGER / alphabetSize) {
        return Number.MAX_SAFE_INTEGER;
      }
      totalSpace *= alphabetSize;
    }

    return totalSpace;
  }

  /**
   * Update space status flags based on current usage
   */
  private updateSpaceStatus(spaceUsage: SlugSpaceUsage): boolean {
    const currentUsage = Number(spaceUsage.usage_percentage);
    const warningThreshold = Number(spaceUsage.warning_threshold);
    const criticalThreshold = Number(spaceUsage.critical_threshold);

    let changed = false;
    const now = new Date();

    // Update warning status
    const shouldWarn = currentUsage >= warningThreshold;
    if (shouldWarn && !spaceUsage.is_warning) {
      spaceUsage.is_warning = true;
      spaceUsage.warning_reached_at = now;
      changed = true;
    } else if (!shouldWarn && spaceUsage.is_warning) {
      spaceUsage.is_warning = false;
      spaceUsage.warning_reached_at = null;
      changed = true;
    }

    // Update critical status
    const shouldBeCritical = currentUsage >= criticalThreshold;
    if (shouldBeCritical && !spaceUsage.is_critical) {
      spaceUsage.is_critical = true;
      spaceUsage.critical_reached_at = now;
      changed = true;
    } else if (!shouldBeCritical && spaceUsage.is_critical) {
      spaceUsage.is_critical = false;
      spaceUsage.critical_reached_at = null;
      changed = true;
    }

    // Update exhausted status (when we're at or above critical threshold)
    const shouldBeExhausted = currentUsage >= criticalThreshold;
    if (shouldBeExhausted && !spaceUsage.is_exhausted) {
      spaceUsage.is_exhausted = true;
      spaceUsage.exhausted_at = now;
      changed = true;
    } else if (!shouldBeExhausted && spaceUsage.is_exhausted) {
      spaceUsage.is_exhausted = false;
      spaceUsage.exhausted_at = null;
      changed = true;
    }

    return changed;
  }

  /**
   * Generate comprehensive validation result
   */
  private generateValidationResult(
    spaceUsage: SlugSpaceUsage,
    strategy: string,
    alphabet: string,
    _alphabetHash: string,
    length: number,
    _namespace?: string
  ): SpaceValidationResult {
    const usagePercentage = Number(spaceUsage.usage_percentage);
    const remainingSpace = spaceUsage.getRemainingSpace();
    const canGenerate = !spaceUsage.shouldPreventGeneration();

    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Generate warnings
    if (spaceUsage.is_exhausted) {
      warnings.push(
        `Slug space is exhausted (${(usagePercentage * 100).toFixed(2)}% used)`
      );
    } else if (spaceUsage.is_critical) {
      warnings.push(
        `Slug space is critically full (${(usagePercentage * 100).toFixed(2)}% used)`
      );
    } else if (spaceUsage.is_warning) {
      warnings.push(
        `Slug space is approaching capacity (${(usagePercentage * 100).toFixed(2)}% used)`
      );
    }

    // Generate recommendations
    if (spaceUsage.is_critical || spaceUsage.is_exhausted) {
      recommendations.push(
        "Consider increasing slug length or using a larger alphabet"
      );
      recommendations.push(
        "Consider using namespaces to partition the slug space"
      );
      if (length < 12) {
        recommendations.push(
          `Increase length from ${length} to ${length + 1} for ${alphabet.length}x more space`
        );
      }
    } else if (spaceUsage.is_warning) {
      recommendations.push(
        "Monitor usage closely and prepare space expansion plan"
      );
    }

    return {
      isValid: true,
      canGenerate,
      spaceInfo: {
        strategy,
        alphabet,
        alphabetHash: _alphabetHash,
        length,
        namespace: _namespace,
        totalSpace: spaceUsage.total_space,
        usedSpace: spaceUsage.usage_count,
        remainingSpace,
        usagePercentage,
        status:
          spaceUsage.getRecommendedAction() === "continue"
            ? "safe"
            : (spaceUsage.getRecommendedAction() as
                | "safe"
                | "warning"
                | "critical"
                | "exhausted"),
      },
      warnings,
      recommendations,
    };
  }

  /**
   * Resolve alphabet from options
   */
  private resolveAlphabet(options: SlugGenerationOptions): string {
    return resolveAlphabet(options.alphabet, options.alphabetType);
  }

  /**
   * Resolve length from options
   */
  private resolveLength(options: SlugGenerationOptions): number {
    const defaultLength = this.configService.get<number>(
      "DEFAULT_SLUG_LENGTH",
      7
    );
    return clampSlugLength(options.length || defaultLength);
  }

  /**
   * Create deterministic hash of alphabet
   */
  private createAlphabetHash(alphabet: string): string {
    return createHash("sha256").update(alphabet).digest("hex");
  }

  /**
   * Get warning threshold from configuration
   */
  private getWarningThreshold(): number {
    return this.configService.get<number>("SLUG_SPACE_WARNING_THRESHOLD", 0.75);
  }

  /**
   * Get critical threshold from configuration
   */
  private getCriticalThreshold(): number {
    return this.configService.get<number>("SLUG_SPACE_CRITICAL_THRESHOLD", 0.9);
  }
}
