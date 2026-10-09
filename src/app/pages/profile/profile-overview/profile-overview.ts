import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '../../../common/pipes/translate-pipe';
import { TranslationService } from '../../../service/translation.service';
import { AuthService } from '../../../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-overview',
  imports: [MatIcon, TranslatePipe],
  templateUrl: './profile-overview.html',
  styleUrl: './profile-overview.scss',
})
export class ProfileOverview {
  readonly translationService = inject(TranslationService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  get user() {
    return this.authService.currentUser();
  }

  onEditProfile(): void {
    // Open edit profile dialog or enable editing mode
  }

  onAccountSettings(): void {
    void this.router.navigate(['/setari']);
  }
}
