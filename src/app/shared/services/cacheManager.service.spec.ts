import { TestBed } from '@angular/core/testing';
import { CacheManagerService } from './cacheManager.service';
import { CommunicationService } from './communication.service';
import { LoggerService } from './logger.service';
import { Message } from '../models/message';
import { Result } from '../models/enums';

describe('Cache Manager Service', () => {
  let configService: CacheManagerService;
  let mockLoggerservice;
  let branchid = 106;
  let config = {
    IPAddress: "10.0.0.24",
    allServicesSelected: true,
    counters: [
      {
        assigned: true,
        direction: 1,
        hall_ID: 117,
        id: 118,
        name_L1: "C1",
        name_L2: "C1",
        name_L3: "",
        name_L4: "",
        number: 1,
        queueBranch_ID: 115
      }, {
        assigned: true,
        direction: 1,
        hall_ID: 117,
        id: 131,
        name_L1: "C2",
        name_L2: "C2",
        name_L3: "",
        name_L4: "",
        number: 2,
        queueBranch_ID: 115
      },
      {
        assigned: true,
        direction: 2,
        hall_ID: 144,
        id: 145,
        name_L1: "B2 C1",
        name_L2: "?2 ?1",
        name_L3: "",
        name_L4: "",
        number: 1,
        queueBranch_ID: 142
      }],
    countersOption: 1,
    description: "15tlc",
    enable: true,
    enablePaging: true,
    identifier: 170,
    identity: 163,
    idleTimeForPaging: 50,
    pageDuration: 60,
    services: [],
    withWaiting: false
  }
  let mainLCD = [{
    queueBranch_ID: 115,
    configuration: JSON.stringify(config),
    id: 1,
    name_L1: "P15",
    name_L2: "?15",
    name_L3: "",
    name_L4: "",
    orgID: 1,
    relatedClass: "Player",
    relatedObjectID: 170,
    report: "[]",
    type: 2
  }];

  let jsonMainLCD = JSON.stringify(mainLCD);

  let mockCommService = {
    async post(payload: any, topicName: string) {
      let reqMessage = new Message();
      reqMessage.time = Date.now();
      reqMessage.topicName = topicName;
      reqMessage.payload = payload;

      if (topicName === 'ExternalData/getAllCountersStatus') {

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

      } else if(topicName === 'ComponentService/Manager/GetComponent') {

        reqMessage.payload = {
          data: jsonMainLCD,
          relatedObject_ID: "163",
          languageindex: 0,
          orgid: 1,
          result: 0,
          type: 2,
        };

      } else {
        switch (payload.EntityName) {
          case 'counter':
            reqMessage.payload = {
              Branchid: '106',
              EntityName: 'counter',
              counters: [
                { id: 120, Name_L1: 'Counter 1', Name_L2: 'النافذة 1', Name_L3: 'Counter 1', Name_L4: '', Number: 0},
                { id: 121, Name_L1: 'Counter 2', Name_L2: 'النافذة 2', Name_L3: 'Counter 2', Name_L4: '', Number: 0 },
                { id: 605, Name_L1: 'Counter 5', Name_L2: 'Counter 5', Name_L3: 'Counter 5', Name_L4: '', Number: 0 },
                { id: 606, Name_L1: 'Counter 6', Name_L2: 'Counter 6', Name_L3: 'Counter 6', Name_L4: '', Number: 0 },
                { id: 607, Name_L1: 'Counter 7', Name_L2: 'Counter 7', Name_L3: 'Counter 7', Name_L4: '', Number: 0 }
              ],
              orgid: 1
            };
            break;
          case 'service':
            reqMessage.payload = {
              Branchid: '106',
              EntityName: 'service',
              services: [
                { id: 113, Name_L1: 'Service 1', Name_L2: 'خدمة 1', Name_L3: 'Service 1', Name_L4: '' },
                { id: 114, Name_L1: 'Service 2', Name_L2: 'خدمة 2', Name_L3: 'Service 2', Name_L4: '' },
                { id: 159, Name_L1: 'Service 3', Name_L2: 'الخدمة 3', Name_L3: 'Service 3', Name_L4: '' },
                { id: 364, Name_L1: 'Service4', Name_L2: 'Service4', Name_L3: 'Service4', Name_L4: '' },
                { id: 366, Name_L1: 'Clearing Cheque', Name_L2: 'شيكات مقاصة', Name_L3: '', Name_L4: 'Clearing Cheque' },
                { id: 368, Name_L1: 'Bill Payment', Name_L2: 'دفع فواتير', Name_L3: 'Bill Payment', Name_L4: '' }
              ],
              orgid: 1
            };
            break;
          case 'segment':
          reqMessage.payload = {
            Branchid: '106',
            EntityName: 'segment',
            segments: [
              {id: 111, Name_L1: 'Default', Name_L2: 'افتراضي', Name_L3: '', Name_L4: ''},
              {id: 112, Name_L1: 'Majd Segment', Name_L2: 'شريحة مجد', Name_L3: 'Majd Segment', Name_L4: ''},
              {id: 325, Name_L1: '[Default Segment]', Name_L2: '[Default Segment]', Name_L3: '', Name_L4: '[Default Segment]'},
              {id: 326, Name_L1: 'Remote Booking Segment', Name_L2: 'شريحة الحجز عن بعد', Name_L3: '', Name_L4: 'Remote Booking Segment'},
              {id: 327, Name_L1: 'Royal Customers', Name_L2: 'عملاء النخبة', Name_L3: '', Name_L4: ''},
              {id: 328, Name_L1: 'VIPs', Name_L2: 'VIPs', Name_L3: '', Name_L4: 'VIPs'}
            ],
            orgid: 1
          };
            break;
          case 'hall':
          reqMessage.payload = {
            Branchid: '106',
            EntityName: 'hall',
            halls: [
              {id: 838, Name_L1: 'Hall 1', Name_L2: 'Hall 1', Name_L3: 'Hall 1', Name_L4: 'Hall 1'},
              {id: 842, Name_L1: 'Hall 3', Name_L2: 'قاعة 3', Name_L3: 'Hall 3', Name_L4: ''},
              {id: 878, Name_L1: 'hall2', Name_L2: 'hall2', Name_L3: 'hall2', Name_L4: ''}
            ],
            orgid: 1
          };
            break;
          case 'user':
          reqMessage.payload = {
            Branchid: '106',
            EntityName: 'user',
            users: [
              { id: 2, Name_L1: 'root', Name_L2: 'root', Name_L3: '', Name_L4: 'root'},
              { id: 3, Name_L1: 'System User', Name_L2: 'System User', Name_L3: '', Name_L4: 'System User'},
              { id: 4, Name_L1: 'ExternalCaller', Name_L2: 'ExternalCaller', Name_L3: '', Name_L4: 'ExternalCaller'},
              { id: 124, Name_L1: 'user1 majd', Name_L2: 'user1 majd', Name_L3: 'user1 majd', Name_L4: ''},
              { id: 125, Name_L1: 'User2 Majd', Name_L2: 'user2 مجد', Name_L3: 'User2 Majd', Name_L4: ''},
              { id: 143, Name_L1: 'user3', Name_L2: 'user3', Name_L3: '', Name_L4: ''}
            ],
            orgid: 1
          };
            break;
        }
      }

      return reqMessage;
    },
  };

  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error']);
    TestBed.configureTestingModule({
      providers: [
        CacheManagerService,
        { provide: CommunicationService, useValue: mockCommService },
        { provide: LoggerService, useValue: mockLoggerservice }
      ]
    });

    configService = TestBed.get(CacheManagerService);
    configService.branchID = branchid;
  });

  it('should be created', () => {
    expect(configService).toBeTruthy();
  });

  describe('Get Configuration Payload', () => {
    it('Should return a valid config Payload', () => {
      let payload = configService.getConfigPayload('counter');

      expect(configService.branchID).toBe(106);
      expect(payload.EntityName).toEqual('counter');
      expect(payload.BranchID).toEqual(branchid.toString());
    });

    it('Should not return a valid config Payload', () => {
      let id;
      configService.branchID = id;

      let payload = configService.getConfigPayload('counter');

      expect(payload).toBe(undefined);
    });
  });

  describe('getComponent', () => {
    it('Should return Success', async () => {
      let result = await configService.getComponent(163);

      expect(configService.branchID).toBe(115);
      expect(result).toBe(Result.Success);
    });

    it('Should return Failed', async () => {
      let spy = spyOn(configService, "isValidPayload").and.returnValue(Result.Failed);

      let result = await configService.getComponent(15);

      expect(result).toBe(Result.Failed);
    });
  });

  describe('getCounters', () => {
    it('Should return sucess', async () => {
      let result = await configService.getCounters();

      expect(configService.branchID).toBe(106);
      expect(result).toBe(Result.Success);
    });

    it('Should return Failed', async () => {
      let spy = spyOn(configService, "isValidPayload").and.returnValue(Result.Failed);

      let result = await configService.getCounters();

      expect(result).toBe(Result.Failed);
    });
  });

  describe('getServices', () => {
    it('Should return success', async () => {
      let result = await configService.getServices();

      expect(configService.branchID).toBe(106);
      expect(result).toBe(Result.Success);
    });

    it('Should return Failed', async () => {
      let spy = spyOn(configService, "isValidPayload").and.returnValue(Result.Failed);

      let result = await configService.getServices();

      expect(result).toBe(Result.Failed);
    });
  });

  describe('getSegments', () => {
    it('Should return Success', async () => {
      let result = await configService.getSegments();

      expect(configService.branchID).toBe(106);
      expect(result).toBe(Result.Success);
    });

    it('Should return Failed', async () => {
      let spy = spyOn(configService, "isValidPayload").and.returnValue(Result.Failed);

      let result = await configService.getSegments();

      expect(result).toBe(Result.Failed);
    });
  });

  describe('getHalls', () => {
    it('Should return true', async () => {
      let result = await configService.getHalls();

      expect(configService.branchID).toBe(106);
      expect(result).toBe(Result.Success);
    });

    it('Should return Failed', async () => {
      let spy = spyOn(configService, "isValidPayload").and.returnValue(Result.Failed);

      let result = await configService.getHalls();

      expect(result).toBe(Result.Failed);
    });
  });

  describe('getUsers', () => {
    it('Should return Success', async () => {
      let result = await configService.getUsers();

      expect(configService.branchID).toBe(106);
      expect(result).toBe(Result.Success);
    });

    it('Should return Failed', async () => {
      let spy = spyOn(configService, "isValidPayload").and.returnValue(Result.Failed);

      let result = await configService.getUsers();

      expect(result).toBe(Result.Failed);
    });
  });

  describe('getCountersData', () => {
    it('Should return Counters Data', async () => {
      let result = await configService.getCountersData();

      expect(result).toBe(Result.Success);
    });

    it('Should return Failed', async () => {
      let spy = spyOn(configService, "isValidPayload").and.returnValue(Result.Failed);

      let result = await configService.getCountersData();

      expect(result).toBe(Result.Failed);
    });
  });

  describe('intialaize', () => {
    it('should try to intialaize data and calls all methods', async () => {
      let mainLCDSpy = spyOn(configService, "getComponent").and.callThrough();
      let segmentsSpy = spyOn(configService, 'getSegments').and.callThrough();
      let servicesSpy = spyOn(configService, 'getServices').and.callThrough();
      let usersSpy = spyOn(configService, 'getUsers').and.callThrough();
      let hallsSpy = spyOn(configService, 'getHalls').and.callThrough();
      let countersDataSpy = spyOn(configService, 'getCountersData').and.callThrough();
      let countersSpy = spyOn(configService, 'getCounters').and.callThrough();
      let fillCacheSpy = spyOn(configService, 'fillCache');

      await configService.intialaize(163);

      expect(mainLCDSpy).toHaveBeenCalledTimes(1);
      expect(segmentsSpy).toHaveBeenCalledTimes(1);
      expect(servicesSpy).toHaveBeenCalledTimes(1);
      expect(usersSpy).toHaveBeenCalledTimes(1);
      expect(hallsSpy).toHaveBeenCalledTimes(1);
      expect(countersDataSpy).toHaveBeenCalledTimes(1);
      expect(countersSpy).toHaveBeenCalledTimes(1);
      expect(fillCacheSpy).toHaveBeenCalledTimes(1);
    });

    it('should fail to intialaize data and calls all methods', async () => {
      let mainLCDSpy = spyOn(configService, "getComponent").and.returnValue(Result.Failed);
      let segmentsSpy = spyOn(configService, 'getSegments').and.callThrough();
      let servicesSpy = spyOn(configService, 'getServices').and.callThrough();
      let usersSpy = spyOn(configService, 'getUsers').and.callThrough();
      let hallsSpy = spyOn(configService, 'getHalls').and.callThrough();
      let countersDataSpy = spyOn(configService, 'getCountersData').and.callThrough();
      let countersSpy = spyOn(configService, 'getCounters').and.callThrough();

      await configService.intialaize(167);

      expect(mainLCDSpy).toHaveBeenCalledTimes(1);
      expect(segmentsSpy).toHaveBeenCalledTimes(0);
      expect(servicesSpy).toHaveBeenCalledTimes(0);
      expect(usersSpy).toHaveBeenCalledTimes(0);
      expect(hallsSpy).toHaveBeenCalledTimes(0);
      expect(countersDataSpy).toHaveBeenCalledTimes(0);
      expect(countersSpy).toHaveBeenCalledTimes(0);
    });

  });

  describe('fillCache', () => {
    it('should try to intialaize data', async () => {
      let spy = spyOn(configService, 'fillCache');

      await configService.fillCache();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
