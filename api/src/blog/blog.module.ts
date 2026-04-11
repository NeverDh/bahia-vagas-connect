import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { BlogPost } from '../entities/blog-post.entity.js';
import { BlogService } from './blog.service.js';
import { BlogPublicController } from './blog-public.controller.js';
import { BlogAdminController } from './blog-admin.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost]), AuthModule],
  controllers: [BlogPublicController, BlogAdminController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
