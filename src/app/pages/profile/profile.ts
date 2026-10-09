import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { FooterComponent } from '../../common/components/footer/footer';
import { AuthService } from '../../service/auth.service';
import { ProfileOverview } from './profile-overview/profile-overview';
import { EditPersonalDetails } from './edit-personal-details/edit-personal-details';
import { EditPreferences } from './edit-preferences/edit-preferences';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    TranslatePipe,
    FooterComponent,
    ProfileOverview,
    EditPersonalDetails,
    EditPreferences,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly showPersonalDetails = signal(false);
  readonly showPreferences = signal(false);

  ngOnInit(): void {
    // this.getCurrentUserGql.query().subscribe({
    //   next: (result) => {
    //     this.isLoading.set(false);
    //     if (result.data?.createUser) {
    //       this.isSubmitted.set(true);
    //       this.router.navigate(['/' + this.routes.OTP], {
    //         queryParams: { email: input.email },
    //       });
    //     } else if (result.error) {
    //       this.errorMessage.set(result.error.message);
    //     }
    //   },
    //   error: (err) => {
    //     this.isLoading.set(false);
    //     const msg = err?.graphQLErrors?.[0]?.message || err?.message || '';
    //     if (msg.includes('already exists') || msg.includes('E409_001')) {
    //       this.errorMessage.set(
    //         this.translationService.translate('SIGNUP.ERRORS.EMAIL_EXISTS') ||
    //           'Un cont cu această adresă de email există deja.',
    //       );
    //     } else {
    //       this.errorMessage.set(
    //         msg || 'A apărut o eroare la înregistrare. Vă rugăm să încercați din nou.',
    //       );
    //     }
    //   },
    // });
    // const current = this.authService.currentUser();
    // if (current?.name) {
    //   if (this.isNgo()) {
    //     this.ngoName.set(current.name);
    //   } else {
    //     this.volunteerName.set(current.name);
    //   }
    // }
    // if (current?.email && this.isNgo()) {
    //   this.ngoEmail.set(current.email);
    // }
  }

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
