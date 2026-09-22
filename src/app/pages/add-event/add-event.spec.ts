import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AddEventComponent } from './add-event';

describe('AddEventComponent', () => {
  let component: AddEventComponent;
  let fixture: ComponentFixture<AddEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEventComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEventComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
