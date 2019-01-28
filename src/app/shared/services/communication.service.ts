import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import io from 'socket.io-client';
import { ConnectionSettings } from '../models/connection';
import { Message } from '../models/message';
import { EventsService } from './events.service';

@Injectable()
export class CommunicationService {
  private serviceUrl: string;

  /**
  * initialize Connection Settings and listen to MQ using socket.io
  * @constructor
  * @param {HttpClient} http - The http object used to make http calls
  */
  constructor(private http: HttpClient, private eventsService: EventsService) {
    let connSettings = new ConnectionSettings();
    this.serviceUrl = connSettings.serverURL + 'PostMessage';

    const socket = io(connSettings.serverURL);

    socket.on('Queuing/branchUpdates', (evt) => {
      this.eventsService.updateData.emit(evt);
    });

    socket.on('ComponentService/component_Configuration_Changed', (evt) => {
      this.eventsService.updateConfig.emit(evt);
    });

    socket.on('ComponentService/Execute_Command', (evt) => {
      this.eventsService.exuteCommand.emit(evt);
    });

    socket.on('disconnect', () => {
      this.eventsService.onDisconnect.emit();
    });
  }

  /**
  * Make a post request to the End point
  * @async
  * @param {any} payload - the payload various by topic name.
  * @param {string} topicName - The ID of a branch.
  * @return {Promise<object>}  Result enum wrapped in a promise.
  */
  async post(payload: any, topicName: string): Promise<object> {
    let reqMessage = new Message();
    reqMessage.time = Date.now();
    reqMessage.topicName = topicName;
    reqMessage.payload = payload;

    return await this.http.post<any>(this.serviceUrl, reqMessage, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    })
      .toPromise()
      .catch(catchError(this.handleError));
  }

  /**
  * Handles Error catched from http request
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
