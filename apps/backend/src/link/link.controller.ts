import { Controller, Get, Post, Body, Param, Res } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Response } from "express";
import { LinkService } from "./link.service";
import { CreateLinkDto } from "./dto/create-link.dto";
import {
  ShortenResponseDto,
  UnshortenResponseDto,
} from "./dto/link-response.dto";
import { UnshortenRequestDto } from "./dto/link-request";

@ApiTags("URL Shortener")
@Controller()
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Post("shorten")
  @ApiOperation({ summary: "Create a shortened URL" })
  @ApiResponse({
    status: 201,
    description: "URL shortened successfully",
    type: ShortenResponseDto,
  })
  async shorten(
    @Body() createLinkDto: CreateLinkDto
  ): Promise<ShortenResponseDto> {
    return this.linkService.shorten(createLinkDto);
  }

  @Post("unshorten")
  @ApiOperation({ summary: "Resolve a slug to original URL with metadata" })
  @ApiResponse({
    status: 200,
    description: "URL resolved successfully",
    type: UnshortenResponseDto,
  })
  async unshorten(
    @Body() request: UnshortenRequestDto
  ): Promise<UnshortenResponseDto> {
    return this.linkService.unshorten(request.slug);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Redirect to original URL" })
  @ApiResponse({ status: 302, description: "Redirect to original URL" })
  @ApiResponse({ status: 404, description: "Short URL not found" })
  async redirect(
    @Param("slug") slug: string,
    @Res() res: Response
  ): Promise<void> {
    const url = await this.linkService.getRedirectUrl(slug);
    res.redirect(302, url);
  }
}
