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
import { EVENT_TYPES, OptionItem } from '../../config/event-categories.config';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { TranslationService } from '../../service/translation.service';
import { CreateUserRole, EventCategory } from '../../core/graphql/public/types';
import { CreateUserGQL } from '../../core/graphql/services.public';

export type AccountRole = 'volunteer' | 'ngo';

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
    TranslatePipe,
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly createUserGQL = inject(CreateUserGQL);
  readonly translationService = inject(TranslationService);

  readonly routes = APP_ROUTES;
  readonly eventTypesList = EVENT_TYPES;

  // UI state signals
  readonly role = signal<AccountRole>('volunteer');
  readonly showPassword = signal<boolean>(false);
  readonly selectedInterests = signal<string[]>([]);
  readonly categoryDropdownOpen = signal<boolean>(false);
  readonly isSubmitted = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // Reactive form group with validators
  readonly signupForm = this.fb.group(
    {
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      orgName: ['', [Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[+0-9\s-]{8,20}$/)]],
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
   * Toggle dropdown open state for categories/interests
   */
  toggleCategoryDropdown(): void {
    this.categoryDropdownOpen.set(!this.categoryDropdownOpen());
  }

  /**
   * Toggle an interest/category selection
   */
  toggleInterest(interestId: string): void {
    const current = this.selectedInterests();
    if (current.includes(interestId)) {
      this.selectedInterests.set(current.filter((id) => id !== interestId));
    } else {
      this.selectedInterests.set([...current, interestId]);
    }
  }

  /**
   * Resolve translated label for category item
   */
  getCategoryLabel(type: OptionItem): string {
    const translated = this.translationService.translate(type.labelKey);
    return translated && translated !== type.labelKey ? translated : type.name;
  }

  /**
   * Dropdown trigger button label
   */
  get dropdownTriggerLabel(): string {
    const count = this.selectedInterests().length;
    if (count === 0) {
      const trans = this.translationService.translate('ADD_EVENT.CATEGORIES_DROPDOWN');
      return trans && trans !== 'ADD_EVENT.CATEGORIES_DROPDOWN' ? trans : 'Categorii';
    }
    const suffix = this.translationService.translate('ADD_EVENT.CATEGORIES_COUNT');
    const validSuffix = suffix && suffix !== 'ADD_EVENT.CATEGORIES_COUNT' ? suffix : 'categorii selectate';
    return `${count} ${validSuffix}`;
  }

  /**
   * Returns selected category enums matching GraphQL EventCategory
   */
  getSelectedCategories(): EventCategory[] {
    return this.selectedInterests()
      .map((id) => this.eventTypesList.find((item) => item.id === id)?.category)
      .filter((cat): cat is EventCategory => Boolean(cat));
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const val = this.signupForm.getRawValue();
    const isNgo = this.role() === 'ngo';

    const input = {
      firstName: val.firstName?.trim() || '',
      lastName: val.lastName?.trim() || '',
      email: val.email?.trim() || '',
      phoneNumber: val.phoneNumber?.trim() || '',
      password: val.password || '',
      role: isNgo ? CreateUserRole.Ngo : CreateUserRole.Volunteer,
      companyName: isNgo ? val.orgName?.trim() || null : null,
      eventCategoryPreferences: !isNgo ? this.getSelectedCategories() : [],
    };

        this.createUserGQL.mutate({ variables: { input } }).subscribe({
      next: (result) => {
        this.isLoading.set(false);
        if (result.data?.createUser) {
          this.isSubmitted.set(true);
          this.router.navigate(['/' + this.routes.OTP], {
            queryParams: { email: input.email },
          });
        } else if (result.error) {
          this.errorMessage.set(result.error.message);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.graphQLErrors?.[0]?.message || err?.message || '';
        if (msg.includes('already exists') || msg.includes('E409_001')) {
          this.errorMessage.set(
            this.translationService.translate('SIGNUP.ERRORS.EMAIL_EXISTS') ||
              'Un cont cu această adresă de email există deja.'
          );
        } else {
          this.errorMessage.set(
            msg || 'A apărut o eroare la înregistrare. Vă rugăm să încercați din nou.'
          );
        }
      },
    });
  }
}
