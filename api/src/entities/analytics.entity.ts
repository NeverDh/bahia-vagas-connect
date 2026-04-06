/**
 * Analytics Entities — Visitantes, sessões e page views.
 *
 * Mapeadas das tabelas analytics_visitors, analytics_sessions e analytics_page_views.
 *
 * REGRA DE NEGÓCIO #13: Session ID é retornado pela API e mantido pelo frontend.
 * O ip_hash usa um salt server-side (env var ANALYTICS_IP_SALT) para anonimizar IPs.
 *
 * @see supabase/migrations/20260325033924 — Criação original
 * @see supabase/functions/track-visit — Lógica original de tracking
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

// ── Visitors ──────────────────────────────────────────────────

@Entity('analytics_visitors')
export class AnalyticsVisitor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Hash SHA-256 do IP + salt (nunca armazena IP real) */
  @Index({ unique: true })
  @Column({ type: 'text' })
  ip_hash!: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  first_visit!: Date;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  last_visit!: Date;

  @Column({ type: 'boolean', default: false })
  is_returning!: boolean;

  @Column({ type: 'int', default: 1 })
  visit_count!: number;

  /** Flag para excluir admins das métricas */
  @Column({ type: 'boolean', default: false })
  is_admin!: boolean;
}

// ── Sessions ──────────────────────────────────────────────────

@Entity('analytics_sessions')
export class AnalyticsSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  visitor_id!: string;

  @ManyToOne(() => AnalyticsVisitor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visitor_id' })
  visitor!: AnalyticsVisitor;

  @Index()
  @Column({ type: 'timestamptz', default: () => 'now()' })
  started_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  ended_at!: Date | null;

  @Column({ type: 'text', nullable: true })
  device!: string | null;

  @Column({ type: 'text', nullable: true })
  browser!: string | null;

  @Column({ type: 'text', nullable: true })
  os!: string | null;

  @Column({ type: 'text', nullable: true })
  country!: string | null;

  @Column({ type: 'text', nullable: true })
  city!: string | null;

  @Column({ type: 'text', nullable: true })
  region!: string | null;

  @Column({ type: 'text', nullable: true })
  referrer!: string | null;

  @Column({ type: 'boolean', default: false })
  is_admin!: boolean;
}

// ── Page Views ────────────────────────────────────────────────

@Entity('analytics_page_views')
export class AnalyticsPageView {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  session_id!: string;

  @ManyToOne(() => AnalyticsSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: AnalyticsSession;

  @Index()
  @Column({ type: 'text' })
  page_url!: string;

  @Column({ type: 'text', nullable: true })
  page_title!: string | null;

  @Index()
  @Column({ type: 'timestamptz', default: () => 'now()' })
  viewed_at!: Date;

  @Column({ type: 'int', default: 0 })
  duration_seconds!: number;
}
