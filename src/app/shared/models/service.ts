import { BaseObjectEntity } from "./base-object-entity";

export class Service extends BaseObjectEntity {

  constructor(id: number, nameL1: string, nameL2: string, nameL3: string, nameL4: string) {
    super(id, nameL1, nameL2, nameL3, nameL4);
  }
}
