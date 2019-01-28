import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class EventsService {
  updateData: EventEmitter<any> = new EventEmitter();
  updateConfig: EventEmitter<any> = new EventEmitter();
  onDisconnect: EventEmitter<any> = new EventEmitter();
  exuteCommand: EventEmitter<any> = new EventEmitter();
  statusUpdate: EventEmitter<any> = new EventEmitter();

  constructor() { }
}
