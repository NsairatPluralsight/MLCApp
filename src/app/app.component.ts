import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <div appNgInclude src="MainLCD/theme/themeOptions.js" type="script"></div>
  <router-outlet></router-outlet>`
})
export class AppComponent {
  title = 'MainLCD';

  constructor() {}
}
