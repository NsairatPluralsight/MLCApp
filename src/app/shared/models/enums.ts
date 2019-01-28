export enum MainLCDDisplayMode {
  CurrentCustomer = 0,
  WithWaiting = 1
}

export enum Result {
  Success = 0,
  Failed = -1
}

export enum LCDStatus {
  Offline = 0,
  Connecting = 1,
  Online = 2
}

export enum ActionTypes {
  LoggedIn = 1,
  NotReady = 2,
  Ready = 3,
  Break = 4,
  Serving = 5,
  InsideCalenderLoggedOff = 6,
  OutsideCalenderLoggedOff = 7,
  TicketDispensing = 8,
  Processing = 9,
  Custom = 10,
  Supervising = 11,
  NoCallServing = 12
}

export enum Direction {
  None = 0,
  Right = 1,
  Left = 2
}
