import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StateService } from '../shared/services/state.service';
import { LoggerService } from '../shared/services/logger.service';
import { LCDStatus, Result } from '../shared/models/enums';
import { LCDInfoService } from './lcd-info.service';
import { EventsService } from '../shared/services/events.service';
import { Message } from '../shared/models/message';
import { HelperService } from '../shared/services/helper.service';

@Component({
  selector: 'app-lcd-list',
  templateUrl: './lcd-list.component.html',
  styleUrls: ['./lcd-list.component.css']
})
export class LCDListComponent implements OnInit {
  showLoading: boolean;
  commandText: string;
  showCommandText: boolean;
  showErrorIcon:boolean;

  /**
  * listens to update App status event
  * @constructor
  * @param {LoggerService} logger - the logger object which used to log errors
  * @param {LCDInfoService} lcdService - the lcdService object which used for binding
  * @param {StateService} statusService - the state object which used to set and get the status of the app
  * @param {ActivatedRoute} route - the route object which used to access the query parameters
  */
  constructor(private route: ActivatedRoute, public lcdService: LCDInfoService, private stateService: StateService,
     private logger: LoggerService, private eventsService: EventsService, private helperService: HelperService) {
      this.eventsService.statusUpdate.subscribe(() => this.onAppStatusChange());
      this.eventsService.exuteCommand.subscribe((message) => this.handleCommand(message));
      this.eventsService.unAuthenticated.subscribe(() => this.showErrorIcon = true);
  }

   /**
  * Checks if App status is online if not it will redirect to Loading page
  */
  async ngOnInit() {
    try {
      this.showLoading = true;
      await this.route.queryParams.subscribe(async params => {
        if (params && params.pID && params.pUser && params.pPassword) {
          let result = await this.lcdService.Authenticate(params.pUser, params.pPassword);

          if(result == Result.Success) {
            await this.lcdService.start(parseInt(params.pID));
          }
        }
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   *  this functions triggered when App status changed
   *  and it will Toggle the loading component
   */
  onAppStatusChange() {
    try {
      switch (this.stateService.getStatus()) {
        case LCDStatus.Online:
            this.showLoading = false;
            this.showErrorIcon = false;
        break;
        case LCDStatus.Connecting:
        case LCDStatus.Offline:
        this.showLoading = true;
        break;
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

    /**
   *  this functions triggered when Command received
   *  and it will Toggle the command container div
   */
  handleCommand(message: Message) {
    try {
      this.commandText = this.helperService.getCommandText(message);
      if (this.commandText && this.commandText != '') {
        this.showCommandText = true;
        setTimeout(() => this.showCommandText = false , 20000);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}
