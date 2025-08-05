import { Test, TestingModule } from "@nestjs/testing";
import { LinkController } from "./link.controller";
import { LinkService } from "./link.service";
import { ConfigService } from "@nestjs/config";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Link } from "./entities/link.entity";
import { SlugGenerationService } from "../slug/services/slug-generation.service";
import { DeduplicationService } from "../deduplication/services/deduplication.service";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";

// Mock nanoid and uuid
jest.mock("nanoid");
jest.mock("uuid");

describe("LinkController", () => {
  let controller: LinkController;

  beforeEach(async () => {
    const mockLinkRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      increment: jest.fn(),
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
      controllers: [LinkController],
      providers: [
        LinkService,
        {
          provide: getRepositoryToken(Link),
          useValue: mockLinkRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue("http://localhost:8000"),
          },
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

    controller = module.get<LinkController>(LinkController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
