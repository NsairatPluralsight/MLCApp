import { Injectable } from '@angular/core';

@Injectable()
export class LoggerService {

  constructor() { }

  /**
  * log error to the browser console
  * @param {error} error - the error that will be logged.
  */
  error(error: Error): void {
    console.error('name: ' + error.name + ' message: ' + error.message + ' stack trace: ' + error.stack);
  }
}
