import { Counter } from "./countersInfo";
import { MainLCDDisplayMode } from "./enums";

export class CSComponent {
  id: number;
  orgID: number;
  typeName: string;
  name_L1: string;
  name_L2: string;
  name_L3: string;
  name_L4: string;
  queueBranch_ID: number;
  reportedData: string;
  configuration: MainLCDConfiguration;
  relatedClassName: string;
  relatedObject_ID: number;
  identity: string;
  address: string;
  description: string;
  creationTime: any;
  lastUpdateTime: any;
}

export class MainLCDConfiguration {
  countersOption: CountersOption;
  counters: any[];
  displayMode: MainLCDDisplayMode;
  allServicesSelected: boolean;
  enablePaging: boolean;
  idleTimeForPaging: number;
  pageDuration: number;
  services: number[];
}

export enum CountersOption {
  All = 0,
  Custom  = 1
}
