import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
    private readonly configService: ConfigService
  ) {}

  async shorten(createLinkDto: CreateLinkDto): Promise<ShortenResponseDto> {
    // TODO: Implement slug generation, URL validation, deduplication
    const slug = this.generateSlug();

    const link = this.linkRepository.create({
      slug,
      url: createLinkDto.url,
      metadata: createLinkDto.metadata || {},
      click_count: 0,
    });

    const savedLink = await this.linkRepository.save(link);

    return {
      short_url: `${this.configService.get("BASE_URL", "http://localhost:8000")}/${savedLink.slug}`,
      slug: savedLink.slug,
      url: savedLink.url,
    };
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
    const link = await this.linkRepository.findOne({ where: { slug } });

    if (!link) {
      throw new NotFoundException("Short URL not found");
    }

    // TODO: Implement click tracking
    await this.linkRepository.increment({ slug }, "click_count", 1);

    return link.url;
  }

  private generateSlug(): string {
    // TODO: Implement proper slug generation with nanoid and collision detection
    return Math.random().toString(36).substring(2, 8);
  }
}
