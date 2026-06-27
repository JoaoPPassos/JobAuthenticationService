import type { ITokenService } from '@domain/ports/ITokenService.interface';
import type { IUsersRepository } from '@domain/ports/IUsersRepository.interface';
import { AuthTokens } from '@module/auth/types/AuthLogin.type';
import { UnauthorizedException } from '@shared/exceptions/exceptions';

export class RefreshTokenUseCase {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.usersRepository.findById(payload.id);

    if (user.email !== payload.email) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      is_active: user.is_active,
    };

    const accessToken =
      await this.tokenService.generateAccessToken(tokenPayload);
    const nextRefreshToken =
      await this.tokenService.generateRefreshToken(tokenPayload);

    return { accessToken, refreshToken: nextRefreshToken };
  }
}
