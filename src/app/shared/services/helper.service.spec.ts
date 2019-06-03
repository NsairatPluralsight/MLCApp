import { TestBed, inject } from '@angular/core/testing';

import { HelperService } from './helper.service';
import { Result } from '../models/enums';
import { Message } from '../models/message';
import { ResponsePayload } from '../models/payload';
import { LoggerService } from './logger.service';

describe('HelperService', () => {
  let service: HelperService;
  let mockLoggerservice;
  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error']);

    TestBed.configureTestingModule({
      providers: [
        HelperService,
        { provide: LoggerService, useValue: mockLoggerservice }
      ]
    });
    service = TestBed.get(HelperService);
  });

  describe('isBlinking', () => {
    it('should be true', async () => {
      window['blinkingCounts'] = 5;
      window['blinkingInterval'] = 2;

      let result = await service.isBlinking(new Date());

      expect(result).toBe(true);
    });

    it('should be false', async () => {
      let date;

      let result = await service.isBlinking(date);

      expect(result).toBe(false);
    });
  });

  describe('setLastUpdateTime', () => {
    it('should set last update time', async () => {
      let spy = spyOn(service, 'setLastUpdateTime');

      await service.setLastUpdateTime();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLCDDesign', () => {
    it('should return Success', () => {
      window['LCDElement'] = [
        { ID: 'TicketNumber', Caption: 'Ticket EN' },
        { ID: 'CounterNameL1', Caption: 'counterL1 EN' },
        { ID: 'ServiceNameL1', Caption: 'ServiceL1 EN' },
        { ID: 'HallNameL1', Caption: 'HallL1 EN' },
      ];

      let result = service.getLCDDesign();

      expect(result).toBe(Result.Success);
      expect(service.lcdDesign).toBeDefined();
      expect(service.lcdDesign.length).toBe(4);
    });

    it('should return Failed', () => {
      window['LCDElement'] = null;

      let result = service.getLCDDesign();

      expect(result).toBe(Result.Failed);
      expect(service.lcdDesign).not.toBeDefined();
    });
  });

  describe('getCommandText', () => {
    it('should return text', () => {
      let obj = {
        command: 'HELLO'
      };
      let message = new Message();
      message.payload = new ResponsePayload();
      message.payload.data =  JSON.stringify(obj);
      let text = service.getCommandText(message);

      expect(text).toEqual('HELLO');
    });
  });

  describe('checkMessage', () => {

    it('should return Success', async () => {
      let message = new Message();
      message.payload = {
        componentID: 115,
        data: "test"
      };

      let result = await service.checkMessage(message, 115);

      expect(result).toBe(Result.Success);
    });

    it('should return Success', async () => {
      let message = new Message();

      let result = await service.checkMessage(message, 115);

      expect(result).toBe(Result.Failed);
    });

  });

  describe('checkCounters', () => {

    it('should return Success', async () => {
      let message = new Message();
      message.payload = {
        countersInfo: [{ id:1 }]
      };

      let result = await service.checkCounters(message);

      expect(result).toBe(Result.Success);
    });

    it('should return Success', async () => {
      let message = new Message();

      let result = await service.checkCounters(message);

      expect(result).toBe(Result.Failed);
    });

  });


});
