import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';
import { ITokenCache } from '@domain/ports/ITokenCache.interface';
import { REDIS_CLIENT } from '@infrastructure/redis/redis.provider';

@Injectable()
export class TokenCacheRepository implements ITokenCache {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, value, 'EX', ttlSeconds);
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }
}
