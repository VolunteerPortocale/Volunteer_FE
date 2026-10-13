import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { FooterComponent } from '../../common/components/footer/footer';
import { ProfileOverview } from './profile-overview/profile-overview';
import { EditPersonalDetails } from './edit-personal-details/edit-personal-details';
import { ProfileSettingsComponent } from './profile-settings/profile-settings';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    RouterLink,
    MatIcon,
    TranslatePipe,
    FooterComponent,
    ProfileOverview,
    EditPersonalDetails,
    ProfileSettingsComponent,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent {
  readonly showPersonalDetails = signal(false);
  readonly showSettings = signal(false);

  togglePersonalDetails(): void {
    const shouldShow = !this.showPersonalDetails();
    this.showPersonalDetails.set(shouldShow);
    this.showSettings.set(false);
  }

  toggleSettings(): void {
    const shouldShow = !this.showSettings();
    this.showSettings.set(shouldShow);
    this.showPersonalDetails.set(false);
  }
}
