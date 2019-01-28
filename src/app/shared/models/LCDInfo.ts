import { ActionTypes, Direction } from './enums';

export class LCDInfo {
  CounterNameL1: string;
  CounterNameL2: string;
  CounterNameL3: string;
  CounterNameL4: string;
  CounterNumber: number;
  CounterDirection: Direction;

  HallNameL1: string;
  HallNameL2: string;
  HallNameL3: string;
  HallNameL4: string;
  HallColor: string;
  HallGuidingTextL1: string;
  HallGuidingTextL2: string;
  HallGuidingTextL3: string;
  HallGuidingTextL4: string;

  ServingEmployeeName: string;

  ServiceNameL1: string;
  ServiceNameL2: string;
  ServiceNameL3: string;
  ServiceNameL4: string;

  SegmentNameL1: string;
  SegmentNameL2: string;
  SegmentNameL3: string;
  SegmentNameL4: string;

  TicketNumber: string;
  IsBlinking: boolean;
  Type: ActionTypes;
  LastCallTime: number;
}
