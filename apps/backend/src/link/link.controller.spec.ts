import { Test, TestingModule } from "@nestjs/testing";
import { LinkController } from "./link.controller";
import { LinkService } from "./link.service";
import { ConfigService } from "@nestjs/config";

const mockLinkRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
};

describe("LinkController", () => {
  let controller: LinkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinkController],
      providers: [
        LinkService,
        {
          provide: "LinkRepository", // or LinkRepository if it's a class
          useValue: mockLinkRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(), // add mock implementations if needed
          },
        },
      ],
    }).compile();

    controller = module.get<LinkController>(LinkController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
