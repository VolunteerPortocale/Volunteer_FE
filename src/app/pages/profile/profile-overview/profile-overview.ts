import { Component, inject, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { TranslatePipe } from '../../../common/pipes/translate-pipe';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-profile-overview',
  standalone: true,
  imports: [MatIcon, TranslatePipe],
  templateUrl: './profile-overview.html',
  styleUrl: './profile-overview.scss',
})
export class ProfileOverview {
  private readonly authService = inject(AuthService);

  readonly editPersonalDetails = output<void>();
  readonly editSettings = output<void>();

  get user() {
    return this.authService.currentUser();
  }

  onEditPersonalDetails(): void {
    this.editPersonalDetails.emit();
  }

  onEditSettings(): void {
    this.editSettings.emit();
  }
}
