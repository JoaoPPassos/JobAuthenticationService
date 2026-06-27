import type {
  AuthTokenPayload,
  ITokenService,
} from '@domain/ports/ITokenService.interface';
import type { IUsersRepository } from '@domain/ports/IUsersRepository.interface';
import type { IHashService } from '@domain/ports/IHashService.interface';
import { AuthLogin } from '@module/auth/types/AuthLogin.type';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@shared/exceptions/exceptions';

export class LoginUserUseCase {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly tokenService: ITokenService,
    private readonly hashService: IHashService,
  ) {}

  async execute(data: { email: string; password: string }): Promise<AuthLogin> {
    const user = await this.usersRepository.findByEmail(data.email);

    if (user === null) throw new NotFoundException('Usuário não encontrado');
    if (!user.password)
      throw new BadRequestException('Email ou password errados.');

    const valid = await this.hashService.compare(data.password, user.password);
    if (!valid) throw new BadRequestException('Email ou password errados.');
    if (!user.is_active)
      throw new UnauthorizedException(
        'Conta não confirmada. Verifique seu e-mail.',
      );

    const tokenPayload: AuthTokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      is_active: user.is_active,
    };

    const accessToken = await this.tokenService.generateAccessToken(tokenPayload);
    const refreshToken =
      await this.tokenService.generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user.id,
        created_at: user.created_at,
        updated_at: user.updated_at,
        deleted_at: user.deleted_at,
        name: user.name,
        email: user.email,
        is_active: user.is_active,
      },
      accessToken,
      refreshToken,
    };
  }
}
