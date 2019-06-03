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
  Online = 2,
  Unauthorized = 3,
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

export enum LoginErrorCodes {
  Success = 0,
  Error = -1,
  InvalidUsername = -900,
  InvalidLoginData = -901,
  UnauthorizedLogin = -902,
  PasswordExpired = -903,
  UserInactive = -904,
  UserLocked = -905,
  InvalidPassword = -906,
  InvalidUserForLogout = -907,
  RefreshTokenNotPresent = -908,
  InvalidToken = -909,
  InvalidRefreshToken = -910,
  SSONotEnabled = -911
}
