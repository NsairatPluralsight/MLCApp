import { TestBed, inject } from '@angular/core/testing';

import { HelperService } from './helper.service';
import { Result } from '../models/enums';
import { Message } from '../models/message';
import { ResponsePayload } from '../models/payload';

describe('HelperService', () => {
  let service: HelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HelperService]
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
  });

  describe('setLCDDesign', () => {
    it('should set LCD Design', () => {
      window['LCDElement'] = [
        { ID: 'TicketNumber', Caption: 'Ticket EN' },
        { ID: 'CounterNameL1', Caption: 'counterL1 EN' },
        { ID: 'ServiceNameL1', Caption: 'ServiceL1 EN' },
        { ID: 'HallNameL1', Caption: 'HallL1 EN' },
      ];

      let result = service.setLCDDesign();

      expect(result).toBe(Result.Success);
      expect(service.lcdDesign).toBeDefined();
      expect(service.lcdDesign.length).toBe(4);
    });
  });

  describe('setLastUpdateTime', () => {
    it('should set last update time', async () => {
      let spy = spyOn(service, 'setLastUpdateTime');

      await service.setLastUpdateTime();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCommandText', () => {
    it('should return text', () => {
      let message = new Message();
      message.payload = new ResponsePayload();
      message.payload.data = 'HELLO';
      let text =  service.getCommandText(message);

      expect(text).toEqual('HELLO');
    });
  });


});
