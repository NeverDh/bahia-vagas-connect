import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService, type AuthPayload } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { SignUpDto } from './dto/sign-up.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import type { JwtValidatedUser } from './strategies/jwt.strategy.js';

/**
 * Autenticação REST — proxy ao Supabase Auth + perfis/roles no Postgres.
 */
@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Cadastro de usuário',
    description:
      'Cria conta com e-mail já confirmado (`email_confirm: true`) e tenta login imediato; ' +
      'em caso de sucesso retorna JWT + perfil/role. Não depende de confirmação por link.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado; em condições normais inclui sessão (auto-login).',
  })
  @ApiResponse({ status: 400, description: 'Validação ou erro do provedor de auth' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  async signUp(@Body() dto: SignUpDto): Promise<AuthPayload> {
    return this.authService.signUp(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login com email e senha',
    description:
      'Autentica via Supabase; retorna access/refresh tokens e papel funcional (candidate/company). ' +
      'Email não confirmado retorna 401 com mensagem do GoTrue.',
  })
  @ApiResponse({ status: 200, description: 'Login OK' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas ou email não confirmado' })
  async login(@Body() dto: LoginDto): Promise<AuthPayload> {
    return this.authService.login(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Logout',
    description:
      'Confirma intenção de encerrar sessão no cliente. O JWT do Supabase permanece válido até expirar.',
  })
  @ApiResponse({ status: 200, description: '{ ok: true }' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  logout(): { ok: true } {
    return this.authService.logout();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Sessão atual',
    description:
      'Valida o Bearer token com o Supabase, sincroniza perfil se necessário e retorna usuário + userRole.',
  })
  @ApiResponse({ status: 200, description: 'Usuário autenticado' })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
  async me(@Req() req: Request & { user: JwtValidatedUser }): Promise<AuthPayload> {
    const auth = req.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!token) {
      throw new UnauthorizedException('Token de acesso ausente.');
    }
    return this.authService.getMe(token, req.user);
  }
}
