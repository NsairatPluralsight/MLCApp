import { Injectable } from '@angular/core';
import { CounterInfo, Counter } from '../shared/models/countersInfo';
import { ActionTypes, LCDStatus, Result } from '../shared/models/enums';
import { LCDInfo } from '../shared/models/LCDInfo';
import { LCDCache } from '../shared/models/cache';
import { LoggerService } from '../shared/services/logger.service';
import { Message } from '../shared/models/message';
import { CacheManagerService } from '../shared/services/cacheManager.service';
import { CacheService } from '../shared/services/cache.service';
import { StateService } from '../shared/services/state.service';
import { CountersOption, MainLCDConfiguration } from '../shared/models/cs-component';
import { EventsService } from '../shared/services/events.service';
import { Service } from '../shared/models/service';
import { Segment } from '../shared/models/segment';
import { Hall } from '../shared/models/hall';
import { HelperService } from '../shared/services/helper.service';
import { User } from '../shared/models/user';
import { AuthenticationService } from '../shared/services/authentication.service';

@Injectable()
export class LCDInfoService {
  lcdData: LCDInfo[];
  pageData: LCDInfo[];
  playerID: number;
  branchID: number;
  pagesNumber: number;
  currentPage: number;
  lcdDesign: any[];

  /**
  * listen to the events
  * @constructor
  * @param {LoggerService} logger - the logger object which used to log errors
  * @param {CacheManagerService} configuration - theCacheManager object which used to set the cache
  * @param {CacheService} cacheService - the cacheService object which used to set and get the cache
  * @param {StateService} stateService - the state object which used to set and get the status of the app
  * @param {EventsService} eventsService - the eventsService object which used to listen to app events
  */
  constructor(private logger: LoggerService, private configuration: CacheManagerService, private cacheService: CacheService,
    private stateService: StateService, private eventsService: EventsService, private helperService: HelperService, private AuthService: AuthenticationService) {
    this.eventsService.updateData.subscribe((result) => this.update(result));
    this.eventsService.updateConfig.subscribe((result) => this.updateConfig(result));
    this.eventsService.onDisconnect.subscribe(() => {
      if (this.stateService.getStatus() !== LCDStatus.Offline) {
        this.stateService.setStatus(LCDStatus.Offline);
        this.start(this.playerID);
      }
    });
    this.eventsService.startApp.subscribe(() => this.start(this.playerID));
  }

  /**
   *
   * @param userName
   * @param password
   */
  async Authenticate(userName: string, password: string) {
    try {
      let result = await this.AuthService.login(userName, password);
      return result;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary initialize the App and retry if failed
   * @param {number} branchID - the Id of the Branch
   */
  async start(playerID: number) {
    try {
      this.playerID = playerID;
      let result = await this.initialize();

      if (result === Result.Success) {
        this.stateService.setStatus(LCDStatus.Online);
      } else {
        this.stateService.setStatus(LCDStatus.Connecting);
        setTimeout(() => this.start(this.playerID), 30000);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @async
  * @summary initialize the app cache and events
  * @returns {Promise<Result>} Result enum wrapped in a promise.
  */
  async initialize(): Promise<Result> {
    try {
      let result = await this.configuration.intialaize(this.playerID);

      if (result === Result.Success) {
        this.cacheService.setCache(this.configuration.configData);

        this.filterCounters();

        result = await this.updateLCDResult();

        if (result === Result.Success) {

          result = this.helperService.getLCDDesign();

          if (result === Result.Success) {
            this.lcdDesign = this.helperService.lcdDesign;
            this.helperService.setLastUpdateTime();
            this.refreshCache();
            return Result.Success;
          }
        }
      }
      return result;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
  * @async
  * @summary sets the lcdData array which is used by the UI
  * @returns {Promise<Result>} Result enum wrapped in a promise.
  */
  async updateLCDResult(): Promise<Result> {
    try {
      let cache = this.cacheService.getCache();
      this.lcdData = await this.getLCDData(cache);

      if (this.lcdData) {
        if (cache.mainLCD.configuration.enablePaging) {
          this.currentPage = 1;
          this.handlePaging(true);
        } else {
          this.pageData = this.lcdData;
        }
        return Result.Success;
      }

      return Result.Failed;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
  * @summary updates the cache counters info and the LCDInfo object
  * @param {Message} message - the Message object which sent by the server update event
  */
  async update(message: Message): Promise<void> {
    try {
      let result = await this.helperService.checkCounters(message);
      if (result == Result.Success) {
        let countersInfo = message.payload.countersInfo;
        let counters = this.prepareCounterData(countersInfo);
        let cache = this.cacheService.getCache();

        //cache.countersInfo = counters;

        cache.countersInfo = this.updateCounters(counters, cache.countersInfo);

        this.filterCounters();
        this.cacheService.setCache(cache);

        let updateResult = await this.updateLCDResult();

        if (updateResult === Result.Success) {
          this.helperService.setLastUpdateTime();
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @async
  * @summary updates the cache configuration info and the LCDInfo object
  * @param {Message} message - the Message object which sent by the Component Service update event
  */
  async updateConfig(message: Message): Promise<void> {
    try {
      let cache = this.cacheService.getCache();
      let isValidMessage = await this.helperService.checkMessage(message, cache.mainLCD.id);

      if (isValidMessage == Result.Failed) {
        return;
      }

      let mainLCDConfig = <MainLCDConfiguration>JSON.parse(message.payload.data);
      let isThereNewCounter = false;

      mainLCDConfig.counters.forEach(element => {
        if (cache.mainLCD.configuration.counters.findIndex(e => e.id === element.id) == -1) {
          isThereNewCounter = true;
        }
      });

      if (isThereNewCounter) {
        this.fetchCache();
      } else {
        cache.mainLCD.configuration = mainLCDConfig;
        this.cacheService.setCache(cache);
        this.filterCounters();

        let updateResult = await this.updateLCDResult();

        if (updateResult === Result.Success) {
          this.helperService.setLastUpdateTime();
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @async
  * @summary Updates the cache from server if failed emits the status update event
  */
  async fetchCache(): Promise<void> {
    try {
      let result = await this.initialize();

      if (result !== Result.Success) {
        this.stateService.setStatus(LCDStatus.Offline);
        this.logger.error(new Error('Fetch Chache failed'));
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * Maps the LCDInfo object using the cache
  * @param {LCDCache} cache - the cache object which is cached by the app
  * @returns {LCDInfo[]} returns an array which contains the LCDInfo objects for the UI
  */
  async getLCDData(cache: LCDCache): Promise<LCDInfo[]> {
    try {
      let lcdInfo = new Array<LCDInfo>();
      for (let counter of cache.countersInfo) {
        if (counter && counter.displayTicketNumber) {
          let lcdCounter = new LCDInfo();

          /** map the counter info  */
          await this.fillCounterData(lcdCounter, cache.counters, counter.counterID.toString());

          /** map the service info  */
          await this.fillServiceData(lcdCounter, cache.services, counter.serviceID);

          /** map the segment info  */
          await this.fillSegmentData(lcdCounter, cache.segments, counter.segmentID);

          /** map the hall info  */
          await this.fillHallData(lcdCounter, cache.halls, counter.hallID);

          /** map the user info  */
          await this.fillUserData(lcdCounter, cache.users, counter.userID);

          lcdCounter.LastCallTime = new Date(counter.lastCallTime).getTime();
          lcdCounter.Type = counter.activityType;
          lcdCounter.TicketNumber = counter.displayTicketNumber;
          lcdCounter.IsBlinking = await this.helperService.isBlinking(new Date(counter.lastCallTime));
          lcdInfo.push(lcdCounter);
        }
      }
      return lcdInfo.sort((obj1, obj2) => obj2.LastCallTime - obj1.LastCallTime);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @param {any[]} countersInfo - the array of countersInfo as it is from server
  * @returns {CounterInfo[]} returns an array which contains the Extracted conters Info
  */
  prepareCounterData(countersInfo: any[]): CounterInfo[] {
    try {
      let counters = Array<CounterInfo>();

      counters = countersInfo.map((counter) => {
        if (counter.currentState) {
          let type = +counter.currentState.activityType;
          /* Create CounterInfo based on the currentState type because attributes differ based on type  */

          if (type === ActionTypes.Serving) {
            let counterTransaction = counter.currentTransaction;

            return (new CounterInfo(counter.id, type, counterTransaction.queueBranch_ID, counterTransaction.id,
              counterTransaction.displayTicketNumber, counterTransaction.hall_ID, counterTransaction.segment_ID,
              counterTransaction.service_ID, counterTransaction.user_ID, counterTransaction.lastCallTime));
          } else {
            return (new CounterInfo(counter.id, type, this.configuration.branchID.toString()));
          }
        }
      });

      return counters;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @param {CounterInfo[]} newCountersList - the array of countersInfo which has been received by the update event
  * @param {CounterInfo[]} currentCounters - the array of countersInfo which is cached in the app
  * @returns {CounterInfo[]} returns an array which contains the updates
  */
  updateCounters(newCountersList: CounterInfo[], currentCounters: CounterInfo[]): CounterInfo[] {
    try {
      if (!currentCounters) {
        currentCounters = new Array<CounterInfo>();
      }

      newCountersList.forEach(element => {
        let index = currentCounters.map(function (item) { return item.counterID; }).indexOf(element.counterID);

        if (index > -1 && element.activityType === ActionTypes.Serving) {
          currentCounters[index] = element;
        } else if (index > -1) {
          currentCounters.splice(index, 1);
        } else if (index <= -1 && element.activityType === ActionTypes.Serving) {
          currentCounters.push(element);
        }
      });

      return currentCounters;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @summary remove counters that not assigned to this LCD accourding to the config and add direction
  */
  filterCounters(): void {
    try {
      let cache = this.cacheService.getCache();
      let mainLCDConfig = cache.mainLCD.configuration;

      if (mainLCDConfig.countersOption !== CountersOption.Custom) {
        return;
      }

      cache.counters = cache.counters.filter(element => {
        if (mainLCDConfig.counters.findIndex(e => e.id === element.id) > -1) {
          return element;
        }
      })
        .map(element => {
          element.direction = mainLCDConfig.counters.find(c => c.id === element.id).direction
          return element;
        });

      cache.countersInfo = cache.countersInfo.filter(element => {
        if (mainLCDConfig.counters.findIndex(e => e.id.toString() == element.counterID.toString()) > -1) {
          return element;
        }
      });

      this.cacheService.setCache(cache);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @summary enable paging
  */
  handlePaging(isFirstTime: boolean): void {
    try {
      let pageSize = 10;
      this.pagesNumber = Math.ceil(this.lcdData.length / pageSize);

      if (this.currentPage > this.pagesNumber) {
        this.currentPage = 1;
      }

      let startIndex = (this.currentPage - 1) * pageSize;
      let endIndex = Math.min(startIndex + pageSize - 1, this.lcdData.length - 1);

      this.pageData = this.lcdData.slice(startIndex, endIndex + 1);
      this.currentPage++;

      let cache = this.cacheService.getCache();

      let duration = isFirstTime ? cache.mainLCD.configuration.idleTimeForPaging : cache.mainLCD.configuration.pageDuration;

      setTimeout(() => {
        this.handlePaging(false);
      }, duration * 1000);

    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @summary Calls the fetchCache method every 10 minutes
  */
  refreshCache(): void {
    try {
      setTimeout(this.fetchCache.bind(this), 600000);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary check if counters is valid and get the mainLCD view data from it
   * @param {LCDInfo} lcdCounter - object to be filled
   * @param {Counter[]} counters - the counter array received from queuing
   * @param {string} counterID - the cached counter id to fill
   */
  async fillCounterData(lcdCounter: LCDInfo, counters: Counter[], counterID: string): Promise<void> {
    try {
      if (counters && counterID) {
        let tmpCounter = counters.find(i => i.id.toString() === counterID.toString());
        if (tmpCounter) {
          lcdCounter.CounterNameL1 = tmpCounter.nameL1;
          lcdCounter.CounterNameL2 = tmpCounter.nameL2;
          lcdCounter.CounterNameL3 = tmpCounter.nameL3;
          lcdCounter.CounterNameL4 = tmpCounter.nameL4;
          lcdCounter.CounterNumber = tmpCounter.number;
          lcdCounter.CounterDirection = tmpCounter.direction;
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary check if services is valid and get the mainLCD view data from it
   * @param {LCDInfo} lcdCounter - object to be filled
   * @param {Service[]} Service - the Service array received from queuing
   * @param {string} Service - the cached counter id to fill
   */
  async fillServiceData(lcdCounter: LCDInfo, services: Service[], serviceID: string): Promise<void> {
    try {
      if (services && serviceID) {
        let tmpService = services.find(i => i.id.toString() === serviceID.toString());
        if (tmpService) {
          lcdCounter.ServiceNameL1 = tmpService.nameL1;
          lcdCounter.ServiceNameL2 = tmpService.nameL2;
          lcdCounter.ServiceNameL3 = tmpService.nameL3;
          lcdCounter.ServiceNameL4 = tmpService.nameL4;
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
 * @async
 * @summary check if segments is valid and get the mainLCD view data from it
 * @param {LCDInfo} lcdCounter - object to be filled
 * @param {Segment[]} segments - the segments array received from queuing
 * @param {string} segmentID - the cached segment id to fill
 */
  async fillSegmentData(lcdCounter: LCDInfo, segments: Segment[], segmentID: string): Promise<void> {
    try {
      if (segments && segmentID) {
        let tmpSegment = segments.find(i => i.id.toString() === segmentID.toString());
        if (tmpSegment) {
          lcdCounter.SegmentNameL1 = tmpSegment.nameL1;
          lcdCounter.SegmentNameL2 = tmpSegment.nameL2;
          lcdCounter.SegmentNameL3 = tmpSegment.nameL3;
          lcdCounter.SegmentNameL4 = tmpSegment.nameL4;
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary check if halls is valid and get the mainLCD view data from it
   * @param {LCDInfo} lcdCounter - object to be filled
   * @param {Hall[]} halls - the halls array received from queuing
   * @param {string} hallID - the cached hall id to fill
   */
  async fillHallData(lcdCounter: LCDInfo, halls: Hall[], hallID: string): Promise<void> {
    try {
      if (halls && hallID) {
        let tmpHall = halls.find(i => i.id.toString() === hallID.toString());
        if (tmpHall) {
          lcdCounter.HallNameL1 = tmpHall.nameL1;
          lcdCounter.HallNameL2 = tmpHall.nameL2;
          lcdCounter.HallNameL3 = tmpHall.nameL3;
          lcdCounter.HallNameL4 = tmpHall.nameL4;
          lcdCounter.HallColor = tmpHall.color;
          lcdCounter.HallGuidingTextL1 = tmpHall.guidingTextL1;
          lcdCounter.HallGuidingTextL2 = tmpHall.guidingTextL2;
          lcdCounter.HallGuidingTextL3 = tmpHall.guidingTextL3;
          lcdCounter.HallGuidingTextL4 = tmpHall.guidingTextL4;
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary check if users is valid and get the mainLCD view data from it
   * @param {LCDInfo} lcdCounter - object to be filled
   * @param {User[]} users - the users array received from queuing
   * @param {string} userID - the cached user id to fill
   */
  async fillUserData(lcdCounter: LCDInfo, users: User[], userID: string): Promise<void> {
    try {
      if (users && userID) {
        let tmpUser = users.find(i => i.id.toString() === userID.toString());
        if (tmpUser) {
          lcdCounter.ServingEmployeeName = tmpUser.loginName;
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}
