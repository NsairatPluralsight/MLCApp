import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LCDListComponent } from './lcd-list.component';
import { LoadingComponent } from './loading.component';
import { SharedModule } from '../shared/shared.module';
import { LCDInfoService } from './lcd-info.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    LCDListComponent,
    LoadingComponent
  ],
  providers: [
    LCDInfoService
  ]
})
export class ScreensModule { }
