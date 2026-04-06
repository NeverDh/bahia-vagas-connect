/**
 * BlogPost Entity — Posts do blog.
 *
 * Mapeada da tabela `blog_posts` do Supabase.
 * Inclui campos de SEO (meta_title, meta_description, og_*, canonical_url).
 * Tags são armazenadas como TEXT[] (array PostgreSQL).
 *
 * @see supabase/migrations/20260305134701 — Criação original
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', unique: true })
  slug!: string;

  @Column({ type: 'text', default: '' })
  content!: string;

  @Column({ type: 'text', nullable: true })
  excerpt!: string | null;

  @Column({ type: 'text', nullable: true })
  featured_image!: string | null;

  @Column({ type: 'text', default: 'Equipe BahiaVagas' })
  author!: string;

  @Column({ type: 'text', nullable: true })
  category!: string | null;

  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  /** SEO fields */
  @Column({ type: 'text', nullable: true })
  meta_title!: string | null;

  @Column({ type: 'text', nullable: true })
  meta_description!: string | null;

  @Column({ type: 'text', nullable: true })
  og_title!: string | null;

  @Column({ type: 'text', nullable: true })
  og_description!: string | null;

  @Column({ type: 'text', nullable: true })
  og_image!: string | null;

  @Column({ type: 'text', nullable: true })
  canonical_url!: string | null;

  @Column({ type: 'text', default: 'draft' })
  status!: string;

  @Column({ type: 'int', default: 0 })
  views!: number;

  @Column({ type: 'timestamptz', nullable: true })
  published_at!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
