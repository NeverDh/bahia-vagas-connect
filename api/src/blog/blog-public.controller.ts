import { Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BlogService } from './blog.service.js';

@ApiTags('Blog')
@Controller('api/blog')
export class BlogPublicController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperation({ summary: 'Listar posts publicados' })
  @ApiResponse({ status: 200 })
  listPublished() {
    return this.blogService.listPublished();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Post publicado por slug' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  getBySlug(@Param('slug') slug: string) {
    return this.blogService.getPublishedBySlug(slug);
  }

  @Post(':slug/view')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Incrementar contador de visualizações' })
  @ApiResponse({ status: 201 })
  async recordView(@Param('slug') slug: string) {
    await this.blogService.incrementViewsBySlug(slug);
    return { ok: true };
  }
}
