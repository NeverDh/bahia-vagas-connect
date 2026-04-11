import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { MetaTagsService } from './meta-tags.service.js';
import { SaveMetaTagDto } from './dto/save-meta-tag.dto.js';

@ApiTags('SEO (Admin)')
@Controller('api/admin/meta-tags')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('access-token')
export class MetaTagsAdminController {
  constructor(private readonly metaTagsService: MetaTagsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as meta tags' })
  list() {
    return this.metaTagsService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar meta tag' })
  create(@Body() dto: SaveMetaTagDto) {
    return this.metaTagsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar meta tag' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SaveMetaTagDto,
  ) {
    return this.metaTagsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover meta tag' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.metaTagsService.delete(id);
  }
}
