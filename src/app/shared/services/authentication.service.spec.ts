import { TestBed, inject } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { LoggerService } from './logger.service';
import { CommunicationService } from './communication.service';
import { StateService } from './state.service';
import { CacheService } from './cache.service';
import { EventsService } from './events.service';
import { EventEmitter } from '@angular/core';
import { Result } from '../models/enums';
import { AuthUser, loginUser } from '../models/user';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConnectionSettings } from '../models/connection';

describe('AuthenticationService', () => {
  let mockLoggerservice, mockStateService, mockEventsService;
  let authenticationService: AuthenticationService;

  mockEventsService = {
    unAuthenticated: new EventEmitter(),
    unAuthorized: new EventEmitter(),
    startApp: new EventEmitter()
  };

  mockEventsService.exuteCommand = new EventEmitter();
  mockEventsService.unAuthorized =  new EventEmitter();
  mockEventsService.startApp =  new EventEmitter();

  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error']);

    TestBed.configureTestingModule({
      providers: [
        AuthenticationService,
        CommunicationService,
        CacheService,
        { provide: LoggerService, useValue: mockLoggerservice },
        { provide: StateService, useValue: mockStateService },
        { provide: EventsService, useValue: mockEventsService }
      ],
      imports: [HttpClientTestingModule]
    });

    authenticationService = TestBed.get(AuthenticationService);
  });

  it('should be created', inject([AuthenticationService], (service: AuthenticationService) => {
    expect(service).toBeTruthy();
  }));

  describe('login', () => {

    it('should return Failed', async() => {
      spyOn(CommunicationService.prototype, 'AuthPost').and.callFake(() => { return undefined; });

      let result = await authenticationService.login('root', 'test');

      expect(result).toBe(Result.Failed);

    });

    it('should return Success ', async() => {
      spyOn(CommunicationService.prototype, 'AuthPost').and.callFake(async() => { return new AuthUser(); });
      let setUserSpy = spyOn(authenticationService, 'setUser');

      let result = await authenticationService.login('root', 'test');

      expect(result).toBe(Result.Success);
      expect(setUserSpy).toHaveBeenCalledTimes(1);
    });

  });

  describe('refreshToken', () => {

    it('should return Failed', async() => {
      spyOn(CommunicationService.prototype, 'AuthPost').and.callFake(() => { return undefined; });
      let closeSocketSpy = spyOn(CommunicationService.prototype, 'closeSocketIO');

      let result = await authenticationService.refreshToken('root');

      expect(result).toBe(Result.Failed);
      expect(closeSocketSpy).toHaveBeenCalledTimes(1);
    });

    it('should return Success ', async() => {
      spyOn(CommunicationService.prototype, 'AuthPost').and.callFake(async() => { return new AuthUser(); });
      let closeSocketSpy = spyOn(CommunicationService.prototype, 'closeSocketIO');
      let setUserSpy = spyOn(authenticationService, 'setUser');

      let result = await authenticationService.refreshToken('root');

      expect(result).toBe(Result.Success);
      expect(setUserSpy).toHaveBeenCalledTimes(1);
      expect(closeSocketSpy).toHaveBeenCalledTimes(1);
    });

  });

  describe('setUser', () => {

    it('should not call initializeSocketIO', async() => {
      let initializeSocketIOSpy = spyOn(CommunicationService.prototype, 'initializeSocketIO');

      await authenticationService.setUser(null);

      expect(initializeSocketIOSpy).toHaveBeenCalledTimes(0);
    });

    it('should call initializeSocketIO', async() => {
      let initializeSocketIOSpy = spyOn(CommunicationService.prototype, 'initializeSocketIO');
      let user = new AuthUser();

      await authenticationService.setUser(user);

      expect(initializeSocketIOSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleUnAuthorized', () => {

    it('should return Failed', async() => {
      let result = await authenticationService.handleUnAuthorized('');

      expect(result).toBe(Result.Failed);
    });

    it('should return Failed', async () => {
      spyOn(authenticationService, 'reAuthenticate').and.callFake(() => { return Result.Failed });

      let error = {
        error: {
          errorCode: -909
        },
        url: ConnectionSettings.loginURL
      };

      let result = await authenticationService.handleUnAuthorized(error);

      expect(result).toBe(Result.Failed);
    });

    it('should return Success', async() => {
      spyOn(authenticationService, 'reAuthenticate').and.callFake(() => { return Result.Success });
      let error = {
        error: {
          errorCode: -909
        },
        url: ConnectionSettings.loginURL
      };
      let result = await authenticationService.handleUnAuthorized(error);

      expect(result).toBe(Result.Success);
    });
  });

  describe('reAuthenticate', () => {
    it('should return Failed', async() => {
      spyOn(CacheService.prototype, 'getUser').and.callFake(() => { return null });

      let result = await authenticationService.reAuthenticate();

      expect(result).toBe(Result.Failed);
    });

    it('should return Success', async() => {
      let user = new AuthUser();
      user.user = new loginUser();
      spyOn(authenticationService, 'refreshToken').and.callFake(() => { return Result.Success });
      spyOn(CacheService.prototype, 'getUser').and.callFake(() => { return user });

      let result = await authenticationService.reAuthenticate();

      expect(result).toBe(Result.Success);
    });
  });
});
