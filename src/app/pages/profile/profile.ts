import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { FooterComponent } from '../../common/components/footer/footer';
import { ProfileOverview } from './profile-overview/profile-overview';
import { EditPersonalDetails } from './edit-personal-details/edit-personal-details';
import { EditPreferences } from './edit-preferences/edit-preferences';

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
    EditPreferences,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent {
  readonly showPersonalDetails = signal(false);
  readonly showPreferences = signal(false);

  togglePersonalDetails(): void {
    const shouldShow = !this.showPersonalDetails();
    this.showPersonalDetails.set(shouldShow);
    this.showPreferences.set(false);
  }

  togglePreferences(): void {
    const shouldShow = !this.showPreferences();
    this.showPreferences.set(shouldShow);
    this.showPersonalDetails.set(false);
  }
}
