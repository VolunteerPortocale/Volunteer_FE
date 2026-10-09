import { Component, OnInit, inject, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';

import { EVENT_TYPES } from '../../../config/event-categories.config';
import { EventCategory } from '../../../core/graphql/public/types';
import { UpdateUserGQL, UpdateUserPreferencesGQL } from '../../../core/graphql/services.private';
import { AuthService } from '../../../service/auth.service';
import { CurrentUserLoaderService } from '../../../service/current-user-loader.service';
import { UserSessionService } from '../../../service/user-session.service';

@Component({
  selector: 'app-edit-personal-details',
  standalone: true,
  imports: [ReactiveFormsModule, MatIcon],
  templateUrl: './edit-personal-details.html',
  styleUrl: './edit-personal-details.scss',
})
export class EditPersonalDetails implements OnInit {
  readonly close = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly updateUserGQL = inject(UpdateUserGQL);
  private readonly updateUserPreferencesGQL = inject(UpdateUserPreferencesGQL);
  private readonly authService = inject(AuthService);
  private readonly userSession = inject(UserSessionService);
  private readonly currentUserLoaderService = inject(CurrentUserLoaderService);

  readonly categories = EVENT_TYPES.filter((c) => !!c.category);
  readonly selectedCategories = signal<EventCategory[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  form!: FormGroup;

  private get user() {
    return this.authService.currentUser();
  }

  ngOnInit(): void {
    const user = this.user;
    this.form = this.fb.group({
      phoneNumber: [user?.phoneNumber ?? '', [Validators.required]],
      biography: [user?.biography ?? ''],
    });

    if (user?.eventCategoryPreferences) {
      this.selectedCategories.set([...user.eventCategoryPreferences]);
    }
  }

  toggleCategory(cat: EventCategory): void {
    const list = this.selectedCategories();
    this.selectedCategories.set(list.includes(cat) ? list.filter((c) => c !== cat) : [...list, cat]);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { phoneNumber, biography } = this.form.value;
    const categories = this.selectedCategories();
    const user = this.user;

    try {
      const [resUser, resPrefs] = await Promise.all([
        firstValueFrom(
          this.updateUserGQL.mutate({
            variables: {
              input: {
                firstName: user?.firstName,
                lastName: user?.lastName,
                phoneNumber: phoneNumber?.trim(),
                biography: biography?.trim() ?? '',
              },
            },
          }),
        ),
        firstValueFrom(
          this.updateUserPreferencesGQL.mutate({
            variables: {
              input: {
                eventCategoryPreferences: categories,
              },
            },
          }),
        ),
      ]);

      const updatedUser = resUser.data?.updateUser;
      const updatedPrefs = resPrefs.data?.updateUserPreferences;
      const subject = this.authService.getSubject();

      if (user && subject && updatedUser) {
        this.userSession.setUser(subject, {
          ...user,
          phoneNumber: updatedUser.phoneNumber,
          biography: updatedUser.biography,
          eventCategoryPreferences: updatedPrefs?.eventCategoryPreferences ?? categories,
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
