import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { FooterComponent } from '../../common/components/footer/footer';
import { AuthService } from '../../service/auth.service';
import { TranslationService, SupportedLanguage } from '../../service/translation.service';

export type SettingsSection = 'general' | 'notifications' | 'privacy' | 'security';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    TranslatePipe,
    FooterComponent
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class SettingsComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly translationService = inject(TranslationService);
  private readonly router = inject(Router);

  readonly activeSection = signal<SettingsSection>('general');
  readonly saveSuccess = signal<boolean>(false);
  readonly saveSuccessMessage = signal<string>('Setările au fost salvate cu succes!');

  // General Settings
  readonly selectedLanguage = signal<SupportedLanguage>('ro');

  // Notification Preferences
  readonly notifEmailApplicationUpdates = signal<boolean>(true);
  readonly notifEmailReminder24h = signal<boolean>(true);

  // Privacy Settings
  readonly profileVisibility = signal<'public' | 'ngos_only' | 'private'>('public');

  // Security / Password & 2FA
  readonly currentPassword = signal<string>('');
  readonly newPassword = signal<string>('');
  readonly confirmPassword = signal<string>('');
  readonly passwordError = signal<string>('');
  readonly twoFactorEnabled = signal<boolean>(false);

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.authService.login();
    }
    this.selectedLanguage.set(this.translationService.currentLang());
  }

  setSection(section: SettingsSection): void {
    this.activeSection.set(section);
  }

  onLanguageChange(lang: SupportedLanguage): void {
    this.selectedLanguage.set(lang);
    this.translationService.setLanguage(lang);
    this.showSaveFeedback('Limba platformei a fost actualizată!');
  }

  saveSettings(): void {
    this.showSaveFeedback('Toate preferințele au fost actualizate și salvate!');
  }

  updatePassword(): void {
    this.passwordError.set('');

    if (!this.currentPassword() || !this.newPassword() || !this.confirmPassword()) {
      this.passwordError.set('Vă rugăm să completați toate câmpurile de parolă.');
      return;
    }

    if (this.newPassword().length < 8) {
      this.passwordError.set('Noua parolă trebuie să conțină cel puțin 8 caractere.');
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordError.set('Parolele noi nu coincid.');
      return;
    }

    // Success simulation
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.showSaveFeedback('Parola contului a fost schimbată cu succes!');
  }

  onTwoFactorToggle(enabled: boolean): void {
    this.twoFactorEnabled.set(enabled);
    if (enabled) {
      this.showSaveFeedback('Autentificarea în doi factori prin email a fost activată!');
    } else {
      this.showSaveFeedback('Autentificarea în doi factori prin email a fost dezactivată.');
    }
  }

  private showSaveFeedback(message: string): void {
    this.saveSuccessMessage.set(message);
    this.saveSuccess.set(true);
    setTimeout(() => {
      this.saveSuccess.set(false);
    }, 4000);
  }
}
