import { Test, TestingModule } from "@nestjs/testing";
import { LinkService } from "./link.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { Link } from "./entities/link.entity";
import { Repository, UpdateResult } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { CreateLinkDto } from "./dto/create-link.dto";
import { SlugGenerationService } from "../slug/services/slug-generation.service";
import { DeduplicationService } from "../deduplication/services/deduplication.service";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";

// Mock nanoid and uuid
jest.mock("nanoid");
jest.mock("uuid");

describe("LinkService", () => {
  let service: LinkService;
  let linkRepository: jest.Mocked<Repository<Link>>;
  let configService: jest.Mocked<ConfigService>;
  let slugGenerationService: jest.Mocked<SlugGenerationService>;
  let deduplicationService: jest.Mocked<DeduplicationService>;

  beforeEach(async () => {
    const mockRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      increment: jest.fn(),
    };

    const mockConfig = {
      get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
        if (key === "DEFAULT_SLUG_LENGTH") return 7;
        if (key === "HOST") return "http://localhost:8000";
        return defaultValue;
      }),
    };

    const mockSlugGenerationService = {
      generateSlug: jest.fn().mockResolvedValue({
        slug: "abc123",
        wasCustomSlug: false,
        length: 7,
        strategy: "nanoid",
      }),
      trackSlugCreation: jest.fn().mockResolvedValue(undefined),
    };

    const mockDeduplicationService = {
      createDeduplicationHash: jest.fn().mockReturnValue("hash123"),
      createCanonicalDeduplicationHash: jest
        .fn()
        .mockReturnValue("canonical123"),
    };

    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinkService,
        {
          provide: getRepositoryToken(Link),
          useValue: mockRepo,
        },
        {
          provide: ConfigService,
          useValue: mockConfig,
        },
        {
          provide: SlugGenerationService,
          useValue: mockSlugGenerationService,
        },
        {
          provide: DeduplicationService,
          useValue: mockDeduplicationService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<LinkService>(LinkService);
    linkRepository = module.get(getRepositoryToken(Link));
    configService = module.get(ConfigService);
    slugGenerationService = module.get(SlugGenerationService);
    deduplicationService = module.get(DeduplicationService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("shorten", () => {
    it("should return a shortened URL response", async () => {
      const dto: CreateLinkDto = {
        url: "https://example.com",
        metadata: { source: "test" },
        deduplicate: false,
        enhancedCanonical: false,
      };

      const mockSlug = "abc123";
      const mockEntity = {
        slug: mockSlug,
        url: dto.url,
        metadata: dto.metadata,
        metadata_hash: "hash123",
        slug_strategy: "nanoid",
        slug_length: 7,
        namespace: null,
        click_count: 0,
      };
      const mockSavedEntity = {
        ...mockEntity,
        id: "1",
      };

      // Mock that no existing link exists for deduplication check
      linkRepository.createQueryBuilder = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });

      linkRepository.create.mockReturnValue(mockEntity as Link);
      linkRepository.save.mockResolvedValue(mockSavedEntity as Link);

      const result = await service.shorten(dto);

      expect(result).toEqual({
        short_url: `http://localhost:8000/${mockSlug}`,
        slug: mockSlug,
        url: dto.url,
        strategy: "nanoid",
        length: 7,
        wasDeduped: false,
        wasCustomSlug: false,
        namespace: undefined,
        spaceUsage: undefined,
      });

      expect(slugGenerationService.generateSlug).toHaveBeenCalledWith(
        expect.objectContaining({
          customSlug: undefined,
          slugStrategy: undefined,
          metadata: dto.metadata,
        }),
        expect.any(Function)
      );
      expect(linkRepository.create).toHaveBeenCalledWith(mockEntity);
      expect(linkRepository.save).toHaveBeenCalledWith(mockEntity);
    });

    it("should handle slug strategy parameter", async () => {
      const dto: CreateLinkDto = {
        url: "https://example.com",
        slugStrategy: "uuid",
        deduplicate: false,
        enhancedCanonical: false,
      };

      const mockSlug = "abc123";
      const mockEntity = {
        slug: mockSlug,
        url: dto.url,
        metadata: {},
        metadata_hash: "",
        slug_strategy: "uuid",
        slug_length: 7,
        namespace: null,
        click_count: 0,
      };
      const mockSavedEntity = {
        ...mockEntity,
        id: "1",
      };

      // Mock updated slug generation service response for UUID strategy
      slugGenerationService.generateSlug.mockResolvedValue({
        slug: "abc123",
        wasCustomSlug: false,
        length: 7,
        strategy: "uuid",
      });

      // Mock that no existing link exists for deduplication check
      linkRepository.createQueryBuilder = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });

      linkRepository.create.mockReturnValue(mockEntity as Link);
      linkRepository.save.mockResolvedValue(mockSavedEntity as Link);

      const result = await service.shorten(dto);

      expect(result).toEqual({
        short_url: `http://localhost:8000/${mockSlug}`,
        slug: mockSlug,
        url: dto.url,
        strategy: "uuid",
        length: 7,
        wasDeduped: false,
        wasCustomSlug: false,
        namespace: undefined,
        spaceUsage: undefined,
      });

      expect(slugGenerationService.generateSlug).toHaveBeenCalledWith(
        expect.objectContaining({
          slugStrategy: "uuid",
        }),
        expect.any(Function)
      );
    });
  });

  describe("unshorten", () => {
    it("should return the original URL if slug is found", async () => {
      const slug = "abc123";
      const mockLink = { url: "https://example.com" };

      linkRepository.findOne.mockResolvedValue(mockLink as Link);

      const result = await service.unshorten(slug);

      expect(result).toEqual({ url: mockLink.url });
      expect(linkRepository.findOne).toHaveBeenCalledWith({ where: { slug } });
    });

    it("should throw NotFoundException if slug is not found", async () => {
      const slug = "notfound";
      linkRepository.findOne.mockResolvedValue(null);

      await expect(service.unshorten(slug)).rejects.toThrow(NotFoundException);
    });
  });

  describe("getRedirectUrl", () => {
    it("should return the original URL and increment click count", async () => {
      const slug = "abc123";
      const mockLink = { url: "https://example.com" };

      linkRepository.findOne.mockResolvedValue(mockLink as Link);
      linkRepository.increment.mockResolvedValue({
        affected: 1,
      } as UpdateResult);

      const result = await service.getRedirectUrl(slug);

      expect(result).toEqual(mockLink.url);
      expect(linkRepository.increment).toHaveBeenCalledWith(
        { slug },
        "click_count",
        1
      );
    });

    it("should throw NotFoundException if slug is not found", async () => {
      const slug = "notfound";
      linkRepository.findOne.mockResolvedValue(null);

      await expect(service.getRedirectUrl(slug)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
