import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LinkService } from "./link.service";
import { LinkController } from "./link.controller";
import { Link } from "./entities/link.entity";
import { SlugModule } from "../slug/slug.module";
import { DeduplicationModule } from "../deduplication/deduplication.module";

@Module({
  imports: [TypeOrmModule.forFeature([Link]), SlugModule, DeduplicationModule],
  controllers: [LinkController],
  providers: [LinkService],
  exports: [LinkService],
})
export class LinkModule {}
