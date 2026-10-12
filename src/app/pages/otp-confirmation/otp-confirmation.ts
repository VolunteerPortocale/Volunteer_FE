import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { APP_ROUTES } from '../../config/routes.config';
import {
  ResendRegistrationOtpGQL,
  ValidateRegistrationOtpGQL,
} from '../../core/graphql/services.public';
import { CombinedGraphQLErrors } from '@apollo/client/errors';


@Component({
  selector: 'app-otp-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './otp-confirmation.html',
  styleUrl: './otp-confirmation.scss',
})
export class OtpConfirmationComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly validateRegistrationOtpGQL = inject(ValidateRegistrationOtpGQL);
  private readonly resendRegistrationOtpGQL = inject(ResendRegistrationOtpGQL);

  readonly routes = APP_ROUTES;

  // Component state signals
  readonly email = signal<string>('');
  readonly otpCode = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly isResending = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly resendCooldown = signal<number>(0);

  private timerInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    const emailParam = this.route.snapshot.queryParamMap.get('email') || '';
    this.email.set(emailParam);

    if (!emailParam) {
      this.errorMessage.set('Adresa de email lipsește. Vă rugăm să reluați înregistrarea.');
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  /**
   * Handle OTP verification submit
   */
  onVerify(): void {
    const code = this.otpCode().trim();
    if (!code) {
      this.errorMessage.set('Vă rugăm să introduceți codul de verificare.');
      return;
    }

    if (!this.email()) {
      this.errorMessage.set('Adresa de email lipsește. Vă rugăm să reluați înregistrarea.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.validateRegistrationOtpGQL
      .mutate({
        variables: {
          email: this.email().trim(),
          otp: code,
        },
      })
      .subscribe({
        next: (result) => {
          this.isLoading.set(false);
          if (result.data?.validateRegistrationOtp) {
            this.successMessage.set(
              'Email verificat cu succes! Te redirecționăm la autentificare...',
            );
            setTimeout(() => {
              this.router.navigate(['/' + this.routes.LOGIN]);
            }, 1500);
          } else if (result.error) {
            this.errorMessage.set(result.error.message);
          }
        },
        error: (err: unknown) => {
          this.isLoading.set(false);

          const errorCode = CombinedGraphQLErrors.is(err)
            ? err.errors[0]?.extensions?.['code']
            : null;

          switch (errorCode) {
            case '404-001':
              this.errorMessage.set('Utilizatorul nu a fost găsit.');
              break;

            case '400-002':
              this.errorMessage.set('Codul de verificare este incorect sau a expirat.');
              break;

            case '400-003':
              this.errorMessage.set(
                'Prea multe încercări incorecte. Vă rugăm să solicitați un nou cod.',
              );
              break;

            default:
              this.errorMessage.set(
                'Eroare la verificarea codului. Vă rugăm să încercați din nou.',
              );
          }
        },
      });
  }

  onResend(): void {
    if (this.resendCooldown() > 0 || this.isResending() || !this.email()) {
      return;
    }

    this.isResending.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.resendRegistrationOtpGQL
      .mutate({
        variables: {
          email: this.email().trim(),
        },
      })
      .subscribe({
        next: () => {
          this.isResending.set(false);
          this.successMessage.set('Un nou cod de verificare a fost trimis pe adresa ta de email.');
          this.startCooldown(60);
        },
        error: () => {
          this.errorMessage.set('Nu am putut retrimite codul. Vă rugăm să încercați din nou.');
        },
      });
  }

  private startCooldown(seconds: number): void {
    this.resendCooldown.set(seconds);
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      const current = this.resendCooldown();
      if (current <= 1) {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
        this.resendCooldown.set(0);
      } else {
        this.resendCooldown.set(current - 1);
      }
    }, 1000);
  }
}
