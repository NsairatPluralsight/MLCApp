import { AppPage } from './app.po';
import { browser } from 'protractor';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display Loading message', () => {
    browser.waitForAngularEnabled(false);

    page.navigateTo();
    expect(page.getloadingText()).toContain('LOADING');
  });

  it('should return the count of cells as 26', () => {
    browser.waitForAngularEnabled(false);
    page.navigateToMainLCD();

    setTimeout(() => {
      expect(page.getTableCellsCount()).toEqual(26);
    }, 2000);
  });

  it('should loading div be hidden', () => {
    browser.waitForAngularEnabled(false);
    page.navigateToMainLCD();
    setTimeout(() => {
      expect(page.getContainerDivClassList()).toContain('hide');
    }, 2000);
  });

});
