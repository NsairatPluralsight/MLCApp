export class User {
  id: number;
  loginName: string;
  nameL1: string;
  nameL2: string;
  nameL3: string;
  nameL4: string;
  constructor(id: number, loginName: string, nameL1: string, nameL2: string, nameL3: string,
    nameL4: string) {
    this.id = id;
    this.loginName = loginName;
    this.nameL1 = nameL1;
    this.nameL2 = nameL2;
    this.nameL3 = nameL3;
    this.nameL4 = nameL4;
  }
}

export class loginUser {
  id: number;
  username: string;
  refreshToken: string;
  password: string;
}

export class AuthUser {
  user: loginUser;
  token: string;
}
