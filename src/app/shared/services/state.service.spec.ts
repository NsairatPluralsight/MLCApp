import { TestBed } from '@angular/core/testing';
import { StateService } from './state.service';
import { LoggerService } from './logger.service';
import { EventEmitter } from '@angular/core';
import { LCDStatus } from '../models/enums';
import { EventsService } from './events.service';

describe('StateService', () => {
  let mockLoggerservice, mockEventsService;
  let service: StateService;

  mockEventsService = {
    statusUpdate: new EventEmitter()
  };

  mockEventsService.statusUpdate =  new EventEmitter();

  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error']);
    TestBed.configureTestingModule({
      providers: [
        StateService,
        { provide: LoggerService, useValue: mockLoggerservice },
        { provide: EventsService, useValue: mockEventsService }
      ]
    });
    service = TestBed.get(StateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call setStatus once', () => {
    let spy = spyOn(service, 'setStatus');

    service.setStatus(LCDStatus.Connecting);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should change status to Connecting', () => {
    service.setStatus(LCDStatus.Connecting);

    let status = service.getStatus();

    expect(status).toBe(LCDStatus.Connecting);
  });
});
