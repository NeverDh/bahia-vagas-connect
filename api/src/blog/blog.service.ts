import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryFailedError } from 'typeorm';
import { SupabaseService } from '../config/supabase.service.js';
import { BlogPost } from '../entities/blog-post.entity.js';
import type { CreateBlogPostDto } from './dto/create-blog-post.dto.js';
import type { UpdateBlogPostDto } from './dto/update-blog-post.dto.js';

const BLOG_IMAGE_BUCKET = 'blog-images';
const IMAGE_MIMES = new Set([
  'image/webp',
  'image/jpeg',
  'image/png',
  'image/gif',
]);

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectRepository(BlogPost)
    private readonly blogRepo: Repository<BlogPost>,
    private readonly supabaseService: SupabaseService,
  ) {}

  async listPublished(): Promise<Record<string, unknown>[]> {
    const rows = await this.blogRepo.find({
      where: { status: 'published' },
      order: { published_at: 'DESC', created_at: 'DESC' },
    });
    return rows.map((p) => this.toListItem(p));
  }

  async getPublishedBySlug(slug: string): Promise<Record<string, unknown>> {
    const post = await this.blogRepo.findOne({
      where: { slug, status: 'published' },
    });
    if (!post) {
      throw new NotFoundException('Artigo não encontrado.');
    }
    return this.toPublicDetail(post);
  }

  async incrementViews(id: string): Promise<void> {
    await this.blogRepo.increment({ id }, 'views', 1);
  }

  /** Incrementa views do post publicado com o slug (no-op se não existir). */
  async incrementViewsBySlug(slug: string): Promise<void> {
    await this.blogRepo.increment(
      { slug, status: 'published' },
      'views',
      1,
    );
  }

  async listAllAdmin(): Promise<Record<string, unknown>[]> {
    const rows = await this.blogRepo.find({
      order: { created_at: 'DESC' },
    });
    return rows.map((p) => this.toAdminRow(p));
  }

  async findByIdAdmin(id: string): Promise<Record<string, unknown>> {
    const post = await this.blogRepo.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Artigo não encontrado.');
    }
    return this.toFormShape(post);
  }

  async createAdmin(dto: CreateBlogPostDto): Promise<Record<string, unknown>> {
    const entity = this.blogRepo.create(this.normalizeCreate(dto));
    try {
      const saved = await this.blogRepo.save(entity);
      return this.toFormShape(saved);
    } catch (e) {
      this.rethrowUniqueSlug(e);
      throw e;
    }
  }

  async updateAdmin(
    id: string,
    dto: UpdateBlogPostDto,
  ): Promise<Record<string, unknown>> {
    const existing = await this.blogRepo.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Artigo não encontrado.');
    }
    const patch = this.normalizeUpdate(dto, existing);
    const merged = this.blogRepo.merge(existing, patch);
    try {
      const saved = await this.blogRepo.save(merged);
      return this.toFormShape(saved);
    } catch (e) {
      this.rethrowUniqueSlug(e);
      throw e;
    }
  }

  async deleteAdmin(id: string): Promise<{ ok: true }> {
    const res = await this.blogRepo.delete(id);
    if (!res.affected) {
      throw new NotFoundException('Artigo não encontrado.');
    }
    return { ok: true };
  }

  async uploadBlogImage(
    file: Express.Multer.File | undefined,
  ): Promise<{ url: string }> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Arquivo de imagem é obrigatório.');
    }
    if (!IMAGE_MIMES.has(file.mimetype)) {
      throw new BadRequestException('Tipo de imagem não suportado.');
    }
    const safeBase =
      file.originalname?.replace(/[^a-zA-Z0-9._-]/g, '') || 'image';
    const path = `${Date.now()}-${safeBase}`;
    const client = this.supabaseService.getAdminClient();
    const { error } = await client.storage
      .from(BLOG_IMAGE_BUCKET)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });
    if (error) {
      this.logger.warn(`blog-images upload: ${error.message}`);
      throw new BadRequestException('Falha ao enviar imagem.');
    }
    const { data } = client.storage.from(BLOG_IMAGE_BUCKET).getPublicUrl(path);
    return { url: data.publicUrl };
  }

  private normalizeCreate(dto: CreateBlogPostDto): Partial<BlogPost> {
    return {
      title: dto.title.trim(),
      slug: dto.slug.trim(),
      content: dto.content ?? '',
      excerpt: this.emptyToNull(dto.excerpt),
      featured_image: this.emptyToNull(dto.featured_image),
      author: dto.author?.trim() || 'Equipe BahiaVagas',
      category: this.emptyToNull(dto.category),
      tags: dto.tags?.length ? dto.tags : [],
      meta_title: this.emptyToNull(dto.meta_title),
      meta_description: this.emptyToNull(dto.meta_description),
      og_title: this.emptyToNull(dto.og_title),
      og_description: this.emptyToNull(dto.og_description),
      og_image: this.emptyToNull(dto.og_image),
      canonical_url: this.emptyToNull(dto.canonical_url),
      status: dto.status?.trim() || 'draft',
      published_at: dto.published_at ? new Date(dto.published_at) : null,
    };
  }

  private normalizeUpdate(
    dto: UpdateBlogPostDto,
    existing: BlogPost,
  ): Partial<BlogPost> {
    const patch: Partial<BlogPost> = {};
    if (dto.title !== undefined) patch.title = dto.title.trim();
    if (dto.slug !== undefined) patch.slug = dto.slug.trim();
    if (dto.content !== undefined) patch.content = dto.content;
    if (dto.excerpt !== undefined) patch.excerpt = this.emptyToNull(dto.excerpt);
    if (dto.featured_image !== undefined) {
      patch.featured_image = this.emptyToNull(dto.featured_image);
    }
    if (dto.author !== undefined) {
      patch.author = dto.author?.trim() || 'Equipe BahiaVagas';
    }
    if (dto.category !== undefined) {
      patch.category = this.emptyToNull(dto.category);
    }
    if (dto.tags !== undefined) patch.tags = dto.tags?.length ? dto.tags : [];
    if (dto.meta_title !== undefined) {
      patch.meta_title = this.emptyToNull(dto.meta_title);
    }
    if (dto.meta_description !== undefined) {
      patch.meta_description = this.emptyToNull(dto.meta_description);
    }
    if (dto.og_title !== undefined) {
      patch.og_title = this.emptyToNull(dto.og_title);
    }
    if (dto.og_description !== undefined) {
      patch.og_description = this.emptyToNull(dto.og_description);
    }
    if (dto.og_image !== undefined) {
      patch.og_image = this.emptyToNull(dto.og_image);
    }
    if (dto.canonical_url !== undefined) {
      patch.canonical_url = this.emptyToNull(dto.canonical_url);
    }
    if (dto.status !== undefined) patch.status = dto.status.trim();
    if (dto.published_at !== undefined) {
      patch.published_at = dto.published_at
        ? new Date(dto.published_at)
        : null;
    }
    return patch;
  }

  private emptyToNull(v: string | null | undefined): string | null {
    if (v === undefined || v === null) return null;
    const t = String(v).trim();
    return t === '' ? null : t;
  }

  private rethrowUniqueSlug(e: unknown): void {
    if (e instanceof QueryFailedError) {
      const err = e as QueryFailedError & { driverError?: { code?: string } };
      if (err.driverError?.code === '23505') {
        throw new ConflictException('Slug já existe. Escolha outro.');
      }
    }
  }

  private toListItem(p: BlogPost): Record<string, unknown> {
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      featured_image: p.featured_image,
      author: p.author,
      category: p.category,
      tags: p.tags ?? [],
      published_at: p.published_at
        ? p.published_at instanceof Date
          ? p.published_at.toISOString()
          : p.published_at
        : null,
      created_at:
        p.created_at instanceof Date
          ? p.created_at.toISOString()
          : p.created_at,
    };
  }

  private toPublicDetail(p: BlogPost): Record<string, unknown> {
    return {
      ...this.toListItem(p),
      content: p.content,
      meta_title: p.meta_title,
      meta_description: p.meta_description,
      og_title: p.og_title,
      og_description: p.og_description,
      og_image: p.og_image,
      canonical_url: p.canonical_url,
      views: p.views,
    };
  }

  private toAdminRow(p: BlogPost): Record<string, unknown> {
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      author: p.author,
      status: p.status,
      views: p.views,
      category: p.category,
      published_at: p.published_at
        ? p.published_at instanceof Date
          ? p.published_at.toISOString()
          : p.published_at
        : null,
      created_at:
        p.created_at instanceof Date
          ? p.created_at.toISOString()
          : p.created_at,
    };
  }

  private toFormShape(p: BlogPost): Record<string, unknown> {
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content ?? '',
      excerpt: p.excerpt ?? '',
      featured_image: p.featured_image ?? '',
      author: p.author,
      category: p.category ?? '',
      tags: p.tags ?? [],
      meta_title: p.meta_title ?? '',
      meta_description: p.meta_description ?? '',
      og_title: p.og_title ?? '',
      og_description: p.og_description ?? '',
      og_image: p.og_image ?? '',
      canonical_url: p.canonical_url ?? '',
      status: p.status,
      published_at: p.published_at
        ? p.published_at instanceof Date
          ? p.published_at.toISOString()
          : p.published_at
        : null,
      views: p.views,
      created_at:
        p.created_at instanceof Date
          ? p.created_at.toISOString()
          : p.created_at,
      updated_at:
        p.updated_at instanceof Date
          ? p.updated_at.toISOString()
          : p.updated_at,
    };
  }
}
