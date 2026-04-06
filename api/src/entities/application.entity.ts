/**
 * Application Entity — Candidaturas a vagas.
 *
 * Mapeada da tabela `applications` do Supabase.
 * Constraint UNIQUE(job_id, candidate_id) impede candidatura duplicada.
 *
 * @see supabase/migrations/20251107151703 — Criação original
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Job } from './job.entity.js';
import { CandidateProfile } from './candidate-profile.entity.js';

@Entity('applications')
@Unique(['job_id', 'candidate_id'])
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  job_id!: string;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job!: Job;

  @Column({ type: 'uuid' })
  candidate_id!: string;

  @ManyToOne(() => CandidateProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: CandidateProfile;

  @Column({ type: 'text', nullable: true })
  cover_letter!: string | null;

  @Column({ type: 'text', default: 'pending' })
  status!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
