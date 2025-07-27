import { Test, TestingModule } from "@nestjs/testing";
import { LinkService } from "./link.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { Link } from "./entities/link.entity";
import { Repository, UpdateResult } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { CreateLinkDto } from "./dto/create-link.dto";

describe("LinkService", () => {
  let service: LinkService;
  let linkRepository: jest.Mocked<Repository<Link>>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      increment: jest.fn(),
    };

    const mockConfig = {
      get: jest.fn().mockReturnValue("http://localhost:8000"),
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
      ],
    }).compile();

    service = module.get<LinkService>(LinkService);
    linkRepository = module.get(getRepositoryToken(Link));
    configService = module.get(ConfigService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("shorten", () => {
    it("should return a shortened URL response", async () => {
      const dto: CreateLinkDto = {
        url: "https://example.com",
        metadata: { source: "test" },
      };

      const mockSlug = "abc123";
      const mockEntity = {
        slug: mockSlug,
        url: dto.url,
        metadata: dto.metadata,
        click_count: 0,
      };
      const mockSavedEntity = {
        ...mockEntity,
        id: "1",
      };

      jest.spyOn<any, any>(service, "generateSlug").mockReturnValue(mockSlug);
      linkRepository.create.mockReturnValue(mockEntity as Link);
      linkRepository.save.mockResolvedValue(mockSavedEntity as Link);

      const result = await service.shorten(dto);

      expect(result).toEqual({
        short_url: `http://localhost:8000/v1/${mockSlug}`,
        slug: mockSlug,
        url: dto.url,
      });

      expect(linkRepository.create).toHaveBeenCalledWith(mockEntity);
      expect(linkRepository.save).toHaveBeenCalledWith(mockEntity);
      expect(configService.get).toHaveBeenCalledWith(
        "BASE_URL",
        "http://localhost:8000"
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
