import { Component, OnInit, inject, output, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';

import { EVENT_TYPES } from '../../../config/event-categories.config';
import { EventCategory } from '../../../core/graphql/public/types';
import { UpdateUserPreferencesGQL } from '../../../core/graphql/services.private';
import { AuthService } from '../../../service/auth.service';
import { CurrentUserLoaderService } from '../../../service/current-user-loader.service';
import { UserSessionService } from '../../../service/user-session.service';

@Component({
  selector: 'app-edit-preferences',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './edit-preferences.html',
  styleUrl: './edit-preferences.scss',
})
export class EditPreferences implements OnInit {
  readonly close = output<void>();

  private readonly updateUserPreferencesGQL = inject(UpdateUserPreferencesGQL);
  private readonly authService = inject(AuthService);
  private readonly userSession = inject(UserSessionService);
  private readonly currentUserLoaderService = inject(CurrentUserLoaderService);

  readonly categories = EVENT_TYPES.filter((c) => !!c.category);
  readonly selected = signal<EventCategory[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private get user() {
    return this.authService.currentUser();
  }

  ngOnInit(): void {
    const user = this.user;
    if (user?.eventCategoryPreferences) {
      this.selected.set([...user.eventCategoryPreferences]);
    }
  }

  toggleCategory(cat: EventCategory): void {
    const list = this.selected();
    this.selected.set(list.includes(cat) ? list.filter((c) => c !== cat) : [...list, cat]);
  }

  async onSubmit(): Promise<void> {
    if (this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    const categories = this.selected();
    const user = this.user;

    try {
      const res = await firstValueFrom(
        this.updateUserPreferencesGQL.mutate({
          variables: {
            input: {
              eventCategoryPreferences: categories,
            },
          },
        }),
      );

      const updated = res.data?.updateUserPreferences;
      const subject = this.authService.getSubject();

      if (user && subject && updated) {
        this.userSession.setUser(subject, {
          ...user,
          eventCategoryPreferences: updated.eventCategoryPreferences ?? categories,
        });
      }

      await this.currentUserLoaderService.refresh();
      this.close.emit();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Eroare la salvare.');
    } finally {
      this.loading.set(false);
    }
  }
}
