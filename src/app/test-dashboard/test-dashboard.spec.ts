import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TestDashboard } from './test-dashboard';
import { RestService } from '../core/api/rest.service';
import { GraphqlService } from '../core/api/graphql.service';

describe('TestDashboard', () => {
  let component: TestDashboard;
  let fixture: ComponentFixture<TestDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestDashboard],
      providers: [
        {
          provide: RestService,
          useValue: {
            getUsers: () => of([]),
          },
        },
        {
          provide: GraphqlService,
          useValue: {
            getUsers: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
