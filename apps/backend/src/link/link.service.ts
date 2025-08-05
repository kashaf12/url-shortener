import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { CreateLinkDto } from "./dto/create-link.dto";
import {
  ShortenResponseDto,
  UnshortenResponseDto,
} from "./dto/link-response.dto";
import { Link } from "./entities/link.entity";
import { ConfigService } from "@nestjs/config";
import {
  SlugGenerationService,
  SlugGenerationRequest,
} from "../slug/services/slug-generation.service";
import { DeduplicationService } from "../deduplication/services/deduplication.service";

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
    private readonly configService: ConfigService,
    private readonly slugGenerationService: SlugGenerationService,
    private readonly deduplicationService: DeduplicationService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger
  ) {}

  async shorten(createLinkDto: CreateLinkDto): Promise<ShortenResponseDto> {
    this.logger.info("Creating new short URL", {
      url: createLinkDto.url,
      metadata: createLinkDto.metadata,
      slugStrategy: createLinkDto.slugStrategy,
      customSlug: createLinkDto.customSlug,
      namespace: createLinkDto.namespace,
    });

    try {
      // Check for deduplication first if enabled
      if (createLinkDto.deduplicate) {
        const existingLink = await this.findExistingLink(createLinkDto);
        if (existingLink) {
          this.logger.info("Returning existing slug due to deduplication", {
            slug: existingLink.slug,
            url: existingLink.url,
          });

          return this.buildShortenResponse(existingLink, true);
        }
      }

      // Generate slug using SlugGenerationService
      const slugResult = await this.slugGenerationService.generateSlug(
        this.createSlugGenerationRequest(createLinkDto),
        (slug: string, namespace?: string) =>
          this.checkSlugCollision(slug, namespace)
      );

      // Create and save the link
      const link = this.linkRepository.create({
        slug: slugResult.slug,
        url: createLinkDto.url,
        metadata: createLinkDto.metadata || {},
        metadata_hash: this.createMetadataHash(createLinkDto),
        slug_strategy:
          slugResult.strategy ||
          createLinkDto.slugStrategy ||
          this.configService.get("SLUG_GENERATION_STRATEGY", "nanoid"),
        slug_length: slugResult.length,
        namespace: createLinkDto.namespace || null,
        click_count: 0,
      });

      const savedLink = await this.linkRepository.save(link);

      // Track slug space usage if not a custom slug
      if (!slugResult.wasCustomSlug && slugResult.spaceValidation) {
        await this.slugGenerationService.trackSlugCreation(
          savedLink.slug_strategy,
          {
            length: createLinkDto.length,
            alphabet: createLinkDto.alphabet,
            alphabetType: createLinkDto.alphabetType,
            pattern: createLinkDto.pattern
              ? new RegExp(createLinkDto.pattern)
              : undefined,
            patternType: createLinkDto.patternType,
            metadata: createLinkDto.metadata,
            deduplicate: createLinkDto.deduplicate,
            deduplicationFields: createLinkDto.deduplicationFields,
          },
          savedLink.namespace || undefined
        );
      }

      this.logger.info("Short URL created successfully", {
        slug: savedLink.slug,
        url: savedLink.url,
        id: savedLink.id,
        strategy: savedLink.slug_strategy,
        wasCustomSlug: slugResult.wasCustomSlug,
      });

      return this.buildShortenResponse(savedLink, false, slugResult);
    } catch (error) {
      this.logger.error("Failed to create short URL", {
        url: createLinkDto.url,
        customSlug: createLinkDto.customSlug,
        slugStrategy: createLinkDto.slugStrategy,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async unshorten(slug: string): Promise<UnshortenResponseDto> {
    const link = await this.linkRepository.findOne({ where: { slug } });

    if (!link) {
      throw new NotFoundException("Short URL not found");
    }

    return {
      url: link.url,
    };
  }

  async getRedirectUrl(slug: string): Promise<string> {
    this.logger.debug("Looking up redirect URL", { slug });

    const link = await this.linkRepository.findOne({ where: { slug } });

    if (!link) {
      this.logger.warn("Short URL not found for redirect", { slug });
      throw new NotFoundException("Short URL not found");
    }

    try {
      // TODO: Implement click tracking
      await this.linkRepository.increment({ slug }, "click_count", 1);

      this.logger.info("Redirect executed successfully", {
        slug,
        url: link.url,
        newClickCount: link.click_count + 1,
      });

      return link.url;
    } catch (error) {
      this.logger.error("Failed to track click during redirect", {
        slug,
        url: link.url,
        error: error instanceof Error ? error.message : String(error),
      });

      // Still return the URL even if click tracking fails
      return link.url;
    }
  }

  /**
   * Find existing link for deduplication
   */
  private async findExistingLink(
    createLinkDto: CreateLinkDto
  ): Promise<Link | null> {
    const metadataHash = this.createMetadataHash(createLinkDto);

    const queryBuilder = this.linkRepository
      .createQueryBuilder("link")
      .where("link.url = :url", { url: createLinkDto.url })
      .andWhere("link.metadata_hash = :metadataHash", { metadataHash });

    if (createLinkDto.namespace) {
      queryBuilder.andWhere("link.namespace = :namespace", {
        namespace: createLinkDto.namespace,
      });
    } else {
      queryBuilder.andWhere("link.namespace IS NULL");
    }

    return queryBuilder.getOne();
  }

  /**
   * Create metadata hash for deduplication
   */
  private createMetadataHash(createLinkDto: CreateLinkDto): string {
    if (
      !createLinkDto.metadata ||
      Object.keys(createLinkDto.metadata).length === 0
    ) {
      return "";
    }

    if (createLinkDto.enhancedCanonical) {
      return this.deduplicationService.createCanonicalDeduplicationHash(
        createLinkDto.url,
        createLinkDto.metadata,
        createLinkDto.deduplicationFields
      );
    }

    return this.deduplicationService.createDeduplicationHash(
      createLinkDto.url,
      createLinkDto.metadata,
      createLinkDto.deduplicationFields
    );
  }

  /**
   * Create SlugGenerationRequest from CreateLinkDto
   */
  private createSlugGenerationRequest(
    createLinkDto: CreateLinkDto
  ): SlugGenerationRequest {
    return {
      customSlug: createLinkDto.customSlug,
      slugStrategy: createLinkDto.slugStrategy,
      length: createLinkDto.length,
      alphabet: createLinkDto.alphabet,
      alphabetType: createLinkDto.alphabetType,
      pattern: createLinkDto.pattern,
      patternType: createLinkDto.patternType,
      namespace: createLinkDto.namespace,
      metadata: createLinkDto.metadata,
      deduplicate: createLinkDto.deduplicate,
      deduplicationFields: createLinkDto.deduplicationFields,
      enhancedCanonical: createLinkDto.enhancedCanonical,
    };
  }

  /**
   * Check if a slug already exists (collision detection)
   */
  private async checkSlugCollision(
    slug: string,
    namespace?: string
  ): Promise<boolean> {
    const queryBuilder = this.linkRepository
      .createQueryBuilder("link")
      .where("link.slug = :slug", { slug });

    if (namespace) {
      queryBuilder.andWhere("link.namespace = :namespace", { namespace });
    } else {
      queryBuilder.andWhere("link.namespace IS NULL");
    }

    const existingLink = await queryBuilder.getOne();
    return !!existingLink; // Return true if collision exists
  }

  /**
   * Build ShortenResponseDto from Link entity
   */
  private buildShortenResponse(
    link: Link,
    wasDeduped: boolean,
    slugResult?: import("../slug/services/slug-generation.service").SlugGenerationResult
  ): ShortenResponseDto {
    return {
      short_url: `${this.configService.get("HOST", "http://localhost:8000")}/${link.slug}`,
      slug: link.slug,
      url: link.url,
      strategy: link.slug_strategy,
      length: link.slug_length,
      wasDeduped,
      wasCustomSlug: slugResult?.wasCustomSlug || false,
      namespace: link.namespace || undefined,
      spaceUsage: slugResult?.spaceValidation
        ? {
            usagePercentage:
              slugResult.spaceValidation.spaceInfo.usagePercentage,
            status: slugResult.spaceValidation.spaceInfo.status,
            remainingSpace: slugResult.spaceValidation.spaceInfo.remainingSpace,
          }
        : undefined,
    };
  }
}
