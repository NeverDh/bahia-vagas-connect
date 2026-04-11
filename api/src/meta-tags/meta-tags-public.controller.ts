import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MetaTagsService } from './meta-tags.service.js';

@ApiTags('SEO')
@Controller('api/meta-tags')
export class MetaTagsPublicController {
  constructor(private readonly metaTagsService: MetaTagsService) {}

  @Get()
  @ApiOperation({ summary: 'Meta tags por page_path (público)' })
  @ApiResponse({ status: 200, description: 'Objeto ou null' })
  getByPath(@Query('path') path: string) {
    if (!path?.trim()) {
      throw new BadRequestException('Query `path` é obrigatória.');
    }
    return this.metaTagsService.findByPath(path.trim());
  }
}
