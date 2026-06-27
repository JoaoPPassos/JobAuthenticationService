import type {
  AuthTokenPayload,
  ITokenService,
} from '@domain/ports/ITokenService.interface';
import { type ITokenCache } from '@domain/ports/ITokenCache.interface';

const CACHE_PREFIX = 'access_token:';

export type ValidatedToken = {
  token: string;
  user: AuthTokenPayload;
};

export class ValidateTokenUseCase {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly cache: ITokenCache,
  ) {}

  async execute(token: string): Promise<ValidatedToken> {
    const cacheKey = `${CACHE_PREFIX}${token}`;

    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return { token, user: JSON.parse(cached) as AuthTokenPayload };
    }

    const { payload, expiresAt } = await this.tokenService.verifyAccessToken(token);

    const ttl = expiresAt - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await this.cache.set(cacheKey, JSON.stringify(payload), ttl);
    }

    return { token, user: payload };
  }
}
