import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EventAdminComponent } from './event-admin';
import { EventService } from '../../service/event.service';

describe('EventAdminComponent', () => {
  let component: EventAdminComponent;
  let fixture: ComponentFixture<EventAdminComponent>;
  let eventService: EventService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventAdminComponent],
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventAdminComponent);
    component = fixture.componentInstance;
    eventService = TestBed.inject(EventService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct default event data and volunteer stats', () => {
    expect(component.eventId()).toBe('eco-forest');
    expect(component.eventData()?.title).toBe('Plantăm păduri comunitare');
    expect(component.totalCount()).toBe(8);
    expect(component.checkedCount()).toBe(4);
    expect(component.pendingCount()).toBe(4);
    expect(component.attendanceRate()).toBe('50.0%');
  });

  it('should filter volunteers by status', () => {
    expect(component.filteredVolunteers().length).toBe(8);

    component.setFilter('checked-in');
    expect(component.filteredVolunteers().length).toBe(4);
    expect(component.filteredVolunteers().every(v => v.status === 'checked-in')).toBe(true);

    component.setFilter('pending');
    expect(component.filteredVolunteers().length).toBe(4);
    expect(component.filteredVolunteers().every(v => v.status === 'pending')).toBe(true);

    component.setFilter('all');
    expect(component.filteredVolunteers().length).toBe(8);
  });

  it('should search volunteers by query', () => {
    component.searchQuery.set('Ana Maria');
    expect(component.filteredVolunteers().length).toBe(1);
    expect(component.filteredVolunteers()[0].name).toBe('Ana Maria Enache');

    component.searchQuery.set('Logistică');
    expect(component.filteredVolunteers().length).toBe(2);

    component.searchQuery.set('inexistent');
    expect(component.filteredVolunteers().length).toBe(0);
  });

  it('should open and close modals', () => {
    expect(component.activeModal()).toBeNull();

    component.openMessageAllModal();
    expect(component.activeModal()).toBe('messageAll');

    component.closeModal();
    expect(component.activeModal()).toBeNull();
  });

  it('should broadcast message and log activity', () => {
    component.openMessageAllModal();
    component.broadcastSubject.set('Actualizare locație');
    component.sendBroadcastMessage();

    expect(component.activeModal()).toBeNull();
    expect(component.toastVisible()).toBe(true);
    expect(component.toastMessage()).toContain('Mesajul a fost expediat');
    expect(component.activityFeed()[0].text).toContain('Actualizare locație');
  });

  it('should send individual message to volunteer', () => {
    const v = component.volunteers()[0];
    component.openMessageIndividualModal(v);
    expect(component.targetVolunteer()?.name).toBe('Ana Maria Enache');

    component.insertTemplate('Transport?');
    expect(component.dmMessageText()).toBe('Transport?');

    component.sendIndividualMessage();
    expect(component.activeModal()).toBeNull();
    expect(component.toastVisible()).toBe(true);
    expect(component.activityFeed()[0].text).toContain('Mesaj expediat către Ana Maria Enache');
  });

  it('should invite new volunteer and add to pending list', () => {
    const initialTotal = component.totalCount();
    component.openInviteModal();
    component.inviteContact.set('cristian.popa@gmail.com');
    component.inviteRole.set('Echipa Logistică');

    component.sendInvite();

    expect(component.totalCount()).toBe(initialTotal + 1);
    expect(component.pendingCount()).toBe(5);
    expect(component.volunteers()[0].email).toBe('cristian.popa@gmail.com');
    expect(component.volunteers()[0].status).toBe('pending');
    expect(component.toastVisible()).toBe(true);
  });

  it('should kick out a volunteer and update statistics', () => {
    const v = component.volunteers().find(item => item.id === 3); // Elena Diaconu (pending)
    expect(v).toBeTruthy();

    component.openKickOutModal(v!);
    component.confirmKickOut();

    expect(component.totalCount()).toBe(7);
    expect(component.pendingCount()).toBe(3);
    expect(component.volunteers().some(item => item.id === 3)).toBe(false);
    expect(component.toastVisible()).toBe(true);
  });

  it('should simulate QR scan check-in', () => {
    component.openQRScannerModal();
    const pendingId = component.pendingVolunteers()[0].id;
    component.quickScanSelectId.set(pendingId);

    component.simulateScanSelected();

    const checkedVolunteer = component.volunteers().find(item => item.id === pendingId);
    expect(checkedVolunteer?.status).toBe('checked-in');
    expect(checkedVolunteer?.checkInTime).toContain('Astăzi');
    expect(component.checkedCount()).toBe(5);
    expect(component.toastVisible()).toBe(true);
  });
});
