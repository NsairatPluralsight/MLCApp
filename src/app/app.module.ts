import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { ScreensModule } from './screens/screens.module';
import { RouterModule } from '@angular/router';
import { LCDListComponent } from './screens/lcd-list.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ScreensModule,
    SharedModule,
    RouterModule.forRoot([
      { path: 'MainLCD', component: LCDListComponent },
      { path: '', redirectTo: 'MainLCD', pathMatch: 'full' },
      { path: '**', redirectTo: 'MainLCD', pathMatch: 'full' }
    ], { useHash: true })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor() {}
}
