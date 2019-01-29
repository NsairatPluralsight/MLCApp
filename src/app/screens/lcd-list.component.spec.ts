import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LCDListComponent } from './lcd-list.component';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { LoggerService } from '../shared/services/logger.service';
import { StateService } from '../shared/services/state.service';
import { CacheService } from '../shared/services/cache.service';
import { LCDInfoService } from './lcd-info.service';
import { LCDStatus } from '../shared/models/enums';
import { EventsService } from '../shared/services/events.service';
import { Message } from '../shared/models/message';
import { HelperService } from '../shared/services/helper.service';

describe('LcdListComponent', () => {
  let component: LCDListComponent;
  let fixture: ComponentFixture<LCDListComponent>;
  let mockLoggerService, mockStateService, mockLCDInfoService, mockHelperService;

  mockStateService = {
    setStatus() {},
    getStatus() { return LCDStatus.Offline; }
  };

  mockLCDInfoService = { start() {}, getCommandText(result: Message) { return 'HELLO' } };

  let mockEventsService = {
    updateData: new EventEmitter(),
    updateConfig: new EventEmitter(),
    onDisconnect: new EventEmitter(),
    exuteCommand: new EventEmitter(),
    statusUpdate: new EventEmitter()
  };

  mockEventsService.updateData =  new EventEmitter();
  mockEventsService.updateConfig =  new EventEmitter();
  mockEventsService.onDisconnect =  new EventEmitter();
  mockEventsService.exuteCommand = new EventEmitter();
  mockEventsService.statusUpdate =  new EventEmitter();

  mockHelperService = {
    getCommandText() { return 'test'}
  }

  beforeEach(() => {
    mockLoggerService = jasmine.createSpyObj(['error']);
    TestBed.configureTestingModule({
      declarations: [ LCDListComponent ],
      imports: [
        RouterTestingModule],
        providers: [
          { provide: LoggerService, useValue: mockLoggerService },
          { provide: StateService, useValue: mockStateService },
          { provide: LCDInfoService, useValue: mockLCDInfoService },
          { provide: EventsService, useValue: mockEventsService },
          { provide: HelperService, useValue:  mockHelperService}
        ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(LCDListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should show start app', () => {
      component.ngOnInit();

      expect(component.showLoading).toBe(true);
    });
  });

  describe('onAppStatusChange', () => {
    it('should show loading', () => {
      component.onAppStatusChange();

      expect(component.showLoading).toBe(true);
    });
  });

  describe('handleCommand', () => {
    it('should show loading', () => {
      let message = new Message();

      component.handleCommand(message);

      expect(component.showCommandText).toBe(true);
    });
  });

});
