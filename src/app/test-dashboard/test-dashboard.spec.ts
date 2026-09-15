import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestDashboard } from './test-dashboard';

describe('TestDashboard', () => {
  let component: TestDashboard;
  let fixture: ComponentFixture<TestDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(TestDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
