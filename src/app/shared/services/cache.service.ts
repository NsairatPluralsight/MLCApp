import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { LCDCache } from '../models/cache';

@Injectable()
export class CacheService {
  private cache: LCDCache;

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
}
