export class Hall {
  id: number;
  nameL1: string;
  nameL2: string;
  nameL3: string;
  nameL4: string;
  guidingTextL1: string;
  guidingTextL2: string;
  guidingTextL3: string;
  guidingTextL4: string;
  color: string;

  constructor(id: number, nameL1: string, nameL2: string, nameL3: string, nameL4: string,
    guidingTextL1: string, guidingTextL2: string, guidingTextL3: string, guidingTextL4: string, color: string) {
    this.id = id;
    this.nameL1 = nameL1;
    this.nameL2 = nameL2;
    this.nameL3 = nameL3;
    this.nameL4 = nameL4;
    this.guidingTextL1 = guidingTextL1;
    this.guidingTextL2 = guidingTextL2;
    this.guidingTextL3 = guidingTextL3;
    this.guidingTextL4 = guidingTextL4;
    this.color = color;
  }
}
