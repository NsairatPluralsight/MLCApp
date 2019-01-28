import { Injectable } from '@angular/core';
import { CounterInfo } from '../shared/models/countersInfo';
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

@Injectable()
export class LCDInfoService {
  lcdDesign: any[];
  lcdData: LCDInfo[];
  pageData: LCDInfo[];
  playerID: number;
  branchID: number;
  pagesNumber: number;
  currentPage: number;

  /**
  * listen to the events
  * @constructor
  * @param {LoggerService} logger - the logger object which used to log errors
  * @param {CacheManagerService} configuration - theCacheManager object which used to set the cache
  * @param {CacheService} cacheService - the cacheService object which used to set and get the cache
  * @param {StateService} stateService - the state object which used to set and get the status of the app
  * @param {EventsService} eventsService - the eventsService object which used to listen to app events
  */
  constructor(private logger: LoggerService, private configuration: CacheManagerService,
    private cacheService: CacheService, private stateService: StateService, private eventsService: EventsService) {
    this.eventsService.updateData.subscribe((result) => this.update(result));
    this.eventsService.updateConfig.subscribe((result) => this.updateConfig(result));
    this.eventsService.onDisconnect.subscribe(() => {
      if (this.stateService.getStatus() !== LCDStatus.Offline) {
        this.stateService.setStatus(LCDStatus.Offline);
        this.start(this.playerID);
      }
    });
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

        result = this.updateLCDResult();

        if (result === Result.Success) {

          result = this.setLCDDesign();

          if (result === Result.Success) {
            this.setLastUpdateTime();
            this.refreshCache();
            return Result.Success;
          } else {
            return Result.Failed;
          }
        } else {
          return Result.Failed;
        }
      } else {
        return Result.Failed;
      }
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
  * @summary sets the lcdData array which is used by the UI
  * @returns {Result} Result enum;
  */
  updateLCDResult(): Result {
    try {
      let cache = this.cacheService.getCache();
      this.lcdData = this.getLCDData(cache);

      if (this.lcdData) {
        if (cache.mainLCD.configuration.enablePaging) {
          this.currentPage = 1;
          this.handlePaging(true);
        } else {
          this.pageData = this.lcdData;
        }
        return Result.Success;
      } else {
        return Result.Failed;
      }
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
  * @summary updates the cache counters info and the LCDInfo object
  * @param {Message} result - the Message object which sent by the server update event
  */
  update(result: Message): void {
    try {
      if (result.payload) {
        if (result.payload.countersInfo && result.payload.countersInfo.length > 0) {
          let countersInfo = result.payload.countersInfo;
          let counters = this.prepareCounterData(countersInfo);
          let cache = this.cacheService.getCache();

          cache.countersInfo = counters;

          this.filterCounters();

          cache.countersInfo = this.updateCounters(counters, cache.countersInfo);
          this.cacheService.setCache(cache);

          let updateResult = this.updateLCDResult();

          if (updateResult === Result.Success) {
            this.setLastUpdateTime();
          }
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @summary updates the cache configuration info and the LCDInfo object
  * @param {Message} result - the Message object which sent by the Component Service update event
  */
  updateConfig(result: Message): void {
    try {
      let cache = this.cacheService.getCache();
      if (result.payload && result.payload.componentID == cache.mainLCD.id) {
        if (result.payload.data) {
          let mainLCDConfig = <MainLCDConfiguration>JSON.parse(result.payload.data);

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

              let updateResult = this.updateLCDResult();

              if (updateResult === Result.Success) {
                this.setLastUpdateTime();
              }
            }
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * Updates the cache from server
  * if failed emits the status update event
  * @async
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
  getLCDData(cache: LCDCache): LCDInfo[] {
    try {
      let lcdInfo = new Array<LCDInfo>();
      for (let counter of cache.countersInfo) {
        if (counter && counter.displayTicketNumber) {
          let lcdCounter = new LCDInfo();

          /** map the counter info  */
          if (cache.counters && counter.counterID) {
            let tmpCounter = cache.counters.find(i => i.id.toString() === counter.counterID.toString());
            if (tmpCounter) {
              lcdCounter.CounterNameL1 = tmpCounter.nameL1;
              lcdCounter.CounterNameL2 = tmpCounter.nameL2;
              lcdCounter.CounterNameL3 = tmpCounter.nameL3;
              lcdCounter.CounterNameL4 = tmpCounter.nameL4;
              lcdCounter.CounterNumber = tmpCounter.number;
              lcdCounter.CounterDirection = tmpCounter.direction;
            }
          }

          /** map the service info  */
          if (cache.services && counter.serviceID) {
            let tmpService = cache.services.find(i => i.id.toString() === counter.serviceID.toString());
            if (tmpService) {
              lcdCounter.ServiceNameL1 = tmpService.nameL1;
              lcdCounter.ServiceNameL2 = tmpService.nameL2;
              lcdCounter.ServiceNameL3 = tmpService.nameL3;
              lcdCounter.ServiceNameL4 = tmpService.nameL4;
            }
          }

          /** map the segment info  */
          if (cache.segments && counter.segmentID) {
            let tmpSegment = cache.segments.find(i => i.id.toString() === counter.segmentID.toString());
            if (tmpSegment) {
              lcdCounter.SegmentNameL1 = tmpSegment.nameL1;
              lcdCounter.SegmentNameL2 = tmpSegment.nameL2;
              lcdCounter.SegmentNameL3 = tmpSegment.nameL3;
              lcdCounter.SegmentNameL4 = tmpSegment.nameL4;
            }
          }

          /** map the hall info  */
          if (cache.halls && counter.hallID) {
            let tmpHall = cache.halls.find(i => i.id.toString() === counter.hallID.toString());
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

          /** map the user info  */
          if (cache.users && counter.userID) {
            let tmpUser = cache.users.find(i => i.id.toString() === counter.userID.toString());
            if (tmpUser) {
              lcdCounter.ServingEmployeeName = tmpUser.loginName;
            }
          }

          lcdCounter.LastCallTime = counter.lastCallTime;
          lcdCounter.Type = counter.activityType;
          lcdCounter.TicketNumber = counter.displayTicketNumber;
          lcdCounter.IsBlinking = this.isBlinking(new Date(counter.lastCallTime));
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
            return (new CounterInfo(counter.id, type, this.branchID.toString()));
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

      if (mainLCDConfig.countersOption == CountersOption.Custom) {

        cache.counters = cache.counters.filter(element => {
          if(mainLCDConfig.counters.findIndex(e => e.id === element.id) > -1) {
            return element;
          }})
          .map(element => {
            element.direction = mainLCDConfig.counters.find(c => c.id === element.id).direction
            return element;
          });

        cache.countersInfo = cache.countersInfo.filter(element => {
          if(mainLCDConfig.counters.findIndex(e => e.id === element.counterID) > -1) {
            return element;
          }});

        this.cacheService.setCache(cache);
      }

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

      if(this.currentPage > this.pagesNumber) {
        this.currentPage= 1;
      }

      let startIndex = (this.currentPage - 1) * pageSize;
      let endIndex = Math.min(startIndex + pageSize - 1, this.lcdData.length - 1);

      this.pageData = this.lcdData.slice(startIndex , endIndex + 1);
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
  * @param {Date} lastCallTime - the date time of the last call has been made on a counter
  * @returns {boolean} returns whether the counter should be Blinking or not in the UI
  */
  isBlinking(lastCallTime: Date): boolean {
    try {
      let isBlinking = false;

      if (lastCallTime) {
        let blinkingCounts = 5;
        let blinkingInterval = 2;
        let updateTime = new Date();
        let timeDifference = 0;

        if (window['lastUpdateTime']) {
          updateTime = window['lastUpdateTime'];
          let now = new Date();
          timeDifference = now.getTime() - updateTime.getTime();
        }

        let tmpTimeDiffResult = updateTime.getTime() - lastCallTime.getTime();
        let tmpMiliSeconds = tmpTimeDiffResult - timeDifference;
        let tmpDiffSeconds = tmpMiliSeconds / 1000;

        if (window['blinkingCounts']) {
          blinkingCounts = window['blinkingCounts'];
          blinkingInterval = window['blinkingInterval'];
        }

        if (tmpDiffSeconds < blinkingCounts * blinkingInterval) {
          isBlinking = true;
        }
      }
      return isBlinking;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  /**
  * Sets the last update time which is needed in isBlinking method
  */
  setLastUpdateTime(): void {
    try {
      if (window['lastUpdateTime']) {
        window['lastUpdateTime'] = new Date();
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * Gets the LCD columns the the customer want to display
  * @return {Result} Result enum.
  */
  setLCDDesign(): Result {
    try {
      if (window['LCDElement']) {
        this.lcdDesign = window['LCDElement'];

        return Result.Success;
      } else {
        return Result.Failed;
      }
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
  * Calls the fetchCache method every 10 minutes
  */
  refreshCache(): void {
    try {
      setTimeout(this.fetchCache.bind(this), 600000);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @param {Message} result - the command message received by the event
  * @returns {string} returns the command text that received in message or empty string
  */
  getCommandText(result: Message): string {
    try {
      let text = '';
      if (result.payload) {
        if (result.payload.data) {
          text = result.payload.data;
        }
      }
      return text;
    } catch (error) {
      this.logger.error(error);
      return '';
    }
  }
}