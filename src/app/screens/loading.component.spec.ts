import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingComponent } from './loading.component';
import { LoggerService } from '../shared/services/logger.service';
import { StateService } from '../shared/services/state.service';
import { CacheService } from '../shared/services/cache.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Result } from '../shared/models/enums';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;
  let mockLoggerService, mockCacheService, mockStateService, mockActivatedRoute, mockRouter;

  mockCacheService = {};
  mockCacheService.initialize = () => Result.Success;

  beforeEach(async(() => {
    mockStateService = jasmine.createSpyObj(['setStatus', 'getStatus']);
    mockLoggerService = jasmine.createSpyObj(['error']);
    mockActivatedRoute = jasmine.createSpyObj(['queryParams']);
    TestBed.configureTestingModule({
      declarations: [LoadingComponent],
      providers: [
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: StateService, useValue: mockStateService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });


});
