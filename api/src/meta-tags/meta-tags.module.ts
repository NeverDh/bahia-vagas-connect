import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { MetaTag } from '../entities/meta-tag.entity.js';
import { MetaTagsService } from './meta-tags.service.js';
import { MetaTagsPublicController } from './meta-tags-public.controller.js';
import { MetaTagsAdminController } from './meta-tags-admin.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([MetaTag]), AuthModule],
  controllers: [MetaTagsPublicController, MetaTagsAdminController],
  providers: [MetaTagsService],
  exports: [MetaTagsService],
})
export class MetaTagsModule {}
