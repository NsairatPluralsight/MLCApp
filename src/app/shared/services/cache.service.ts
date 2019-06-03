import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { LCDCache } from '../models/cache';
import { AuthUser } from '../models/user';

@Injectable()
export class CacheService {
  private cache: LCDCache;
  private user: AuthUser;

  /**
  * @constructor
  * @param {LoggerService} logger - The logger used to log errors.
  */
  constructor(private logger: LoggerService) {
  }

  /**
  * @param {LCDCache} cache - The value of the cache object.
  */
  setCache(cache: LCDCache): void {
    try {
      this.cache = cache;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @return {LCDCache} return LCDCache object.
  */
  getCache(): LCDCache {
    try {
      return this.cache;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @param {AuthUser} user - the authenticated user used to start this mainLCD
   */
  setUser(user: AuthUser): void {
    try {
      this.user = user;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @returns {AuthUser} - the authenticated user
   */
  getUser(): AuthUser {
    try {
      return this.user;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
