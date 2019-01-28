import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggerService } from './services/logger.service';
import { CacheService } from './services/cache.service';
import { CacheManagerService } from './services/cacheManager.service';
import { StateService } from './services/state.service';
import { NgIncludeDirective } from './directives/ng-include.directive';
import { CommunicationService } from './services/communication.service';
import { EventsService } from './services/events.service';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [NgIncludeDirective],
  providers: [
    LoggerService,
    CacheService,
    CacheManagerService,
    StateService,
    CommunicationService,
    EventsService
  ],
  exports: [NgIncludeDirective]
})
export class SharedModule { }
