import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EventsService } from './events.service';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  constructor(private eventService: EventsService) { }

  /**
   *
   * @param {HttpRequest<any>} req - an outgoing request
   * @param {HttpHandler} next -  the next interceptor in the chain.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    try {
      let cloneReq = req.clone();

      return next.handle(cloneReq).pipe(
        tap(null,
          error => {
          this.handleError(error);
        }));
    } catch (error) {
      throwError(error);
    }
  }

  handleError(error: any) {
    try {
      switch (error.status) {
        case 401:
          this.eventService.unAuthorized.emit(error);
          console.log(error)
          break;
        default:
          return throwError(error.status);
      }
    } catch (error) {
      return throwError(error.status);
    }
  }
}
