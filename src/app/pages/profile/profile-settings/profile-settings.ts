import { Component, inject, OnInit, output, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';

import { Language, UpdateUserPreferencesInput } from '../../../core/graphql/private/types';
import {
  ConfirmTwoFactorGQL,
  InitiateTwoFactorGQL,
  UpdateUserPreferencesGQL,
} from '../../../core/graphql/services.private';
import { AuthService } from '../../../service/auth.service';
import { CurrentUserLoaderService } from '../../../service/current-user-loader.service';
import { SupportedLanguage, TranslationService } from '../../../service/translation.service';

export interface SettingsForm {
  language: FormControl<Language>;
  notificationsEnabled: FormControl<boolean>;
  twoFactorEnabled: FormControl<boolean>;
  otp: FormControl<string>;
}

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [ReactiveFormsModule, MatIcon],
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.scss',
})
export class ProfileSettingsComponent implements OnInit {
  readonly close = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly currentUserLoader = inject(CurrentUserLoaderService);
  private readonly translationService = inject(TranslationService);
  private readonly updatePrefsGQL = inject(UpdateUserPreferencesGQL);
  private readonly init2faGQL = inject(InitiateTwoFactorGQL);
  private readonly confirm2faGQL = inject(ConfirmTwoFactorGQL);

  readonly languages = [
    { value: Language.Ro, label: 'Română' },
    { value: Language.En, label: 'English' },
    { value: Language.Ru, label: 'Русский' },
  ];

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly otpSent = signal(false);

  form!: FormGroup<SettingsForm>;

  get user() {
    return this.authService.currentUser();
  }

  ngOnInit(): void {
    const user = this.user;
    this.form = this.fb.group<SettingsForm>({
      language: this.fb.control(user?.language ?? Language.Ro),
      notificationsEnabled: this.fb.control(user?.notificationsEnabled ?? true),
      twoFactorEnabled: this.fb.control(user?.twoFactorEnabled ?? false),
      otp: this.fb.control(''),
    });
  }

  async onToggle2Fa(): Promise<void> {
    const enabled = this.form.controls.twoFactorEnabled.value;
    if (enabled && !this.user?.twoFactorEnabled) {
      try {
        await firstValueFrom(this.init2faGQL.mutate());
        this.otpSent.set(true);
      } catch {
        this.error.set('Nu s-a putut trimite codul 2FA pe email.');
      }
    } else if (!enabled) {
      this.otpSent.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(null);

    const { language, notificationsEnabled, twoFactorEnabled, otp } = this.form.getRawValue();
    const cleanOtp = otp.trim();

    try {
      if (twoFactorEnabled && !this.user?.twoFactorEnabled) {
        if (!cleanOtp) {
          this.error.set('Te rugăm să introduci codul OTP primit pe email.');
          this.loading.set(false);
          return;
        }
        await firstValueFrom(this.confirm2faGQL.mutate({ variables: { otp: cleanOtp } }));
      }

      const input: UpdateUserPreferencesInput = {
        language,
        notificationsEnabled,
        twoFactorEnabled,
      };

      const res = await firstValueFrom(this.updatePrefsGQL.mutate({ variables: { input } }));
      const updated = res.data?.updateUserPreferences;

      if (this.user && updated) {
        await this.currentUserLoader.refresh();
      }

      if (language) {
        this.translationService.setLanguage(String(language).toLowerCase() as SupportedLanguage);
      }

      this.close.emit();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Eroare la salvare.');
    } finally {
      this.loading.set(false);
    }
  }
}
