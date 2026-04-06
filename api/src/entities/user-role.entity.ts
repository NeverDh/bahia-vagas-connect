/**
 * UserRole Entity — Roles de usuário (candidate, company, admin).
 *
 * Mapeada da tabela `user_roles` do Supabase.
 * O enum app_role inclui 'admin' que é gerenciado manualmente (INSERT direto).
 * Roles 'candidate' e 'company' são criadas automaticamente via trigger
 * quando um perfil é inserido.
 *
 * REGRA DE NEGÓCIO #1: Criação dual-path (trigger + backend)
 * REGRA DE NEGÓCIO #2: Admin tem role funcional separada
 *
 * @see supabase/migrations/20251130234640 — Criação original
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

/** Roles da aplicação */
export enum AppRole {
  CANDIDATE = 'candidate',
  COMPANY = 'company',
  ADMIN = 'admin',
}

@Entity('user_roles')
@Unique(['user_id', 'role'])
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Referência ao auth.users do Supabase */
  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'enum', enum: AppRole })
  role!: AppRole;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
