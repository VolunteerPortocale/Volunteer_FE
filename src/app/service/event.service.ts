import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { environment } from '../../environments/environment';

export type ContactMethod = 'email' | 'phone' | 'both';

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
}

export interface EventItem {
  id: string;
  title: string;
  titleKey?: string;
  description: string;
  descriptionKey?: string;
  startDateTime: string;
  endDateTime?: string;
  location: string;
  locationKey?: string;
  volunteers: number;
  occupiedSpots?: number;
  organization: string;
  email?: string;
  phone?: string;
  eventTypes: string[];
  dressCode: string;
  duration: string;
  contactMethod: ContactMethod;
  attachedFiles?: AttachedFile[];
  imageUrl?: string;
  categoryTagKey?: string;
  categoryFilter?: string;
  spotsOccupied?: string;
  createdAt?: string;
}

const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'eco-forest',
    title: 'Plantăm păduri comunitare',
    titleKey: 'PROJECTS.CARD_1.TITLE',
    description: 'Alătură-te echipei pentru a planta peste 2.000 de puieți și a revitaliza spațiile verzi locale.',
    descriptionKey: 'PROJECTS.CARD_1.DESCRIPTION',
    startDateTime: '2026-10-03T09:00',
    endDateTime: '2026-10-03T17:00',
    location: 'Strășeni, Moldova',
    locationKey: 'PROJECTS.CARD_1.LOCATION',
    volunteers: 40,
    occupiedSpots: 32,
    organization: 'Eco Moldova',
    email: 'contact@ecomoldova.md',
    phone: '+373 69 111 222',
    eventTypes: ['environment', 'social'],
    dressCode: 'casual',
    duration: '1_day',
    contactMethod: 'email',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    categoryTagKey: 'HOME_AUTH.FILTERS.ECOLOGY',
    categoryFilter: 'ecology',
    spotsOccupied: '32 din 40 locuri ocupate',
    attachedFiles: []
  },
  {
    id: 'senior-digital',
    title: 'Competențe digitale pentru seniori',
    titleKey: 'PROJECTS.CARD_2.TITLE',
    description: 'Ajută persoanele în vârstă să folosească servicii digitale, smartphone-uri și internetul în siguranță.',
    descriptionKey: 'PROJECTS.CARD_2.DESCRIPTION',
    startDateTime: '2026-10-10T10:00',
    endDateTime: '2026-10-10T14:00',
    location: 'Chișinău, Moldova',
    locationKey: 'PROJECTS.CARD_2.LOCATION',
    volunteers: 20,
    occupiedSpots: 14,
    organization: 'Generații Împreună',
    email: 'info@generatii.md',
    phone: '+373 69 333 444',
    eventTypes: ['education', 'technology'],
    dressCode: 'casual',
    duration: '1_day',
    contactMethod: 'both',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    categoryTagKey: 'HOME_AUTH.FILTERS.EDUCATION',
    categoryFilter: 'education',
    spotsOccupied: '14 din 20 locuri ocupate',
    attachedFiles: []
  },
  {
    id: 'shelter-animals',
    title: 'Sprijin pentru adăpostul de animale',
    titleKey: 'PROJECTS.CARD_3.TITLE',
    description: 'Oferă îngrijire, hrană și afecțiune animalelor abandonate care așteaptă o familie.',
    descriptionKey: 'PROJECTS.CARD_3.DESCRIPTION',
    startDateTime: '2026-10-17T09:30',
    endDateTime: '2026-10-17T15:00',
    location: 'Bălți, Moldova',
    locationKey: 'PROJECTS.CARD_3.LOCATION',
    volunteers: 25,
    occupiedSpots: 18,
    organization: 'Casa Blănoșilor',
    email: 'adoptie@casablanosilor.md',
    phone: '+373 69 555 666',
    eventTypes: ['animal_care', 'social'],
    dressCode: 'casual',
    duration: '1_day',
    contactMethod: 'phone',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    categoryTagKey: 'HOME_AUTH.FILTERS.ANIMALS',
    categoryFilter: 'animals',
    spotsOccupied: '18 din 25 locuri ocupate',
    attachedFiles: []
  }
];

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'volunteerio_events_data';

  readonly events = signal<EventItem[]>(this.loadInitialEvents());

  getEventById(id: string): EventItem | undefined {
    return this.events().find((e) => e.id === id);
  }

  addEvent(payload: Partial<EventItem>): EventItem {
    const id = `event-${Date.now()}`;
    const newEvent: EventItem = {
      id,
      title: payload.title || 'Eveniment nou',
      description: payload.description || '',
      startDateTime: payload.startDateTime || new Date().toISOString(),
      endDateTime: payload.endDateTime,
      location: payload.location || 'Moldova',
      volunteers: payload.volunteers || 10,
      organization: payload.organization || 'Organizație Comunitară',
      email: payload.email,
      phone: payload.phone,
      eventTypes: payload.eventTypes || ['social'],
      dressCode: payload.dressCode || 'casual',
      duration: payload.duration || '1_day',
      contactMethod: payload.contactMethod || 'email',
      attachedFiles: payload.attachedFiles || [],
      imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80',
      categoryTagKey: this.resolveCategoryTagKey(payload.eventTypes?.[0]),
      categoryFilter: this.resolveCategoryFilter(payload.eventTypes?.[0]),
      spotsOccupied: `0 din ${payload.volunteers || 10} locuri ocupate`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newEvent, ...this.events()];
    this.events.set(updated);
    this.saveEvents(updated);
    return newEvent;
  }

  updateEvent(id: string, updates: Partial<EventItem>): boolean {
    const current = this.events();
    const index = current.findIndex((e) => e.id === id);
    if (index === -1) return false;

    const existing = current[index];
    const updatedEvent: EventItem = {
      ...existing,
      ...updates,
      id: existing.id,
      categoryTagKey: updates.eventTypes?.length
        ? this.resolveCategoryTagKey(updates.eventTypes[0])
        : existing.categoryTagKey,
      categoryFilter: updates.eventTypes?.length
        ? this.resolveCategoryFilter(updates.eventTypes[0])
        : existing.categoryFilter,
      spotsOccupied: updates.volunteers
        ? `${existing.spotsOccupied?.split(' ')[0] || '0'} din ${updates.volunteers} locuri ocupate`
        : existing.spotsOccupied,
    };

    const updatedList = [...current];
    updatedList[index] = updatedEvent;
    this.events.set(updatedList);
    this.saveEvents(updatedList);
    return true;
  }

  deleteEvent(id: string): boolean {
    const filtered = this.events().filter((e) => e.id !== id);
    this.events.set(filtered);
    this.saveEvents(filtered);
    return true;
  }
  
    /**
   * Uploads an individual file for an event via REST multipart.
   * Matches backend endpoint POST /api/v1/events/{eventId}/files?type={type}&index={index}
   */
  uploadEventFile(
    eventId: string,
    file: File,
    type: 'COVER' | 'GALLERY' | 'ATTACHMENT',
    index: number = 0
  ): Observable<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(
      `${environment.apiUrl}/v1/events/${eventId}/files?type=${type}&index=${index}`,
      formData
    );
  }

  /**
   * Uploads all selected files adhering to backend limits:
   * - 1st image -> COVER (index 0)
   * - Next images -> GALLERY (up to 3)
   * - Documents -> ATTACHMENT (up to 2)
   */
  uploadEventFiles(eventId: string, files: File[]): Observable<unknown[]> {
    if (!files || files.length === 0) {
      return of([]);
    }

    const images = files.filter((f) => f.type.startsWith('image/'));
    const docs = files.filter((f) => !f.type.startsWith('image/'));

    const uploads: Observable<unknown>[] = [];

    // First image is COVER
    if (images.length > 0) {
      uploads.push(this.uploadEventFile(eventId, images[0], 'COVER', 0));
    }

    // Up to 3 gallery images
    for (let i = 1; i < Math.min(images.length, 4); i++) {
      uploads.push(this.uploadEventFile(eventId, images[i], 'GALLERY', i - 1));
    }

    // Up to 2 non-image attachments
    for (let i = 0; i < Math.min(docs.length, 2); i++) {
      uploads.push(this.uploadEventFile(eventId, docs[i], 'ATTACHMENT', i));
    }

    return forkJoin(uploads);
  }

  private resolveCategoryTagKey(firstType?: string): string {
    if (!firstType) return 'ADD_EVENT.TYPES.SOCIAL';
    return `ADD_EVENT.TYPES.${firstType.toUpperCase()}`;
  }

  private resolveCategoryFilter(firstType?: string): string {
    if (firstType === 'environment') return 'ecology';
    if (firstType === 'education') return 'education';
    if (firstType === 'animal_care') return 'animals';
    return 'all';
  }

  private loadInitialEvents(): EventItem[] {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item: EventItem) => {
              const predefined = INITIAL_EVENTS.find((init) => init.id === item.id);
              if (predefined) {
                return {
                  ...item,
                  titleKey: item.titleKey || predefined.titleKey,
                  descriptionKey: item.descriptionKey || predefined.descriptionKey,
                  locationKey: item.locationKey || predefined.locationKey,
                  occupiedSpots: item.occupiedSpots !== undefined ? item.occupiedSpots : predefined.occupiedSpots,
                };
              }
              return item;
            });
          }
        }
      } catch (err) {
        console.error('Error loading events from storage', err);
      }
    }
    return INITIAL_EVENTS;
  }

  private saveEvents(list: EventItem[]): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(list));
      } catch (err) {
        console.error('Error saving events to storage', err);
      }
    }
  }
}
