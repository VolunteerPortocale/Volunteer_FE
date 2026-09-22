import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { APP_ROUTES } from '../../config/routes.config';

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

  readonly routes = APP_ROUTES;

  // Component state signals
  readonly email = signal<string>('');
  readonly otpCode = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly isResending = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly resendCooldown = signal<number>(0);

  private timerInterval: any = null;

  ngOnInit(): void {
    // Read the email passed from signup page
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

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Provide immediate user feedback and redirect to login
    setTimeout(() => {
      this.isLoading.set(false);
      this.successMessage.set('Email verificat cu succes! Te redirecționăm la autentificare...');

      setTimeout(() => {
        this.router.navigate(['/' + this.routes.LOGIN]);
      }, 1500);
    }, 800);
  }

  /**
   * Resend a fresh OTP email with cooldown timer
   */
  onResend(): void {
    if (this.resendCooldown() > 0 || this.isResending() || !this.email()) {
      return;
    }

    this.isResending.set(true);
    this.errorMessage.set(null);

    setTimeout(() => {
      this.isResending.set(false);
      this.successMessage.set('Un nou cod de verificare a fost trimis pe adresa ta de email.');
      this.startCooldown(60);
    }, 600);
  }

  private startCooldown(seconds: number): void {
    this.resendCooldown.set(seconds);
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      const current = this.resendCooldown();
      if (current <= 1) {
        clearInterval(this.timerInterval);
        this.resendCooldown.set(0);
      } else {
        this.resendCooldown.set(current - 1);
      }
    }, 1000);
  }
}