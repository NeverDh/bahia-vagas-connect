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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { BlogService } from './blog.service.js';
import { CreateBlogPostDto } from './dto/create-blog-post.dto.js';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto.js';

@ApiTags('Blog (Admin)')
@Controller('api/admin/blog')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('access-token')
export class BlogAdminController {
  constructor(private readonly blogService: BlogService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Listar todos os posts (admin)' })
  listPosts() {
    return this.blogService.listAllAdmin();
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Detalhe do post para edição' })
  getPost(@Param('id', ParseUUIDPipe) id: string) {
    return this.blogService.findByIdAdmin(id);
  }

  @Post('posts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar post' })
  createPost(@Body() dto: CreateBlogPostDto) {
    return this.blogService.createAdmin(dto);
  }

  @Patch('posts/:id')
  @ApiOperation({ summary: 'Atualizar post' })
  updatePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBlogPostDto,
  ) {
    return this.blogService.updateAdmin(id, dto);
  }

  @Delete('posts/:id')
  @ApiOperation({ summary: 'Excluir post' })
  deletePost(@Param('id', ParseUUIDPipe) id: string) {
    return this.blogService.deleteAdmin(id);
  }

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({ summary: 'Upload de imagem para o bucket blog-images' })
  uploadImage(@UploadedFile() file: Express.Multer.File | undefined) {
    return this.blogService.uploadBlogImage(file);
  }
}
