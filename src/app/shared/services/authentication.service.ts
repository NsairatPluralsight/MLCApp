import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { loginUser, AuthUser } from '../models/user';
import { CommunicationService } from './communication.service';
import { ConnectionSettings } from '../models/connection';
import { HttpHeaders } from '@angular/common/http';
import { CacheService } from './cache.service';
import { Result, LoginErrorCodes, LCDStatus } from '../models/enums';
import { EventsService } from './events.service';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private logger: LoggerService, private communication: CommunicationService, private cacheService: CacheService,
    private eventsService: EventsService, private stateService: StateService) {
    this.eventsService.unAuthorized.subscribe(async (error) => {
      let result = await this.handleUnAuthorized(error);

      if (result == Result.Failed) {
        this.stateService.setStatus(LCDStatus.Offline);
        this.eventsService.unAuthenticated.emit();
      }
    });
  }

  /**
   * @async
   * @summary - try to login to system and obtain token and refresh token
   * @param {string} userName - the user name used for login
   * @param {string} password - the password belong to the user
   * @returns {Promise<Result>} - Result enum wrapped in a promise.
   */
  async login(userName: string, password: string): Promise<Result> {
    try {
      let result = Result.Failed;
      let user = new loginUser();
      user.username = userName;
      user.password = password;

      let authResult = await this.communication.AuthPost(ConnectionSettings.loginURL, user);

      if (authResult) {
        await this.setUser(authResult);
        result = Result.Success;
      }

      return result;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
  * @async
  * @summary - try to refresh the token
  * @param {string} refreshToken
  * @returns {Promise<Result>} - Result enum wrapped in a promise.
  */
  async refreshToken(refreshToken: string): Promise<Result> {
    try {
      let result = Result.Failed;
      let token = {
        refreshToken: refreshToken
      };

      let options = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        })
      };

      await this.communication.closeSocketIO();

      let authResult = await this.communication.AuthPost(ConnectionSettings.refreshTokenURL, token, options);

      if (authResult) {
        await this.setUser(authResult);
        result = Result.Success;
      }

      return result;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
   * @async
   * @summary - set the Auth user and cache it
   * @param {any} user - Auth user contains credentials sent from endpoint
   */
  async setUser(user: any): Promise<void> {
    try {
      let authUser = new AuthUser();
      authUser.token = user['token'];
      authUser.user = user['user'];

      this.cacheService.setUser(authUser);
      await this.communication.initializeSocketIO(authUser.token);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @async
  * @summary - set the Auth user and cache it
  * @param {any} pError - http error sent from interceptor
  * @returns {Promise<Result>} - Result enum wrapped in a promise.
  */
  async handleUnAuthorized(pError: any): Promise<Result> {
    try {
      let result = Result.Failed;

      if (pError.url.includes(ConnectionSettings.loginURL)) {
        let errorcode = pError.error.errorCode;
        switch (errorcode) {
          case LoginErrorCodes.Error:
          case LoginErrorCodes.InvalidToken:
            result = await this.reAuthenticate();
            break;
        }

      } else if (pError.url.includes(ConnectionSettings.postMessage)) {
        result = await this.reAuthenticate();
      }

      return result;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
  * @async
  * @summary - try to refresh token and if success starts app
  * @returns {Promise<Result>} - Result enum wrapped in a promise.
  */
  async reAuthenticate(): Promise<Result> {
    try {
      let result = Result.Failed;
      let loginUser = this.cacheService.getUser();

      if (loginUser && loginUser.user) {
        result = await this.refreshToken(loginUser.user.refreshToken);
        if (result == Result.Success) {
          this.eventsService.startApp.emit();
        }
      }

      return result;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }
}
