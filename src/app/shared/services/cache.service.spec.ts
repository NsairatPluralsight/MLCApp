import { TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';
import { LoggerService } from './logger.service';
import { LCDCache } from '../models/cache';
import { User } from '../models/user';
import { Service } from '../models/service';
import { Hall } from '../models/hall';
import { CounterInfo, Counter } from '../models/countersInfo';

describe('CacheService', () => {
  let mockLoggerService, mockconfigService;
  let service: CacheService;

  let countersInfo = [{
    queueBranch_ID: '115',
    counterID: 131,
    displayTicketNumber: 'S019',
    hallID: '117',
    id: '1604',
    lastCallTime: 1540981960167,
    segmentID: '109',
    serviceID: '110',
    activityType: 5,
    userID: '-1'
  }] as CounterInfo[];

  let counters = [{ id: 118, nameL1: 'C1', nameL2: 'C1', nameL3: '', nameL4: '', number: 1 },
  { id: 131, nameL1: 'C2', nameL2: 'C2', nameL3: '', nameL4: '', number: 2 }] as Counter[];

  let halls = [{
    color: '#ff0000', guidingTextL1: 'Follow the Red Line', guidingTextL2: 'Follow the Red Line', guidingTextL3: null,
    guidingTextL4: null, id: 117, nameL1: 'H1', nameL2: 'H1', nameL3: '', nameL4: ''
  }] as Hall[];

  let segments = [
    { id: 109, nameL1: 'shabab', nameL2: 'shabab', nameL3: '', nameL4: '' },
    { id: 134, nameL1: 'TestSeg', nameL2: 'TestSeg', nameL3: '', nameL4: '' }];

  let services = [
    { id: 110, nameL1: 'Service1', nameL2: 's1', nameL3: '', nameL4: '', },
    { id: 133, nameL1: 'Service2', nameL2: 'Service2', nameL3: '', nameL4: '' }] as Service[];

  let users = [{ id: 2, loginName: 'root', nameL1: 'root', nameL2: 'root', nameL3: 'root', nameL4: 'root' },
  { id: 3, loginName: 'SystemUser', nameL1: 'System User', nameL2: 'System User', nameL3: 'System User', nameL4: 'System User' },
  { id: 4, loginName: 'ExternalCaller', nameL1: 'ExternalCaller', nameL2: 'ExternalCaller', nameL3: 'ExternalCaller' },
  { id: 119, loginName: 'Nsairat', nameL1: 'Nsairat', nameL2: 'Nsairat', nameL3: '' },
  { id: 130, loginName: 'U2', nameL1: 'U2', nameL2: 'U2', nameL3: '' },
  { id: 132, loginName: 'User3', nameL1: 'U3', nameL2: 'U3', nameL3: '' }] as User[];

  let cache = {
    segments: segments,
    counters: counters,
    services: services,
    users: users,
    halls: halls,
    countersInfo: countersInfo
  } as LCDCache;

  beforeEach(() => {
    mockLoggerService = jasmine.createSpyObj(['error']);

    TestBed.configureTestingModule({
      providers: [
        CacheService,
        { provide: LoggerService, useValue: mockLoggerService },
      ]
    });

    service = TestBed.get(CacheService);
  });

  it('should set and get cache', () => {
    service.setCache(cache);
    let Newcache = service.getCache();

    expect(Newcache).not.toBeNull();
    expect(Newcache.segments.length).toBe(2);
    expect(Newcache.services.length).toBe(2);
    expect(Newcache.halls.length).toBe(1);
    expect(Newcache.counters.length).toBe(2);
    expect(Newcache.countersInfo.length).toBe(1);
    expect(Newcache.users.length).toBe(6);

  });

});
