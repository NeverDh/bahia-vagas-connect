import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from '../config/supabase.service.js';
import { CandidateProfile } from '../entities/candidate-profile.entity.js';
import { Company } from '../entities/company.entity.js';
import {
  UserRole as UserRoleEntity,
  AppRole,
} from '../entities/user-role.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { SignUpDto } from './dto/sign-up.dto.js';
import { JwtValidatedUser } from './strategies/jwt.strategy.js';

export type FunctionalRole = 'candidate' | 'company';

export type SerializedUser = {
  id: string;
  aud: string;
  role: string | undefined;
  email: string | undefined;
  email_confirmed_at: string | undefined;
  phone: string | undefined;
  confirmed_at: string | undefined;
  last_sign_in_at: string | undefined;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  identities: unknown[];
  created_at: string | undefined;
  updated_at: string | undefined;
};

export interface AuthPayload {
  user: SerializedUser;
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at?: number;
    token_type: string;
    user: SerializedUser;
  } | null;
  userRole: FunctionalRole | null;
  /** Equivalente a `has_role(user_id, 'admin')` no Postgres (SECURITY DEFINER). */
  isAdmin: boolean;
}

/**
 * Camada de autenticação: proxy ao Supabase Auth + perfil/roles no Postgres (TypeORM).
 *
 * Regras migradas do `useAuth` do React:
 * - ensureUserProfile: cria candidate_profiles ou companies conforme metadata.role
 * - resolveUserRole: RBAC via user_roles com fallback para perfis existentes
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    @InjectRepository(CandidateProfile)
    private readonly candidateRepo: Repository<CandidateProfile>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepo: Repository<UserRoleEntity>,
  ) {}

  async signUp(dto: SignUpDto): Promise<AuthPayload> {
    const client = this.supabaseService.getAdminClient();
    const { data, error } = await client.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      /** Confirma o e-mail na criação — login imediato sem etapa de confirmação. */
      email_confirm: true,
      user_metadata: {
        role: dto.role,
        full_name: dto.full_name,
        phone: dto.phone,
        name: dto.name,
        location: dto.location,
      },
    });

    if (error) {
      this.logger.warn(`signup failed: ${error.message}`);
      this.throwMappedAuthError(error.message);
    }

    const created = data.user;
    if (!created) {
      throw new BadRequestException('Não foi possível criar o usuário.');
    }

    const { data: signData, error: signError } =
      await client.auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });

    if (signError || !signData.session || !signData.user) {
      this.logger.warn(
        `signup created user but auto-login failed: ${signError?.message ?? 'no session'}`,
      );
      return {
        user: this.serializeUser(created),
        session: null,
        userRole: null,
        isAdmin: false,
      };
    }

    const user = signData.user;
    await this.ensureUserProfile(user);
    const { userRole, isAdmin } = await this.resolveUserAccess(user.id);

    return {
      user: this.serializeUser(user),
      session: this.buildSessionPayload(signData.session, user),
      userRole,
      isAdmin,
    };
  }

  async login(dto: LoginDto): Promise<AuthPayload> {
    const client = this.supabaseService.getAdminClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      this.logger.warn(`login failed: ${error.message}`);
      this.throwMappedAuthError(error.message);
    }

    const session = data.session;
    const user = data.user;
    if (!session || !user) {
      throw new UnauthorizedException('Credenciais inválidas ou sessão indisponível.');
    }

    await this.ensureUserProfile(user);
    const { userRole, isAdmin } = await this.resolveUserAccess(user.id);

    return {
      user: this.serializeUser(user),
      session: this.buildSessionPayload(session, user),
      userRole,
      isAdmin,
    };
  }

  async getMe(accessToken: string, _jwtUser: JwtValidatedUser): Promise<AuthPayload> {
    const client = this.supabaseService.getAdminClient();
    const { data, error } = await client.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new UnauthorizedException(
        error?.message ?? 'Sessão inválida ou expirada.',
      );
    }

    const user = data.user;
    await this.ensureUserProfile(user);
    const { userRole, isAdmin } = await this.resolveUserAccess(user.id);

    const serialized = this.serializeUser(user);
    const sessionStub = {
      access_token: accessToken,
      refresh_token: '',
      expires_in: 0,
      expires_at: undefined as number | undefined,
      token_type: 'bearer',
      user: serialized,
    };

    return {
      user: serialized,
      session: sessionStub,
      userRole,
      isAdmin,
    };
  }

  logout(): { ok: true } {
    return { ok: true };
  }

  async ensureUserProfile(authUser: User): Promise<void> {
    await this.ensureProfileRowsFromMetadata(
      authUser.id,
      authUser.email ?? undefined,
      (authUser.user_metadata || {}) as Record<string, unknown>,
    );
  }

  /**
   * Garante linhas em `candidate_profiles` / `companies` a partir do JWT (mesma lógica do login).
   * Cobre perfil ausente quando o token é válido mas `ensureUserProfile` não rodou antes.
   */
  async ensureUserProfileFromJwtUser(jwtUser: JwtValidatedUser): Promise<void> {
    await this.ensureProfileRowsFromMetadata(
      jwtUser.userId,
      jwtUser.email,
      jwtUser.user_metadata ?? {},
    );
  }

  private async ensureProfileRowsFromMetadata(
    userId: string,
    email: string | undefined,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    const role = metadata.role as FunctionalRole | undefined;

    if (!role || (role !== 'candidate' && role !== 'company')) {
      return;
    }

    if (role === 'candidate') {
      const exists = await this.candidateRepo.exist({
        where: { user_id: userId },
      });
      if (!exists) {
        const fullName =
          (metadata.full_name as string) ||
          email?.split('@')[0] ||
          'Candidato';
        const phone = (metadata.phone as string) || null;
        await this.candidateRepo.insert({
          user_id: userId,
          full_name: fullName,
          phone,
        });
      }
      return;
    }

    if (role === 'company') {
      const exists = await this.companyRepo.exist({
        where: { user_id: userId },
      });
      if (!exists) {
        const name = (metadata.name as string) || 'Empresa';
        const location = (metadata.location as string) || null;
        await this.companyRepo.insert({
          user_id: userId,
          name,
          location,
        });
      }
    }
  }

  /**
   * Resolve papel funcional (candidate/company) e flag admin em uma leitura de `user_roles`
   * (equivalente ao uso de `has_role` + regras do antigo `fetchUserRole` no React).
   */
  async resolveUserAccess(userId: string): Promise<{
    userRole: FunctionalRole | null;
    isAdmin: boolean;
  }> {
    const rows = await this.userRoleRepo.find({
      where: { user_id: userId },
    });

    const roles = rows.map((r) => r.role as string);
    const isAdmin = roles.includes(AppRole.ADMIN);

    let userRole: FunctionalRole | null = null;

    if (rows.length > 0) {
      if (isAdmin) {
        const functional =
          roles.find((r) => r === AppRole.COMPANY || r === AppRole.CANDIDATE) ??
          AppRole.CANDIDATE;
        userRole = functional as FunctionalRole;
      } else {
        userRole = rows[0].role as FunctionalRole;
      }
    } else {
      const hasCandidate = await this.candidateRepo.exist({
        where: { user_id: userId },
      });
      if (hasCandidate) userRole = 'candidate';
      else {
        const hasCompany = await this.companyRepo.exist({
          where: { user_id: userId },
        });
        if (hasCompany) userRole = 'company';
      }
    }

    return { userRole, isAdmin };
  }

  /** Usado por guards e serviços que precisam checar admin sem resolver papel funcional completo. */
  async isAdminUser(userId: string): Promise<boolean> {
    const row = await this.userRoleRepo.findOne({
      where: { user_id: userId, role: AppRole.ADMIN },
    });
    return !!row;
  }

  private throwMappedAuthError(message: string): never {
    const lower = message.toLowerCase();
    if (lower.includes('email not confirmed')) {
      throw new UnauthorizedException(message);
    }
    if (lower.includes('invalid login credentials')) {
      throw new UnauthorizedException(message);
    }
    if (
      lower.includes('already registered') ||
      lower.includes('user already exists') ||
      lower.includes('already been registered')
    ) {
      throw new ConflictException(message);
    }
    throw new BadRequestException(message);
  }

  private buildSessionPayload(
    session: Session,
    user: User,
  ): AuthPayload['session'] {
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in ?? 3600,
      expires_at: session.expires_at ?? undefined,
      token_type: session.token_type ?? 'bearer',
      user: this.serializeUser(user),
    };
  }

  serializeUser(user: User): SerializedUser {
    return {
      id: user.id,
      aud: user.aud,
      role: user.role,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      phone: user.phone,
      confirmed_at: user.confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      app_metadata: user.app_metadata ?? {},
      user_metadata: user.user_metadata ?? {},
      identities: (user.identities ?? []) as unknown[],
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
