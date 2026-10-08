import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { AddEventComponent } from './add-event';
import { EventService } from '../../service/event.service';
import { CreateEventGQL } from '../../core/graphql/services';

describe('AddEventComponent', () => {
  let component: AddEventComponent;
  let fixture: ComponentFixture<AddEventComponent>;
  let eventService: EventService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEventComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 'eco-forest' : null),
              },
            },
          },
        },
        {
          provide: CreateEventGQL,
          useValue: {
            mutate: () => of({ data: { createEvent: { id: 'test-event-id' } } }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEventComponent);
    component = fixture.componentInstance;
    eventService = TestBed.inject(EventService);
    await fixture.whenStable();
  });

  it('should create and initialize in edit mode for valid id', () => {
    expect(component).toBeTruthy();
    expect(component.isEditMode()).toBe(true);
    expect(component.eventId()).toBe('eco-forest');
    expect(component.eventForm.get('title')?.value).toBe('Plantăm păduri comunitare');
  });

  it('should update event when form is submitted in edit mode', () => {
    component.eventForm.patchValue({
      title: 'Plantare de copaci în Parcul Central - Editat',
    });

    component.onSubmit();
    expect(component.isSubmitted()).toBe(true);

    const updated = eventService.getEventById('eco-forest');
    expect(updated?.title).toBe('Plantare de copaci în Parcul Central - Editat');
  });
});

