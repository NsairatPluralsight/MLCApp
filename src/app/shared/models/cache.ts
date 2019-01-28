import { Segment } from './segment';
import { Counter, CounterInfo } from './countersInfo';
import { Service } from './service';
import { User } from './user';
import { Hall } from './hall';
import { CSComponent } from './cs-component';

export class LCDCache {
  segments: Segment[];
  counters: Counter[];
  services: Service[];
  users: User[];
  halls: Hall[];
  countersInfo: CounterInfo[];
  mainLCD: CSComponent;
}
