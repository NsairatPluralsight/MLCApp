import { Direction, ActionTypes } from './enums';

export class CounterInfo {
  queueBranch_ID: string;
  counterID: number;
  displayTicketNumber: string;
  hallID: string;
  id: string;
  segmentID: string;
  serviceID: string;
  userID: string;
  lastCallTime: string;
  activityType: ActionTypes;

  constructor(counterID: number, type: ActionTypes, branchID: string, id?: string, displayTicketNumber?: string, hallID?: string,
     segmentID?: string, serviceID?: string, userID?: string, lastCallTime?: string) {
    this.queueBranch_ID = branchID;
    this.counterID = counterID;
    this.displayTicketNumber = displayTicketNumber;
    this.hallID = hallID;
    this.id = id;
    this.segmentID = segmentID;
    this.serviceID = serviceID;
    this.userID = userID;
    this.lastCallTime = lastCallTime;
    this.activityType = type;
  }
}

export class Counter {
  id: number;
  nameL1: string;
  nameL2: string;
  nameL3: string;
  nameL4: string;
  number: number;
  direction: Direction;

  constructor(id: number, nameL1: string, nameL2: string, nameL3: string, nameL4: string, number: number, direction?: Direction) {
    this.id = id;
    this.nameL1 = nameL1;
    this.nameL2 = nameL2;
    this.nameL3 = nameL3;
    this.nameL4 = nameL4;
    this.number = number;
    this.direction = direction ? direction : Direction.None;
  }
}
