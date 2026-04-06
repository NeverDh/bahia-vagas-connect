/**
 * Company Entity — Representa empresas/recrutadores.
 *
 * Mapeada da tabela `companies` do Supabase.
 * Inclui campos de verificação (CNPJ, is_verified) adicionados na migration 5.
 *
 * REGRA DE NEGÓCIO #10: Vagas importadas usam uma empresa fixa
 * "Vagas Importadas" (user_id = null). O campo user_id é nullable por isso.
 *
 * @see supabase/migrations/20251107151703 — Criação original
 * @see supabase/migrations/20251204004212 — Adição de cnpj, is_freelancer, is_verified, phone
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** ID do usuário dono da empresa (null para "Vagas Importadas") */
  @Column({ type: 'uuid', nullable: true })
  user_id!: string | null;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', nullable: true })
  logo_url!: string | null;

  @Column({ type: 'text', nullable: true })
  website!: string | null;

  @Column({ type: 'text', nullable: true })
  location!: string | null;

  /** CNPJ da empresa (opcional para freelancers) */
  @Column({ type: 'text', nullable: true })
  cnpj!: string | null;

  /** Se true, é freelancer e só pode postar vagas freelance */
  @Column({ type: 'boolean', default: false })
  is_freelancer!: boolean;

  /** Se true, perfil está completo e pode postar vagas */
  @Column({ type: 'boolean', default: false })
  is_verified!: boolean;

  @Column({ type: 'text', nullable: true })
  phone!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
