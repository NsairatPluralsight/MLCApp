import { Injectable } from '@angular/core';
import { CommunicationService } from './communication.service';
import { LoggerService } from './logger.service';
import { Counter, CounterInfo } from '../models/countersInfo';
import { Service } from '../models/service';
import { Segment } from '../models/segment';
import { Result, ActionTypes } from '../models/enums';
import { Message } from '../models/message';
import { Hall } from '../models/hall';
import { User } from '../models/user';
import { ConfigPayload, RequestPayload, ResponsePayload } from '../models/payload';
import { LCDCache } from '../models/cache';
import { CSComponent, MainLCDConfiguration } from '../models/cs-component';

@Injectable()
export class CacheManagerService {
  counters: Array<Counter>;
  services: Service[];
  segments: Segment[];
  halls: any[];
  users: any[];
  countersInfo: CounterInfo[];
  branchID: number;
  configData: LCDCache;
  mainLCD: CSComponent;
  cMainLCD = "MainLCD";

  /**
  * @constructor
  * @param {CommunicationService} communicationService - The service used to communicate with server.
  * @param {LoggerService} logger - The logger used to log errors.
  */
  constructor(private communicationService: CommunicationService, private logger: LoggerService) {
  }

  /**
  * @async
  * @summary intialaize cache (counters, services, segments, halls, users, countersInfo)
  * @param {number} playerID - The ID of a digital signage Player.
  * @return {Promise<Result>}  Result enum wrapped in a promise.
  */
  async intialaize(playerID: number): Promise<Result> {
    try {
      let result = await this.getComponent(playerID);

      if (result == Result.Success) {
        this.branchID = this.mainLCD.queueBranch_ID;
      }

      result = (result === Result.Success) ? await this.getCounters() : result;

      result = (result === Result.Success) ? await this.getServices() : result;

      result = (result === Result.Success) ? await this.getSegments() : result;

      result = (result === Result.Success) ? await this.getHalls() : result;

      result = (result === Result.Success) ? await this.getUsers() : result;

      result = (result === Result.Success) ? await this.getCountersData() : result;

      this.fillCache();

      return Result.Success;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
  * @summary fill Cache in one object (counters, services, segments, halls, users, countersInfo)
  */
  fillCache(): void {
    try {
      this.configData = {
        segments: this.segments,
        counters: this.counters,
        services: this.services,
        users: this.users,
        halls: this.halls,
        countersInfo: this.countersInfo,
        mainLCD: this.mainLCD
      };
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @async
  * @summary get MainLCD from Component service
  * @return {Promise<CSComponent[]>} CSComponent Object wrapped in a promise.
  */
  async getComponent(playerID: number): Promise<Result> {
    try {
      let requestpayload = new RequestPayload();
      requestpayload.orgid = 1;
      requestpayload.typeName = this.cMainLCD;
      requestpayload.relatedObject_ID = playerID;

      let mainLCD = new CSComponent();

      await this.communicationService.post(requestpayload, 'ComponentService/Manager/GetComponent').then(async (data: Message) => {
        let result = await this.isValidPayload(data);
        if (result == Result.Success) {
          let responsePayload = <ResponsePayload>data.payload;

          if (responsePayload.result == Result.Success) {
            let mainLCDcomponent = (JSON.parse(responsePayload.data)[0]);
            mainLCD = mainLCDcomponent;
            mainLCD.configuration = <MainLCDConfiguration>(JSON.parse(mainLCDcomponent['configuration']));
          } else {
            mainLCD = null;
          }
        } else {
          mainLCD = null;
        }
      });
      this.mainLCD = mainLCD;
      return this.mainLCD ? Result.Success : Result.Failed;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  /**
  * @async
  * @summary get Counters that belongs to a one branch
  * @return {Promise<Counter[]>} Array of Counter Objects wrapped in a promise.
  */
  async getCounters(): Promise<Result> {
    try {
      let payload = this.getConfigPayload('counter');
      let counters = Array<Counter>();

      await this.communicationService.post(payload, 'ExternalData/read').then(async (data: Message) => {
        let result = await this.isValidPayload(data);
        if (result == Result.Success) {
          let countersPayload = data.payload;
          counters = countersPayload.counters.map((c) => {
            return (new Counter(c['ID'], c['Name_L1'], c['Name_L2'], c['Name_L3'], c['Name_L4'], c['Number']));
          });
        } else {
          counters = null;
        }
      });
      this.counters = counters;
      return  this.counters && this.counters.length > 0 ? Result.Success : Result.Failed;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  /**
  * @async
  * @summary get Services that belongs to a one branch
  * @return {Promise<Service[]>} Array of Service Objects wrapped in a promise.
  */
  async getServices(): Promise<Result> {
    try {
      let payload = this.getConfigPayload('service');
      let services = new Array<Service>();

      await (this.communicationService.post(payload, 'ExternalData/read')).then(async (data: Message) => {
        let result = await this.isValidPayload(data);
        if (result == Result.Success) {
          let servicesPayload = data.payload;
          services = servicesPayload.services.map((s) => {
            return (new Service(s['ID'], s['Name_L1'], s['Name_L2'], s['Name_L3'], s['Name_L4']));
          });
        } else {
          services = null;
        }
      });
      this.services = services;
      return  this.services && this.services.length > 0 ? Result.Success : Result.Failed;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @async
  * @summary get Segments that belongs to a one branch
  * @return {Promise<Segment[]>} Array of Segment Objects wrapped in a promise.
  */
  async getSegments(): Promise<Result> {
    try {
      let payload = this.getConfigPayload('segment');
      let segments = new Array<Segment>();

      await (this.communicationService.post(payload, 'ExternalData/read')).then(async (data: Message) => {
        let result = await this.isValidPayload(data);
        if (result == Result.Success) {
          let segmentsPayload = data.payload;
          segments = segmentsPayload.segments.map((s) => {
            return (new Segment(s['ID'], s['Name_L1'], s['Name_L2'], s['Name_L3'], s['Name_L4']));
          });
        } else {
          segments = null;
        }
      });
      this.segments = segments;
      return  this.segments && this.segments.length > 0 ? Result.Success : Result.Failed;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @async
  * @summary get Halls that belongs to a one branch
  * @return {Promise<Hall[]>} Array of Hall Objects wrapped in a promise.
  */
  async getHalls(): Promise<Result> {
    try {
      let payload = this.getConfigPayload('hall');
      let halls = Array<Hall>();

      await (this.communicationService.post(payload, 'ExternalData/read')).then(async (data: Message) => {
        let result = await this.isValidPayload(data);
        if (result == Result.Success) {
          let hallsPayload = data.payload;

          halls = hallsPayload.halls.map((h) => {
            return (new Hall(h['ID'], h['Name_L1'], h['Name_L2'], h['Name_L3'], h['Name_L4'], h['GuidingText_L1'],
              h['GuidingText_L2'], h['GuidingText_L3'], h['GuidingText_L4'], h['Color']));
          });
        } else {
          halls = null;
        }
      });
      this.halls = halls;
      return  this.halls && this.halls.length > 0 ? Result.Success : Result.Failed;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @async
  * @summary get Users that belongs to a one branch
  * @return {Promise<User[]>} Array of User Objects wrapped in a promise.
  */
  async getUsers(): Promise<Result> {
    try {
      let payload = this.getConfigPayload('user');
      let users = new Array<User>();

      await (this.communicationService.post(payload, 'ExternalData/read')).then(async (data: Message) => {
        let result = await this.isValidPayload(data);
        if (result == Result.Success) {
          let usersPayload = data.payload;
          users = usersPayload.users.map((u) => {
            return (new User(u['ID'], u['LoginName'], u['Name_L1'], u['Name_L2'], u['Name_L3'],
              u['Name_L4']));
          });
        } else {
          users = null;
        }
      });
      this.users = users;
      return  this.users && this.users.length > 0 ? Result.Success : Result.Failed;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @async
  * @summary get Counters Data that belongs to a one branch
  * @return {Promise<CounterInfo[]>} Array of CounterInfo Objects wrapped in a promise.
  */
  async getCountersData(): Promise<Result> {
    try {
      let requestpayload = new RequestPayload();
      requestpayload.orgid = 1;
      requestpayload.branchid = this.branchID.toString();
      requestpayload.origin = '0';

      let counterInfo = new Array<CounterInfo>();

      await this.communicationService.post(requestpayload, 'ExternalData/getAllCountersStatus').then(async (data: Message) => {
        let result = await this.isValidPayload(data);
        if (result == Result.Success) {
          if (data.payload.countersInfo) {
            counterInfo = data.payload.countersInfo.map((CI) => {
              if (CI.currentState) {
                let type = +CI.currentState.activityType;
                /* Create CounterInfo based on the currentState type because attributes differ based on type  */
                if (type === ActionTypes.Serving) {
                  return (new CounterInfo(CI.id, type, CI.currentState.queueBranch_ID, CI.currentTransaction.id,
                    CI.currentTransaction.displayTicketNumber, CI.currentTransaction.hall_ID, CI.currentTransaction.segment_ID,
                    CI.currentTransaction.service_ID, CI.currentTransaction.user_ID, CI.currentTransaction.lastCallTime));
                } else {
                  return (new CounterInfo(CI.id, type, CI.currentState.queueBranch_ID));
                }
              }
            });
          } else {
            counterInfo = null;
          }
        } else {
          counterInfo = null;
        }
      });
      this.countersInfo = counterInfo.filter((e) => e !== undefined);;
      return  this.countersInfo && this.countersInfo.length > 0 ? Result.Success : Result.Failed;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @summary create ConfigPayload based on the branch ID and entity name
  * @param {string} entityName - The entity name of the entity you want to get Ex.(user,service) .
  * @return {ConfigPayload} A ConfigPayload Object.
  */
  getConfigPayload(entityName: string): ConfigPayload {
    try {
      let payload = new ConfigPayload();
      payload.BranchID = this.branchID.toString();
      payload.EntityName = entityName;
      payload.orgid = 1;

      return payload;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @summary check if the Payload is valid or not
  * @param {Message} message - The message received.
  * @return { Promise<Result>} Result enum wrapped in a promise.
  */
  async isValidPayload(message: Message): Promise<Result> {
    try {
      let result = Result.Failed;
      if (message) {
        if (message.payload) {
          result = Result.Success;
        }
      }
      return result;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }
}
