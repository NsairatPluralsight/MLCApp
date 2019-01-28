import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { LCDStatus } from '../models/enums';
import { EventsService } from './events.service';

@Injectable()
export class StateService {
  private status: LCDStatus;

  /**
  * listen to the on Disconnect event
  * @constructor
  * @param {LoggerService} logger - The logger used to log errors.
  * @param {EventsService} eventsService - The service used to handle events.
  */
  constructor(private logger: LoggerService, private eventsService: EventsService) {
  }

  /**
  * @param {LCDStatus} value - The value of the app status.
  */
  setStatus(value: LCDStatus): void {
    try {
      this.status = value;
      this.eventsService.statusUpdate.emit();
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @return {LCDStatus} return LCDStatus enum that represents the App status.
  */
  getStatus(): LCDStatus {
    try {
      return this.status;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
