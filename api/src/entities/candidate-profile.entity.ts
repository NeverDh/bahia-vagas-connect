/**
 * CandidateProfile Entity — Perfil completo do candidato.
 *
 * Mapeada da tabela `candidate_profiles` do Supabase.
 * Skills são armazenadas como array de texto (PostgreSQL TEXT[]).
 *
 * @see supabase/migrations/20251107151703 — Criação original
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('candidate_profiles')
export class CandidateProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Referência ao auth.users — unique constraint */
  @Column({ type: 'uuid', unique: true })
  user_id!: string;

  @Column({ type: 'text' })
  full_name!: string;

  @Column({ type: 'text', nullable: true })
  phone!: string | null;

  @Column({ type: 'text', nullable: true })
  resume_url!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  /** Array de competências do candidato */
  @Column({ type: 'text', array: true, nullable: true })
  skills!: string[] | null;

  @Column({ type: 'text', nullable: true })
  linkedin_url!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
