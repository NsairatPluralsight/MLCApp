export class RequestPayload {
  orgid: number;
  counterid: string;
  branchid: string;
  transactionid: string;
  languageindex = 0;
  origin: string;
  serviceid: string;
  segmentid: string;
  componentID: number;
  typeName: string;
  entityName: string;
  relatedObject_ID: number;
}

export class ResponsePayload {
  result: number;
  errorCode: string;
  countersInfo: any[];
  transactionsInfo: any[];
  statisticsInfo: any[];
  data: string;
}

export class ConfigPayload {
  BranchID: string;
  EntityName: string;
  orgid: number;
}
