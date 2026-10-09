import { Injectable, signal, computed } from '@angular/core';
import { GetCurrentUserQuery } from '../core/graphql/services.private';

type CurrentUser = NonNullable<GetCurrentUserQuery['getCurrentUser']>;

interface CachedUser {
  subject: string;
  user: CurrentUser;
}

@Injectable({
  providedIn: 'root',
})
export class UserSessionService {
  private readonly storageKey = 'volunteerio_current_user';

  private readonly userSignal = signal<CurrentUser | null>(null);

  readonly currentUser = this.userSignal.asReadonly();

  readonly name = computed(() => {
    const user = this.currentUser();

    if (!user) return '';

    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  });

  readonly initials = computed(() => {
    const user = this.currentUser();

    if (!user) return '';

    return ((user.firstName?.charAt(0) ?? '') + (user.lastName?.charAt(0) ?? '')).toUpperCase();
  });

  readonly role = computed(() => this.currentUser()?.role ?? null);

  restore(subject: string): void {
    this.userSignal.set(null);

    try {
      const cached = sessionStorage.getItem(this.storageKey);
      if (!cached) return;

      const data = JSON.parse(cached) as CachedUser;

      if (data.subject !== subject) {
        this.clear();
        return;
      }

      this.userSignal.set(data.user);
    } catch {
      this.clear();
    }
  }

  setUser(subject: string, user: CurrentUser): void {
    this.userSignal.set(user);

    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify({ subject, user }));
    } catch {
      // In-memory state still works if storage is unavailable.
    }
  }

  clear(): void {
    this.userSignal.set(null);

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this.storageKey);
    }
  }
}
