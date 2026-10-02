import { Component, OnInit, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EventService, EventItem } from '../../service/event.service';
import { AuthService } from '../../service/auth.service';
import { TranslationService } from '../../service/translation.service';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { ROUTE_HELPERS } from '../../config/routes.config';

export interface Volunteer {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  status: 'checked-in' | 'pending';
  checkInTime: string | null;
}

export interface ActivityLogItem {
  id: string;
  text: string;
  time: string;
  type: 'check-in' | 'message' | 'invite' | 'kick';
}

const INITIAL_VOLUNTEERS: Volunteer[] = [
  {
    id: 1,
    name: 'Ana Maria Enache',
    email: 'anamaria.enache@gmail.com',
    phone: '+373 69 123 456',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    role: 'Leader of the group',
    status: 'checked-in',
    checkInTime: 'Astăzi, 09:14'
  },
  {
    id: 2,
    name: 'Mihai Sandu',
    email: 'mihai.sandu@gmail.com',
    phone: '+373 68 765 432',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    role: 'Echipa Logistică',
    status: 'checked-in',
    checkInTime: 'Astăzi, 09:08'
  },
  {
    id: 3,
    name: 'Elena Diaconu',
    email: 'elena.diaconu@yahoo.com',
    phone: '+373 79 345 678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    role: 'Voluntar general',
    status: 'pending',
    checkInTime: null
  },
  {
    id: 4,
    name: 'Vlad Ionescu',
    email: 'vlad.ionescu@gmail.com',
    phone: '+373 60 987 654',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    role: 'Voluntar general',
    status: 'pending',
    checkInTime: null
  },
  {
    id: 5,
    name: 'Cristina Muntean',
    email: 'cristina.muntean@gmail.com',
    phone: '+373 69 555 123',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces',
    role: 'Asistență Check-in',
    status: 'checked-in',
    checkInTime: 'Astăzi, 08:52'
  },
  {
    id: 6,
    name: 'Ion Cebotari',
    email: 'ion.cebotari@gmail.com',
    phone: '+373 78 444 321',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces',
    role: 'Voluntar general',
    status: 'pending',
    checkInTime: null
  },
  {
    id: 7,
    name: 'Daniela Rusu',
    email: 'daniela.rusu@gmail.com',
    phone: '+373 69 222 888',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&crop=faces',
    role: 'Echipa Logistică',
    status: 'checked-in',
    checkInTime: 'Astăzi, 09:20'
  },
  {
    id: 8,
    name: 'Radu Moraru',
    email: 'radu.moraru@outlook.com',
    phone: '+373 60 111 999',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces',
    role: 'Voluntar general',
    status: 'pending',
    checkInTime: null
  }
];

const INITIAL_LOGS: ActivityLogItem[] = [
  { id: '1', text: 'Ana Maria Enache a scanat QR-ul', time: 'Astăzi, 09:14', type: 'check-in' },
  { id: '2', text: 'Mihai Sandu a scanat QR-ul', time: 'Astăzi, 09:08', type: 'check-in' },
  { id: '3', text: 'Notificare trimisă: Punct de întâlnire', time: 'Astăzi, 08:30', type: 'message' }
];

@Component({
  selector: 'app-event-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    TranslatePipe
  ],
  templateUrl: './event-admin.html',
  styleUrl: './event-admin.scss'
})
export class EventAdminComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly authService = inject(AuthService);
  readonly translationService = inject(TranslationService);
  readonly routes = ROUTE_HELPERS;

  // Active event state
  readonly eventId = signal<string>('eco-forest');
  readonly eventData = computed<EventItem | undefined>(() => {
    return this.eventService.getEventById(this.eventId()) || this.eventService.getEventById('eco-forest');
  });

  // Volunteers state
  readonly volunteers = signal<Volunteer[]>(INITIAL_VOLUNTEERS);
  readonly currentFilter = signal<'all' | 'checked-in' | 'pending'>('all');
  readonly searchQuery = signal<string>('');

  // Modals state
  readonly activeModal = signal<'messageAll' | 'messageIndividual' | 'invite' | 'kickOut' | 'qrScanner' | null>(null);
  readonly targetVolunteer = signal<Volunteer | null>(null);

  // Form signals for modals
  readonly broadcastPush = signal<boolean>(true);
  readonly broadcastEmail = signal<boolean>(true);
  readonly broadcastSubject = signal<string>('');
  readonly broadcastBody = signal<string>(
    'Salutare tuturor! Vă mulțumim pentru implicare. Vă rugăm să aveți la voi încălțăminte comodă și mănuși de protecție. Ne vedem la ora 09:00!'
  );

  readonly dmMessageText = signal<string>('');

  readonly inviteContact = signal<string>('');
  readonly inviteRole = signal<string>('Voluntar general');
  readonly reserveSlot = signal<boolean>(true);
  readonly inviteNote = signal<string>('');

  readonly kickReasonSelect = signal<string>('Solicitare din partea voluntarului (retragere)');
  readonly kickReasonText = signal<string>('');
  readonly notifyKickVolunteer = signal<boolean>(true);

  readonly quickScanSelectId = signal<number | null>(null);

  // Toast & Activity state
  readonly toastMessage = signal<string | null>(null);
  readonly toastVisible = signal<boolean>(false);
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;
  readonly activityFeed = signal<ActivityLogItem[]>(INITIAL_LOGS);

  // Computed overview metrics
  readonly totalCount = computed(() => this.volunteers().length);
  readonly checkedCount = computed(() => this.volunteers().filter(v => v.status === 'checked-in').length);
  readonly pendingCount = computed(() => this.volunteers().filter(v => v.status === 'pending').length);
  readonly pendingVolunteers = computed(() => this.volunteers().filter(v => v.status === 'pending'));

  readonly attendanceRate = computed(() => {
    const total = this.totalCount();
    if (total === 0) return '0.0%';
    return `${((this.checkedCount() / total) * 100).toFixed(1)}%`;
  });

  readonly filteredVolunteers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.currentFilter();

    return this.volunteers().filter(v => {
      const matchesFilter = filter === 'all' ? true : v.status === filter;
      const matchesSearch = !query ||
        v.name.toLowerCase().includes(query) ||
        v.email.toLowerCase().includes(query) ||
        v.role.toLowerCase().includes(query) ||
        v.phone.includes(query);
      return matchesFilter && matchesSearch;
    });
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventId.set(id);
    }
  }

  setFilter(filter: 'all' | 'checked-in' | 'pending'): void {
    this.currentFilter.set(filter);
  }

  // ── Modal Handlers ──

  openModal(modalType: 'messageAll' | 'messageIndividual' | 'invite' | 'kickOut' | 'qrScanner'): void {
    this.activeModal.set(modalType);
  }

  closeModal(): void {
    this.activeModal.set(null);
  }

  getTranslatedRole(role: string): string {
    switch (role) {
      case 'Leader of the group':
        return this.translationService.translate('EVENT_ADMIN.ROLES.LEADER');
      case 'Echipa Logistică':
        return this.translationService.translate('EVENT_ADMIN.ROLES.LOGISTICS');
      case 'Asistență Check-in':
        return this.translationService.translate('EVENT_ADMIN.ROLES.CHECKIN');
      case 'Voluntar general':
        return this.translationService.translate('EVENT_ADMIN.ROLES.GENERAL');
      default:
        return role;
    }
  }

  // Action 1: Broadcast Message
  openMessageAllModal(): void {
    this.broadcastSubject.set('');
    this.openModal('messageAll');
  }

  sendBroadcastMessage(): void {
    const defaultSubject = this.translationService.translate('EVENT_ADMIN.MODALS.MESSAGE_ALL.SUBJECT_LABEL');
    const subject = this.broadcastSubject().trim() || (defaultSubject !== 'EVENT_ADMIN.MODALS.MESSAGE_ALL.SUBJECT_LABEL' ? defaultSubject : 'Anunț important');
    this.closeModal();

    const logTemplate = this.translationService.translate('EVENT_ADMIN.LOGS.ANNOUNCEMENT_SENT');
    const logText = logTemplate && logTemplate !== 'EVENT_ADMIN.LOGS.ANNOUNCEMENT_SENT'
      ? logTemplate.replace('{subject}', subject)
      : `Anunț transmis tuturor voluntarilor: "${subject}"`;
    this.logActivity(logText, 'message');

    const toastTemplate = this.translationService.translate('EVENT_ADMIN.TOASTS.BROADCAST_SENT');
    const toastMsg = toastTemplate && toastTemplate !== 'EVENT_ADMIN.TOASTS.BROADCAST_SENT'
      ? toastTemplate.replace('{count}', this.totalCount().toString())
      : `Mesajul a fost expediat către toți cei ${this.totalCount()} voluntari!`;
    this.showToast(toastMsg);
  }

  // Action 2: Individual Message
  openMessageIndividualModal(v: Volunteer): void {
    this.targetVolunteer.set(v);
    this.dmMessageText.set('');
    this.openModal('messageIndividual');
  }

  insertTemplate(textOrKey: string): void {
    const translated = this.translationService.translate(textOrKey);
    this.dmMessageText.set(translated && translated !== textOrKey ? translated : textOrKey);
  }

  sendIndividualMessage(): void {
    const volunteer = this.targetVolunteer();
    if (!volunteer) return;
    this.closeModal();

    const logTemplate = this.translationService.translate('EVENT_ADMIN.LOGS.DM_SENT');
    const logText = logTemplate && logTemplate !== 'EVENT_ADMIN.LOGS.DM_SENT'
      ? logTemplate.replace('{name}', volunteer.name)
      : `Mesaj expediat către ${volunteer.name}`;
    this.logActivity(logText, 'message');

    const toastTemplate = this.translationService.translate('EVENT_ADMIN.TOASTS.DM_SENT');
    const toastMsg = toastTemplate && toastTemplate !== 'EVENT_ADMIN.TOASTS.DM_SENT'
      ? toastTemplate.replace('{name}', volunteer.name)
      : `Mesajul a fost trimis către ${volunteer.name}!`;
    this.showToast(toastMsg);
  }

  // Action 3: Invite Volunteer
  openInviteModal(): void {
    this.inviteContact.set('');
    this.inviteNote.set('');
    this.inviteRole.set('Voluntar general');
    this.openModal('invite');
  }

  sendInvite(): void {
    const contact = this.inviteContact().trim();
    const role = this.inviteRole();
    if (!contact) {
      return;
    }

    const newId = Date.now();
    const newVolunteer: Volunteer = {
      id: newId,
      name: contact.includes('@') ? contact.split('@')[0] : contact,
      email: contact.includes('@') ? contact : `${contact}@volunteerio.md`,
      phone: '+373 6x xxx xxx',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
      role,
      status: 'pending',
      checkInTime: null
    };

    this.volunteers.update(list => [newVolunteer, ...list]);
    this.closeModal();

    const logTemplate = this.translationService.translate('EVENT_ADMIN.LOGS.INVITE_SENT');
    const logText = logTemplate && logTemplate !== 'EVENT_ADMIN.LOGS.INVITE_SENT'
      ? logTemplate.replace('{contact}', contact).replace('{role}', this.getTranslatedRole(role))
      : `Invitație trimisă către ${contact} (${role})`;
    this.logActivity(logText, 'invite');

    const toastTemplate = this.translationService.translate('EVENT_ADMIN.TOASTS.INVITE_SENT');
    const toastMsg = toastTemplate && toastTemplate !== 'EVENT_ADMIN.TOASTS.INVITE_SENT'
      ? toastTemplate.replace('{contact}', contact)
      : `Invitația a fost trimisă cu succes către ${contact}!`;
    this.showToast(toastMsg);
  }

  copyInviteLink(): void {
    if (isPlatformBrowser(this.platformId) && navigator.clipboard) {
      const link = `${window.location.origin}/join/${this.eventId()}?inv=pc42`;
      navigator.clipboard.writeText(link);
    }
    const toastTemplate = this.translationService.translate('EVENT_ADMIN.TOASTS.LINK_COPIED');
    this.showToast(toastTemplate && toastTemplate !== 'EVENT_ADMIN.TOASTS.LINK_COPIED' ? toastTemplate : 'Link-ul de invitație a fost copiat în clipboard!');
  }

  // Action 4: Kick Out Volunteer
  openKickOutModal(v: Volunteer): void {
    this.targetVolunteer.set(v);
    this.kickReasonText.set('');
    this.openModal('kickOut');
  }

  confirmKickOut(): void {
    const volunteer = this.targetVolunteer();
    if (!volunteer) return;

    const reason = this.kickReasonSelect();
    this.volunteers.update(list => list.filter(v => v.id !== volunteer.id));
    this.closeModal();

    const logTemplate = this.translationService.translate('EVENT_ADMIN.LOGS.KICKED');
    const logText = logTemplate && logTemplate !== 'EVENT_ADMIN.LOGS.KICKED'
      ? logTemplate.replace('{name}', volunteer.name).replace('{reason}', reason)
      : `Voluntarul ${volunteer.name} a fost eliminat. Motiv: ${reason}`;
    this.logActivity(logText, 'kick');

    const toastTemplate = this.translationService.translate('EVENT_ADMIN.TOASTS.KICKED');
    const toastMsg = toastTemplate && toastTemplate !== 'EVENT_ADMIN.TOASTS.KICKED'
      ? toastTemplate.replace('{name}', volunteer.name)
      : `Voluntarul ${volunteer.name} a fost eliminat din proiect.`;
    this.showToast(toastMsg);
  }

  // Action 5: QR Code Attendance Scanner
  openQRScannerModal(): void {
    const pending = this.pendingVolunteers();
    if (pending.length > 0) {
      this.quickScanSelectId.set(pending[0].id);
    } else {
      this.quickScanSelectId.set(null);
    }
    this.openModal('qrScanner');
  }

  simulateScanSelected(): void {
    const id = this.quickScanSelectId();
    if (!id) return;

    const target = this.volunteers().find(v => v.id === id);
    if (!target) return;

    const todayStr = this.translationService.translate('EVENT_ADMIN.LOGS.TODAY');
    const todayLabel = todayStr && todayStr !== 'EVENT_ADMIN.LOGS.TODAY' ? todayStr : 'Astăzi';
    const timeNow = new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
    this.volunteers.update(list =>
      list.map(v => v.id === id ? { ...v, status: 'checked-in', checkInTime: `${todayLabel}, ${timeNow}` } : v)
    );

    const logTemplate = this.translationService.translate('EVENT_ADMIN.LOGS.QR_CHECKIN');
    const logText = logTemplate && logTemplate !== 'EVENT_ADMIN.LOGS.QR_CHECKIN'
      ? logTemplate.replace('{name}', target.name)
      : `✓ ${target.name} a fost validat la fața locului (QR)`;
    this.logActivity(logText, 'check-in');

    const toastTemplate = this.translationService.translate('EVENT_ADMIN.TOASTS.CHECKIN_CONFIRMED');
    const toastMsg = toastTemplate && toastTemplate !== 'EVENT_ADMIN.TOASTS.CHECKIN_CONFIRMED'
      ? toastTemplate.replace('{name}', target.name).replace('{role}', this.getTranslatedRole(target.role))
      : `✓ Prezență confirmată: ${target.name} (${target.role})`;
    this.showToast(toastMsg);

    const remainingPending = this.volunteers().filter(v => v.status === 'pending');
    this.quickScanSelectId.set(remainingPending.length > 0 ? remainingPending[0].id : null);
  }

  promptManualCheckin(): void {
    const pending = this.pendingVolunteers();
    if (pending.length === 0) {
      const allConfirmed = this.translationService.translate('EVENT_ADMIN.TOASTS.ALL_CONFIRMED_ALREADY');
      this.showToast(allConfirmed && allConfirmed !== 'EVENT_ADMIN.TOASTS.ALL_CONFIRMED_ALREADY' ? allConfirmed : 'Toți voluntarii au confirmat deja prezența!');
      return;
    }

    const first = pending[0];
    const todayStr = this.translationService.translate('EVENT_ADMIN.LOGS.TODAY');
    const todayLabel = todayStr && todayStr !== 'EVENT_ADMIN.LOGS.TODAY' ? todayStr : 'Astăzi';
    const timeNow = new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
    this.volunteers.update(list =>
      list.map(v => v.id === first.id ? { ...v, status: 'checked-in', checkInTime: `${todayLabel}, ${timeNow}` } : v)
    );

    const logTemplate = this.translationService.translate('EVENT_ADMIN.LOGS.MANUAL_CHECKIN');
    const logText = logTemplate && logTemplate !== 'EVENT_ADMIN.LOGS.MANUAL_CHECKIN'
      ? logTemplate.replace('{name}', first.name)
      : `✓ Cod manual acceptat: ${first.name} este acum prezent`;
    this.logActivity(logText, 'check-in');

    const toastTemplate = this.translationService.translate('EVENT_ADMIN.TOASTS.MANUAL_CODE_ACCEPTED');
    const toastMsg = toastTemplate && toastTemplate !== 'EVENT_ADMIN.TOASTS.MANUAL_CODE_ACCEPTED'
      ? toastTemplate.replace('{name}', first.name)
      : `✓ Cod manual acceptat: ${first.name} este confirmat!`;
    this.showToast(toastMsg);
  }

  // ── Logging & Toast ──

  logActivity(text: string, type: ActivityLogItem['type']): void {
    const todayStr = this.translationService.translate('EVENT_ADMIN.LOGS.TODAY') || 'Astăzi';
    const time = new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
    const newEntry: ActivityLogItem = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      time: `${todayStr}, ${time}`,
      type
    };
    this.activityFeed.update(feed => [newEntry, ...feed.slice(0, 19)]);
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    this.toastVisible.set(true);

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.toastVisible.set(false);
    }, 3500);
  }
}
