import { Injectable, NotFoundException, Inject } from "@nestjs/common";
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

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger
  ) {}

  async shorten(createLinkDto: CreateLinkDto): Promise<ShortenResponseDto> {
    this.logger.info("Creating new short URL", {
      url: createLinkDto.url,
      metadata: createLinkDto.metadata,
    });

    // TODO: Implement slug generation, URL validation, deduplication
    const slug = this.generateSlug();

    const link = this.linkRepository.create({
      slug,
      url: createLinkDto.url,
      metadata: createLinkDto.metadata || {},
      click_count: 0,
    });

    try {
      const savedLink = await this.linkRepository.save(link);

      this.logger.info("Short URL created successfully", {
        slug: savedLink.slug,
        url: savedLink.url,
        id: savedLink.id,
      });

      return {
        short_url: `${this.configService.get("BASE_URL", "http://localhost:8000")}/v1/${savedLink.slug}`,
        slug: savedLink.slug,
        url: savedLink.url,
      };
    } catch (error) {
      this.logger.error("Failed to create short URL", {
        url: createLinkDto.url,
        slug,
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

  private generateSlug(): string {
    // TODO: Implement proper slug generation with nanoid and collision detection
    return Math.random().toString(36).substring(2, 8);
  }
}
