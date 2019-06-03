import { TestBed } from '@angular/core/testing';
import { LCDInfoService } from './lcd-info.service';
import { LoggerService } from '../shared/services/logger.service';
import { StateService } from '../shared/services/state.service';
import { CacheService } from '../shared/services/cache.service';
import { CacheManagerService } from '../shared/services/cacheManager.service';
import { EventEmitter } from '@angular/core';
import { Result, MainLCDDisplayMode } from '../shared/models/enums';
import { LCDCache } from '../shared/models/cache';
import { User } from '../shared/models/user';
import { Service } from '../shared/models/service';
import { Counter, CounterInfo } from '../shared/models/countersInfo';
import { Hall } from '../shared/models/hall';
import { Message } from '../shared/models/message';
import { CSComponent, MainLCDConfiguration } from '../shared/models/cs-component';
import { EventsService } from '../shared/services/events.service';
import { HelperService } from '../shared/services/helper.service';
import { LCDInfo } from '../shared/models/LCDInfo';
import { AuthenticationService } from '../shared/services/authentication.service';

describe('LcdInfoService', () => {
  let service: LCDInfoService;
  let mockLoggerservice, mockStateService, mockCacheService, mockCacheManagerService, mockHelperService, mockAuthenticationService;

  window['LCDElement'] = [
    { ID: 'TicketNumber', Caption: 'Ticket EN' },
    { ID: 'CounterNameL1', Caption: 'counterL1 EN' },
    { ID: 'ServiceNameL1', Caption: 'ServiceL1 EN' },
    { ID: 'HallNameL1', Caption: 'HallL1 EN' },
    { ID: 'HallColor', Caption: 'hallColorHeader EN' }];

  mockStateService = {
    setStatus() { },
    getStatus() { }
  };

  mockCacheManagerService = {
    intialaize() { return Result.Success; },
    branchID: 115
  };

  let countersInfo = [{
    queueBranch_ID: '115', counterID: 131, displayTicketNumber: 'S019', hallID: '117', id: '1604',
    lastCallTime: '1540981960167', segmentID: '109', serviceID: '110', activityType: 5, userID: '-1'
  }, {
    queueBranch_ID: '115', counterID: 119, displayTicketNumber: 'S020', hallID: '117', id: '1604',
    lastCallTime: '1540981960167', segmentID: '109', serviceID: '110', activityType: 5, userID: '-1'
  }] as CounterInfo[];

  let counters = [{ id: 118, nameL1: 'C1', nameL2: 'C1', nameL3: '', nameL4: '', number: 1 },
  { id: 119, nameL1: 'C2', nameL2: 'C2', nameL3: '', nameL4: '', number: 1 }] as Counter[];
  let halls = [{
    color: '#ff0000', guidingTextL1: 'Follow the Red Line', guidingTextL2: 'Follow the Red Line', guidingTextL3: null,
    guidingTextL4: null, id: 117, nameL1: 'H1', nameL2: 'H1', nameL3: '', nameL4: ''
  }] as Hall[];

  let segments = [{ id: 109, nameL1: 'shabab', nameL2: 'shabab', nameL3: '', nameL4: '' }];
  let services = [{ id: 110, nameL1: 'Service1', nameL2: 's1', nameL3: '', nameL4: '', }] as Service[];
  let users = [{ id: 2, loginName: 'root', nameL1: 'root', nameL2: 'root', nameL3: 'root', nameL4: 'root' }] as User[];

  let configCounters = [
    {
      direction: 1,
      id: 119,
      nameL1: "C2",
      nameL2: "C2",
      nameL3: "",
      nameL4: "",
      number: 2,
    },
    {
      direction: 2,
      id: 145,
      nameL1: "B2 C1",
      nameL2: "?2 ?1",
      nameL3: "",
      nameL4: "",
      number: 1,
    }] as Counter[];

  let config = {
    allServicesSelected: true, counters: configCounters,
    countersOption: 1,  enable: true, enablePaging: true,
    idleTimeForPaging: 20, pageDuration: 60,
    services: [], displayMode: MainLCDDisplayMode.CurrentCustomer
  } as MainLCDConfiguration;

  let mainLCD = {
    id:1, queueBranch_ID: 115, configuration: config, name_L1: "P15", name_L2: "?15", name_L3: "", address: "10.0.0.24",
    description: "15tlc", name_L4: "", orgID: 1, relatedClassName: "Player", relatedObject_ID: 170, reportedData: "[]",
    typeName: 'MainLCD', identity: "163", creationTime: '', lastUpdateTime: ''} as CSComponent;

  let cache = {
    segments: segments, counters: counters,
    services: services, users: users, halls: halls, countersInfo: countersInfo, mainLCD: mainLCD
  } as LCDCache;

  mockCacheManagerService.configData = cache;

  mockCacheService = {
    LCDCache: new LCDCache(),
    setCache() { },
    getCache(): LCDCache { return cache },
    updateData: new EventEmitter(),
  };

  let mockEventsService = {
    updateData: new EventEmitter(),
    updateConfig: new EventEmitter(),
    onDisconnect: new EventEmitter(),
    exuteCommand: new EventEmitter(),
    statusUpdate: new EventEmitter(),
    startApp: new EventEmitter()
  };

  mockEventsService.updateData =  new EventEmitter();
  mockEventsService.updateConfig =  new EventEmitter();
  mockEventsService.onDisconnect =  new EventEmitter();
  mockEventsService.exuteCommand = new EventEmitter();
  mockEventsService.statusUpdate =  new EventEmitter();
  mockEventsService.startApp =  new EventEmitter();

  mockHelperService = {
    getLCDDesign() { return Result.Success},
    async isBlinking() { return true },
    getCommandText() { return 'test'},
    async checkMessage(message) {
      return message ? Result.Success : Result.Failed;
    },
    async checkCounters() { return Result.Success},
    async setLastUpdateTime() { window['lastUpdateTime'] = new Date() },
  };

  mockAuthenticationService = {
    login: jasmine.createSpy()
  };

  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error']);
    TestBed.configureTestingModule({
      providers: [
        LCDInfoService,
        { provide: LoggerService, useValue: mockLoggerservice },
        { provide: StateService, useValue: mockStateService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: CacheManagerService, useValue: mockCacheManagerService },
        { provide: EventsService, useValue: mockEventsService },
        { provide: HelperService, useValue:  mockHelperService},
        { provide: AuthenticationService, useValue: mockAuthenticationService }
      ]
    });
    mockCacheService.LCDCache = cache;
    service = TestBed.get(LCDInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Authenticate', () => {
    it('it should starts app', async () => {

      let result = await service.Authenticate('test', 'test');

      expect(mockAuthenticationService.login).toHaveBeenCalledTimes(1);
    });
  });

  describe('start', () => {
    it('it should starts app', () => {
      let initializeSpy = spyOn(service, 'initialize').and.callThrough();

      service.start(163).then(() => {
        expect(initializeSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('initialize', () => {
    it('it should intialize app', async () => {
      let updateLCDResultSpy = spyOn(service, 'updateLCDResult').and.callThrough();
      let refreshCacheSpy = spyOn(service, 'refreshCache').and.callThrough();
      let filterCountersSpy = spyOn(service, 'filterCounters').and.callThrough();

      let result = await service.initialize();

      expect(result).toBe(Result.Success);
      expect(filterCountersSpy).toHaveBeenCalledTimes(1);
      expect(updateLCDResultSpy).toHaveBeenCalledTimes(1);
      expect(refreshCacheSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLCDData', () => {
    it('should create LcdInfo Array', async () => {

      let LCDArray = await service.getLCDData(cache);

      expect(LCDArray).not.toBeNull();
      expect(LCDArray.length).toBe(1);
    });
    it('should not create LcdInfo Array', async () => {
      let tCache: LCDCache;
      let LCDArray = await service.getLCDData(tCache);

      expect(LCDArray).toBe(undefined);
    });
  });

  describe('updateLCDResult', () => {
    it('should return Success, lcdData by calling the getLCDData', async () => {
      let spy = spyOn(service, 'getLCDData').and.callThrough();
      let result = await service.updateLCDResult();

      expect(result).toBe(Result.Success);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not set lcdData by calling the getLCDData', async () => {
      let spy = spyOn(service, 'getLCDData').and.returnValue(null);
      let result = await service.updateLCDResult();

      expect(result).toBe(Result.Failed);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchCache', () => {
    it('should call intialize', async () => {
      let spy = spyOn(service, 'initialize').and.callThrough();

      await service.fetchCache();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateCounters', () => {
    it('should update CountersInfo', async () => {

      let tCountersInfo = [{
        queueBranch_ID: '115', counterID: 131, displayTicketNumber: 'S019', hallID: '117', id: '1604',
        lastCallTime: '1540981960167', segmentID: '109', serviceID: '110', activityType: 3, userID: '-1'
      }] as CounterInfo[];

      let updatedCounters = await service.updateCounters(tCountersInfo, countersInfo);

      expect(updatedCounters.length).toBe(1);
    });
  });

  describe('prepareCounterData', () => {
    it('should update prepare Counter Data', async () => {
      let countersInfoPayloud = [
        {
          currentState: {
            branch_ID: '115',
            activityType: 3
          },
          id: '118'
        },
        {
          currentState: {
            branch_ID: '115',
            activityType: 5
          },
          currentTransaction: {
            branch_ID: '115',
            counter_ID: '131',
            displayTicketNumber: 'S019',
            hall_ID: 117,
            id: 1604,
            lastCallTime: 1540981960167,
            segment_ID: '109',
            service_ID: '110',
            user_ID: -1,
          },
          currentTransaction_ID: 1604,
          id: 131
        }
      ];

      service.branchID = 106;
      let updatedCounters = await service.prepareCounterData(countersInfoPayloud);

      expect(updatedCounters.length).toBe(2);
    });
  });

  describe('update', () => {
    it('should update cache', async () => {
      let prepareCounterDataSpy = spyOn(service, 'prepareCounterData').and.callThrough();
      let updateCountersSpy = spyOn(service, 'updateCounters').and.callThrough();
      let updateLCDResultSpy = spyOn(service, 'updateLCDResult').and.callThrough();
      let filterCountersSpy = spyOn(service, 'filterCounters').and.callThrough();

      let reqMessage = new Message();
      reqMessage.time = Date.now();
      reqMessage.payload = {
        Branchid: '106',
        EntityName: 'counter',
        countersInfo: [
          {
            currentState: {
              branch_ID: '115',
              type: 3
            },
            id: '118'
          },
          {
            currentState: {
              branch_ID: '115',
              type: 5
            },
            currentTransaction: {
              branch_ID: '115',
              counter_ID: '131',
              displayTicketNumber: 'S019',
              hall_ID: 117,
              id: 1604,
              lastCallTime: 1540981960167,
              segment_ID: '109',
              service_ID: '110',
              user_ID: -1,
            },
            currentTransaction_ID: 1604,
            id: 131
          }
        ],
        orgid: 1
      };
      service.branchID = 106;
      await service.update(reqMessage);

      expect(prepareCounterDataSpy).toHaveBeenCalledTimes(1);
      expect(filterCountersSpy).toHaveBeenCalledTimes(1);
      expect(updateCountersSpy).toHaveBeenCalledTimes(1);
      expect(updateLCDResultSpy).toHaveBeenCalledTimes(1);
    });

    it('should not update cache', async () => {
      let prepareCounterDataSpy = spyOn(service, 'prepareCounterData').and.callThrough();
      let updateCountersSpy = spyOn(service, 'updateCounters').and.callThrough();
      let updateLCDResultSpy = spyOn(service, 'updateLCDResult').and.callThrough();
      let filterCountersSpy = spyOn(service, 'filterCounters').and.callThrough();

      let reqMessage: Message;
      await service.update(reqMessage);

      expect(prepareCounterDataSpy).toHaveBeenCalledTimes(0);
      expect(filterCountersSpy).toHaveBeenCalledTimes(0);
      expect(updateCountersSpy).toHaveBeenCalledTimes(0);
      expect(updateLCDResultSpy).toHaveBeenCalledTimes(0);
    });

  });

  describe('updateConfig', () => {
    it('shoud update mainLCD config in cache', async () => {
      let filterCountersSpy = spyOn(service, 'filterCounters').and.callThrough();
      let updateLCDResultSpy = spyOn(service, 'updateLCDResult').and.callThrough();

      let payload = {
        branchID: 0,
        data: JSON.stringify(config),
        componentID: "1",
        orgID: 1,
        result: 0,
        typeName: "MainLCD"
      };

      let reqMessage = {
        messageID: "0.66520751045425070.54608039406946270.2674059715253736",
        source: "*",
        time: Date.now(),
        topicName: "ComponentService/Configuration",
        payload: payload
      } as Message;

      service.playerID = 163;
      await service.updateConfig(reqMessage);

      expect(filterCountersSpy).toHaveBeenCalledTimes(1);
      expect(updateLCDResultSpy).toHaveBeenCalledTimes(1);
    });

    it('shoud not update mainLCD config in cache', async () => {
      let filterCountersSpy = spyOn(service, 'filterCounters').and.callThrough();
      let updateLCDResultSpy = spyOn(service, 'updateLCDResult').and.callThrough();
      let reqMessage: Message;

      await service.updateConfig(reqMessage);

      expect(filterCountersSpy).toHaveBeenCalledTimes(0);
      expect(updateLCDResultSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('filterCounters', () => {
    it('should filter counters in cache accourding to configurations', async () => {
      mockCacheService.getCache()

      await service.filterCounters();

      expect(cache.counters.length).toEqual(1);
    });
  });

  describe('handlePaging', () => {
    it('should call handle paging after time', () => {
      let handlePagingSpy = spyOn(service, 'handlePaging').and.callThrough();

      service.handlePaging(true);

      setTimeout(() => {
        expect(handlePagingSpy).toHaveBeenCalledTimes(2);
      }, 20000);
    });
  });

  describe('fillCounterData', () => {
    it('should fill counter data', async () => {
      let counterID = 118;
      let lcdCounter =  new LCDInfo();

      await service.fillCounterData(lcdCounter, counters, counterID.toString());

      expect(lcdCounter.CounterNameL1).toBe('C1');
    });

    it('should not fill counter data', async () => {
      let tCounters;
      let counterID = 118;
      let lcdCounter =  new LCDInfo();

      await service.fillCounterData(lcdCounter, tCounters, counterID.toString());

      expect(lcdCounter.CounterNameL1).toBe(undefined);
    });
  });

  describe('fillServiceData', () => {
    it('should fill Service data', async () => {
      let serviceID = 110;
      let lcdCounter =  new LCDInfo();

      await service.fillServiceData(lcdCounter, services, serviceID.toString());

      expect(lcdCounter.ServiceNameL1).toBe('Service1');
    });

    it('should not fill Service data', async () => {
      let tServices;
      let serviceID = 118;
      let lcdCounter =  new LCDInfo();

      await service.fillServiceData(lcdCounter, tServices, serviceID.toString());

      expect(lcdCounter.ServiceNameL1).toBe(undefined);
    });
  });

  describe('fillSegmentData', () => {
    it('should fill segment data', async () => {
      let segmentID = 109;
      let lcdCounter = new LCDInfo();

      await service.fillSegmentData(lcdCounter, segments, segmentID.toString());

      expect(lcdCounter.SegmentNameL1).toBe('shabab');
    });

    it('should not fill segment data', async () => {
      let tSegments;
      let segmentID = 109;
      let lcdCounter = new LCDInfo();

      await service.fillSegmentData(lcdCounter, tSegments, segmentID.toString());

      expect(lcdCounter.SegmentNameL1).toBe(undefined);
    });
  });

  describe('fillHallData', () => {
    it('should fill segment data', async () => {
      let hallID = 117;
      let lcdCounter = new LCDInfo();

      await service.fillHallData(lcdCounter, halls, hallID.toString());

      expect(lcdCounter.HallNameL1).toBe('H1');
    });

    it('should not fill segment data', async () => {
      let tHalls;
      let hallID = 109;
      let lcdCounter = new LCDInfo();

      await service.fillHallData(lcdCounter, tHalls, hallID.toString());

      expect(lcdCounter.HallNameL1).toBe(undefined);
    });
  });

  describe('fillUserData', () => {
    it('should fill user data', async () => {
      let userID = 2;
      let lcdCounter = new LCDInfo();

      await service.fillUserData(lcdCounter, users, userID.toString());

      expect(lcdCounter.ServingEmployeeName).toBe('root');
    });

    it('should not fill user data', async () => {
      let tUsers;
      let userID = 109;
      let lcdCounter = new LCDInfo();

      await service.fillUserData(lcdCounter, tUsers, userID.toString());

      expect(lcdCounter.HallNameL1).toBe(undefined);
    });
  });
});
