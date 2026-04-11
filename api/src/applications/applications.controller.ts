import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
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
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { JwtValidatedUser } from '../auth/strategies/jwt.strategy.js';
import { ApplicationsService } from './applications.service.js';

@ApiTags('Applications')
@Controller('api/applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(
    FileInterceptor('resume', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Enviar candidatura (currículo + dados)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['job_id', 'resume'],
      properties: {
        job_id: { type: 'string', format: 'uuid' },
        cover_letter: { type: 'string', maxLength: 1000 },
        resume: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 409 })
  async submit(
    @Req() req: Request & { user: JwtValidatedUser },
    @UploadedFile() resume: Express.Multer.File | undefined,
    @Body('job_id') jobId: string,
    @Body('cover_letter') coverLetter?: string,
  ) {
    if (!jobId?.trim()) {
      throw new BadRequestException('job_id é obrigatório.');
    }
    return this.applicationsService.submitWithResume(
      req.user.userId,
      jobId.trim(),
      coverLetter,
      resume,
    );
  }
}
