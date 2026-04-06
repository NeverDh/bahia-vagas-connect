/**
 * Job Entity — Representa vagas de emprego.
 *
 * Mapeada da tabela `jobs` do Supabase.
 * Inclui campos adicionais para importação externa.
 *
 * Enums: job_status, contract_type, experience_level são mapeados
 * como 'enum' nativo do PostgreSQL para manter compatibilidade com
 * o schema original do Supabase.
 *
 * @see supabase/migrations/20251107151703 — Criação original
 * @see docs/business-rules.md — Regras #5-#10 (busca, filtros, importação)
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from './company.entity.js';

/** Status possíveis de uma vaga */
export enum JobStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  DRAFT = 'draft',
}

/** Tipos de contrato */
export enum ContractType {
  CLT = 'clt',
  PJ = 'pj',
  TEMPORARY = 'temporary',
  INTERN = 'intern',
  FREELANCE = 'freelance',
}

/** Níveis de experiência */
export enum ExperienceLevel {
  INTERN = 'intern',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  SPECIALIST = 'specialist',
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  company_id!: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text', nullable: true })
  requirements!: string | null;

  @Column({ type: 'text', nullable: true })
  benefits!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salary_min!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salary_max!: number | null;

  @Column({ type: 'text' })
  location!: string;

  @Column({ type: 'enum', enum: ContractType })
  contract_type!: ContractType;

  @Column({ type: 'enum', enum: ExperienceLevel })
  experience_level!: ExperienceLevel;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.ACTIVE })
  status!: JobStatus;

  @Column({ type: 'text' })
  category!: string;

  @Column({ type: 'boolean', default: false })
  remote_option!: boolean;

  /** URL externa de candidatura (vagas importadas via JSearch) */
  @Column({ type: 'text', nullable: true })
  external_url!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at!: Date | null;
}
