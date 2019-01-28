import { TestBed, fakeAsync } from '@angular/core/testing';
import { CommunicationService } from './communication.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { ConnectionSettings } from '../models/connection';
import { ConfigPayload, RequestPayload } from '../models/payload';
import { EventEmitter } from '@angular/core';
import { EventsService } from './events.service';

describe('CommunicationService', () => {
  let service: CommunicationService;
  let httpTestingController: HttpTestingController;
  let connSettings: ConnectionSettings;
  let payload: ConfigPayload;
  let topicName = 'ExternalData/read';
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
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommunicationService,
        { provide: EventsService, useValue: mockEventsService },
      ],
      imports: [HttpClientTestingModule]
    });
    connSettings = new ConnectionSettings();
    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(CommunicationService);
    payload = new ConfigPayload();
    payload.BranchID = '106';
    payload.orgid = 1;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call get mainLCD from component service', fakeAsync(() => {
    let requestpayload = new RequestPayload();
    requestpayload.orgid = 1;
    requestpayload.typeName = "MainLCD";
    requestpayload.componentID = 163;

    service.post(payload, 'ComponentService/Manager/GetComponent');

    httpTestingController.expectOne(connSettings.serverURL + 'PostMessage', '');
  }));

  it('should call get counters from API', fakeAsync(() => {
    payload.EntityName = 'counter';

    service.post(payload, topicName);

    httpTestingController.expectOne(connSettings.serverURL + 'PostMessage', '');
  }));

  it('should call get Services from API', fakeAsync(() => {
    payload.EntityName = 'service';

    service.post(payload, topicName);

    httpTestingController.expectOne(connSettings.serverURL + 'PostMessage', '');
  }));

  it('should call get Segment from API', fakeAsync(() => {
    payload.EntityName = 'segment';

    service.post(payload, topicName);

    httpTestingController.expectOne(connSettings.serverURL + 'PostMessage', '');
  }));

  it('should call get Halls from API', fakeAsync(() => {
    payload.EntityName = 'hall';

    service.post(payload, topicName);

    httpTestingController.expectOne(connSettings.serverURL + 'PostMessage', '');
  }));

  it('should call get Users from API', fakeAsync(() => {
    payload.EntityName = 'user';

    service.post(payload, topicName);

    httpTestingController.expectOne(connSettings.serverURL + 'PostMessage', '');
  }));

  it('should call get CountersData from API', fakeAsync(() => {
    topicName = 'ExternalData/getAllCountersStatus';
    let requestpayload = new RequestPayload();
    requestpayload.orgid = 1;
    requestpayload.branchid = '106';
    requestpayload.origin = '0';
    service.post(payload, topicName);

    httpTestingController.expectOne(connSettings.serverURL + 'PostMessage', '');
  }));
});
