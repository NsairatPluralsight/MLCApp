import { NgIncludeDirective } from './ng-include.directive';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ElementRef, Directive, Component } from '@angular/core';
import { LoggerService } from '../services/logger.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

@Directive({
  selector: '[appElementRef]'
})
export class MockElementRefDirective extends ElementRef {
  nativeElement: {};
  constructor() {
    super(null);
  }
}

@Component({
  template: `<div appNgInclude src="../../theme/themeOptions.css" type="style"></div>`
})
class TestNgIncludeComponent {
}

describe('NgIncludeDirective', () => {
  let mockLoggerService;
  let httpTestingController: HttpTestingController;
  let fixture: ComponentFixture<TestNgIncludeComponent>;
  let component: TestNgIncludeComponent;

  beforeEach(() => {
    mockLoggerService = jasmine.createSpyObj(['error']);

    TestBed.configureTestingModule({
      declarations: [
        MockElementRefDirective,
        TestNgIncludeComponent
      ],
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        NgIncludeDirective,
        { provide: ElementRef, useClass: MockElementRefDirective },
        { provide: LoggerService, useValue: mockLoggerService },
      ]
    });
    fixture = TestBed.createComponent(TestNgIncludeComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('should get a css', () => {
    fixture.whenRenderingDone().then(() => {
      let debugElement = fixture.debugElement.query(By.css('div'));
      setTimeout(() => {
        expect(debugElement.children.length).toBeGreaterThan(0);

      }, 1000);
    });
  });

});
