import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { APP_ROUTES } from '../../config/routes.config';

export type AccountRole = 'volunteer' | 'ngo';

export const INTEREST_OPTIONS = [
  'Evenimente și Festivaluri',
  'Strângeri de Fonduri și Sport',
  'Sănătate și Ajutor Umanitar',
  'Muncă Ecologică',
];

/**
 * Cross-field validator to ensure password and confirmPassword match
 */
export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  return password.value === confirmPassword.value
    ? null
    : { passwordMismatch: true };
};

@Component({
  selector: 'app-signup',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly routes = APP_ROUTES;
  readonly interestOptions = INTEREST_OPTIONS;

  // UI state signals
  readonly role = signal<AccountRole>('volunteer');
  readonly showPassword = signal<boolean>(false);
  readonly selectedInterests = signal<string[]>([]);
  readonly isSubmitted = signal<boolean>(false);

  // Reactive form group with validators
  readonly signupForm = this.fb.group(
    {
      name: ['', [Validators.required, Validators.maxLength(100)]],
      orgName: ['', [Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
    },
    { validators: passwordMatchValidator }
  );

  // Convenient getter for template controls
  get f() {
    return this.signupForm.controls;
  }

  /**
   * Switch account role (volunteer vs organization) and update validation rules
   */
  setRole(selectedRole: AccountRole): void {
    this.role.set(selectedRole);

    const orgNameControl = this.signupForm.get('orgName');
    if (selectedRole === 'ngo') {
      orgNameControl?.setValidators([Validators.required, Validators.maxLength(100)]);
    } else {
      orgNameControl?.clearValidators();
      orgNameControl?.setValue('');
    }
    orgNameControl?.updateValueAndValidity();
  }

  /**
   * Toggle password text/obscured visibility
   */
  toggleShowPassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  /**
   * Toggle interest selection in the volunteer role
   */
  toggleInterest(interest: string): void {
    const current = this.selectedInterests();
    if (current.includes(interest)) {
      this.selectedInterests.set(current.filter((i) => i !== interest));
    } else {
      this.selectedInterests.set([...current, interest]);
    }
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitted.set(true);

    const payload = {
      role: this.role(),
      name: this.signupForm.value.name?.trim(),
      orgName: this.role() === 'ngo' ? this.signupForm.value.orgName?.trim() : null,
      email: this.signupForm.value.email?.trim(),
      password: this.signupForm.value.password,
      interests: this.role() === 'volunteer' ? this.selectedInterests() : [],
    };

    console.log('Signup form submitted:', payload);

    // TODO: Connect with AuthService when backend endpoint is ready
  }
}