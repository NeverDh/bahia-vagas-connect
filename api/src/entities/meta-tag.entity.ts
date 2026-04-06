/**
 * MetaTag Entity — Meta tags editáveis por página.
 *
 * Mapeada da tabela `meta_tags` do Supabase.
 * Cada registro associa um page_path a seus meta tags de SEO.
 *
 * REGRA DE NEGÓCIO #14: Cada navegação no frontend consulta meta_tags por page_path.
 *
 * @see supabase/migrations/20260216132710 — Criação original
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('meta_tags')
export class MetaTag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Caminho da página (ex: "/vagas", "/blog/meu-post") — unique */
  @Column({ type: 'text', unique: true })
  page_path!: string;

  @Column({ type: 'text', nullable: true })
  title!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', nullable: true })
  og_title!: string | null;

  @Column({ type: 'text', nullable: true })
  og_description!: string | null;

  @Column({ type: 'text', nullable: true })
  og_image!: string | null;

  @Column({ type: 'text', nullable: true })
  keywords!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
