import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import io from 'socket.io-client';
import { ConnectionSettings } from '../models/connection';
import { Message } from '../models/message';
import { EventsService } from './events.service';
import { LoggerService } from './logger.service';
import { CacheService } from './cache.service';

@Injectable()
export class CommunicationService {
  socket: any;

  /**
  * @constructor
  * @summary initialize Connection Settings and listen to MQ using socket.io
  * @param {HttpClient} http - The http object used to make http calls
  */
  constructor(private http: HttpClient, private eventsService: EventsService,
    private logger: LoggerService, private cacheService: CacheService) {
  }

  /**
   * @async
   * @summary - connect socket io to the endpoint and listen to some events
   * @param {string} token - string token to connect with endpoint
   */
  async initializeSocketIO(token: string): Promise<void> {
    try {
      this.socket = io('/', { query: "token=" + JSON.stringify(token) });

      this.socket.on('Queuing/branchUpdates', (evt) => {
        this.eventsService.updateData.emit(evt);
      });

      this.socket.on('ComponentService/component_Configuration_Changed', (evt) => {
        this.eventsService.updateConfig.emit(evt);
      });

      this.socket.on('ComponentService/Execute_Command', (evt) => {
        this.eventsService.exuteCommand.emit(evt);
      });

      this.socket.on('disconnect', () => {
        this.eventsService.onDisconnect.emit();
      });

      this.socket.on('error', (pError: any) => {
        let error = JSON.parse(pError);

        if (error.status && error.status == 401) {
          this.eventsService.unAuthorized.emit(error);
          console.log(error)
        }
      });

    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - close Socket.io connection
   */
  async closeSocketIO(): Promise<void> {
    try {
      this.socket.disconnect();
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @async
  * @summary - Make a post request to the End point
  * @param {any} payload - the payload various by topic name.
  * @param {string} topicName - The ID of a branch.
  * @return {Promise<object>} - response message wrapped in a promise.
  */
  async post(payload: any, topicName: string): Promise<object> {
    let reqMessage = new Message();
    reqMessage.time = Date.now();
    reqMessage.topicName = topicName;
    reqMessage.payload = payload;

    let token = this.cacheService.getUser().token;

    return await this.http.post<any>(ConnectionSettings.postMessage, reqMessage, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      })
    })
      .toPromise()
      .catch(catchError(this.handleError));
  }

  /**
   * @async
   * @summary - Make a post request to the End point used for Authentication
   * @param {string} url - the url to send the request to
   * @param {any} body - the body of the request
   * @param {any} options - object may contain headers or parameters etc.
   * @return {Promise<any>} - return response object wrapped in a promise.
   */
  async AuthPost(url: string, body: any, options?: any) {
    try {

      return await this.http.post<any>(url, body, options).toPromise()
      .catch(catchError(this.handleError));

    } catch (error) {
      this.logger.error(error);
    }
  }

 /**
 * @private
 * @summary - Handles Error catched from http request
 * @param {HttpErrorResponse} err - the payload various by topic name.
 * @return {Promise<never>}  Result enum wrapped in a promise.
 */
  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';

    if (err.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }

    return throwError(errorMessage);
  }
}
