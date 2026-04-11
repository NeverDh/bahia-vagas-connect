import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryFailedError } from 'typeorm';
import { MetaTag } from '../entities/meta-tag.entity.js';
import type { SaveMetaTagDto } from './dto/save-meta-tag.dto.js';

@Injectable()
export class MetaTagsService {
  constructor(
    @InjectRepository(MetaTag)
    private readonly metaRepo: Repository<MetaTag>,
  ) {}

  async findByPath(pagePath: string): Promise<Record<string, unknown> | null> {
    const row = await this.metaRepo.findOne({
      where: { page_path: pagePath },
    });
    return row ? this.serialize(row) : null;
  }

  async findAll(): Promise<Record<string, unknown>[]> {
    const rows = await this.metaRepo.find({ order: { page_path: 'ASC' } });
    return rows.map((r) => this.serialize(r));
  }

  async create(dto: SaveMetaTagDto): Promise<Record<string, unknown>> {
    const entity = this.metaRepo.create(this.normalize(dto));
    try {
      const saved = await this.metaRepo.save(entity);
      return this.serialize(saved);
    } catch (e) {
      this.rethrowUniquePath(e);
      throw e;
    }
  }

  async update(
    id: string,
    dto: SaveMetaTagDto,
  ): Promise<Record<string, unknown>> {
    const existing = await this.metaRepo.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Meta tag não encontrada.');
    }
    Object.assign(existing, this.normalize(dto));
    try {
      const saved = await this.metaRepo.save(existing);
      return this.serialize(saved);
    } catch (e) {
      this.rethrowUniquePath(e);
      throw e;
    }
  }

  async delete(id: string): Promise<{ ok: true }> {
    const res = await this.metaRepo.delete(id);
    if (!res.affected) {
      throw new NotFoundException('Meta tag não encontrada.');
    }
    return { ok: true };
  }

  private normalize(dto: SaveMetaTagDto): Partial<MetaTag> {
    return {
      page_path: dto.page_path.trim(),
      title: this.emptyToNull(dto.title),
      description: this.emptyToNull(dto.description),
      og_title: this.emptyToNull(dto.og_title),
      og_description: this.emptyToNull(dto.og_description),
      og_image: this.emptyToNull(dto.og_image),
      keywords: this.emptyToNull(dto.keywords),
    };
  }

  private emptyToNull(v: string | null | undefined): string | null {
    if (v === undefined || v === null) return null;
    const t = String(v).trim();
    return t === '' ? null : t;
  }

  private rethrowUniquePath(e: unknown): void {
    if (e instanceof QueryFailedError) {
      const err = e as QueryFailedError & { driverError?: { code?: string } };
      if (err.driverError?.code === '23505') {
        throw new ConflictException(
          'Já existe meta tag para este caminho de página.',
        );
      }
    }
  }

  private serialize(r: MetaTag): Record<string, unknown> {
    return {
      id: r.id,
      page_path: r.page_path,
      title: r.title,
      description: r.description,
      og_title: r.og_title,
      og_description: r.og_description,
      og_image: r.og_image,
      keywords: r.keywords,
      created_at:
        r.created_at instanceof Date
          ? r.created_at.toISOString()
          : r.created_at,
      updated_at:
        r.updated_at instanceof Date
          ? r.updated_at.toISOString()
          : r.updated_at,
    };
  }
}
