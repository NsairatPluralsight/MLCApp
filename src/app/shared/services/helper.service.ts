import { Injectable } from '@angular/core';
import { Result } from '../models/enums';
import { Message } from '../models/message';
import { LoggerService } from './logger.service';

@Injectable()
export class HelperService {
  lcdDesign: any[];

  constructor(private logger: LoggerService) { }

  /**
  * @param {Date} lastCallTime - the date time of the last call has been made on a counter
  * @returns {Promise<boolean>} returns whether the counter should be Blinking or not in the UI wrapped in a promise.
  */
 async isBlinking(lastCallTime: Date): Promise<boolean> {
  try {
    let isBlinking = false;

    if (lastCallTime) {
      let updateTime = new Date();
      let timeDifference = 0;

      if (window['lastUpdateTime']) {
        updateTime = window['lastUpdateTime'];
        timeDifference = new Date().getTime() - updateTime.getTime();
      }

      let tmpTimeDiffResult = updateTime.getTime() - lastCallTime.getTime();
      let tmpMiliSeconds = tmpTimeDiffResult - timeDifference;
      let tmpDiffSeconds = tmpMiliSeconds / 1000;

      let blinkingCounts = window['blinkingCounts'] ? window['blinkingCounts'] : 5;
      let blinkingInterval = window['blinkingInterval'] ? window['blinkingInterval'] : 2;

      let TotalBlinkingTime = blinkingCounts * blinkingInterval
      if (tmpDiffSeconds < TotalBlinkingTime) {
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
async setLastUpdateTime(): Promise<void> {
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
* @return {any}
*/
getLCDDesign() {
  try {
    let result = Result.Failed;
    if (window['LCDElement']) {
      this.lcdDesign = window['LCDElement'];
      result = Result.Success;
    }
    return result;
  } catch (error) {
    this.logger.error(error);
    return Result.Failed;
  }
}

/**
* @param {Message} message - the command message received by the event
* @returns {string} returns the command text that received in message or empty string
*/
getCommandText(message: Message): string {
  try {
    let text = '';
    if (message.payload) {
      if (message.payload.data) {
        text = message.payload.data;
      }
    }
    return text;
  } catch (error) {
    this.logger.error(error);
    return '';
  }
}

/**
* @async
* @summary check if this message belongs to this component or not
* @param {Message} message - the message received by the update event
* @param {number} id - the mainLCd component ID
* @returns {Promise<Result>} Result enum wrapped in a promise.
*/
async checkMessage(message: Message, id: number): Promise<Result> {
  try {
    let result = Result.Failed;
    if (message.payload && message.payload.componentID == id) {
      if (message.payload.data) {
        result = Result.Success;
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
* @summary check if this message contains counters or not
* @param {Message} message - the message received
* @returns {Promise<Result>} Result enum wrapped in a promise.
*/
async checkCounters(message: Message): Promise<Result> {
  try {
    let result = Result.Failed;
    if (message.payload) {
      if (message.payload.countersInfo && message.payload.countersInfo.length > 0) {
        result = Result.Success;
      }
    }
    return result;
  } catch (error) {
    this.logger.error(error);
    return Result.Failed
  }
}

}
