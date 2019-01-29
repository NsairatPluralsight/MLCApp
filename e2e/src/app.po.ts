import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  navigateToMainLCD() {
    return browser.get('MainLCD?id=115');
  }

  getloadingText() {
    return element(by.css('.loading')).getText();
  }

  getTableCellsCount() {
    return element.all(by.css('.table_header_row')).all(by.css('.table_header_col')).count();
  }

  getContainerDivClassList() {
    return element(by.css('.container')).getAttribute('class');
  }
}
