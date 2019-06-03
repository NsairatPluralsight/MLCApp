import { TestBed, inject } from '@angular/core/testing';

import { InterceptorService } from './interceptor.service';
import { EventsService } from './events.service';
import { EventEmitter } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { CommunicationService } from './communication.service';
import { LoggerService } from './logger.service';
import { CacheService } from './cache.service';
import { ConnectionSettings } from '../models/connection';

describe('InterceptorService', () => {
  let commService, mockLoggerservice;
  let mockEventsService = {
    unAuthorized: new EventEmitter()
  };

  mockEventsService.unAuthorized = new EventEmitter();

  let httpMock = {
    post() {
      throw (new HttpErrorResponse({
        status: 401,
      }));
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InterceptorService,
        CommunicationService,
        CacheService,
        { provide: EventsService, useValue: mockEventsService },
        { provide: LoggerService, useValue: mockLoggerservice },
        { provide: HttpClient, useValue: httpMock},
        {
          provide: HTTP_INTERCEPTORS,
          useClass: InterceptorService,
          multi: true,
        },
      ],
    });
    commService = TestBed.get(CommunicationService);
  });

  it('should be created', inject([InterceptorService], (service: InterceptorService) => {
    expect(service).toBeTruthy();
  }));

  describe('intercept', () => {
    it('should call loginURL', () => {
      let emitSpy = spyOn(mockEventsService.unAuthorized, 'emit');

      commService.AuthPost(ConnectionSettings.loginURL, '').then(response => {
        expect(emitSpy).toHaveBeenCalled();
      });
    });
  });

});
