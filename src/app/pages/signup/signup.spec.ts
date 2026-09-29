import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SignupComponent } from './signup';
import { EventCategory } from '../../core/graphql/types';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form as invalid', () => {
    expect(component.signupForm.valid).toBe(false);
    expect(component.signupForm.get('firstName')?.valid).toBe(false);
    expect(component.signupForm.get('lastName')?.valid).toBe(false);
  });

  it('should validate firstName and lastName as required', () => {
    const firstNameControl = component.signupForm.get('firstName');
    const lastNameControl = component.signupForm.get('lastName');

    expect(firstNameControl?.hasError('required')).toBe(true);
    expect(lastNameControl?.hasError('required')).toBe(true);

    firstNameControl?.setValue('Ana');
    lastNameControl?.setValue('Popescu');

    expect(firstNameControl?.valid).toBe(true);
    expect(lastNameControl?.valid).toBe(true);
  });

  it('should require orgName when switching to NGO role', () => {
    expect(component.signupForm.get('orgName')?.hasError('required')).toBeFalsy();

    component.setRole('ngo');

    const orgControl = component.signupForm.get('orgName');
    expect(orgControl?.hasError('required')).toBe(true);

    component.setRole('volunteer');
    expect(orgControl?.hasError('required')).toBe(false);
  });

  it('should flag passwordMismatch when passwords do not match', () => {
    component.signupForm.patchValue({
      password: 'password123',
      confirmPassword: 'differentPassword',
    });

    expect(component.signupForm.hasError('passwordMismatch')).toBe(true);

    component.signupForm.patchValue({
      confirmPassword: 'password123',
    });

    expect(component.signupForm.hasError('passwordMismatch')).toBe(false);
  });

  it('should toggle category dropdown open state', () => {
    expect(component.categoryDropdownOpen()).toBe(false);

    component.toggleCategoryDropdown();
    expect(component.categoryDropdownOpen()).toBe(true);

    component.toggleCategoryDropdown();
    expect(component.categoryDropdownOpen()).toBe(false);
  });

  it('should toggle interests correctly and map to EventCategory', () => {
    const interestId = 'environment';
    expect(component.selectedInterests().includes(interestId)).toBe(false);

    component.toggleInterest(interestId);
    expect(component.selectedInterests().includes(interestId)).toBe(true);

    const categories = component.getSelectedCategories();
    expect(categories).toContain(EventCategory.Environment);

    component.toggleInterest(interestId);
    expect(component.selectedInterests().includes(interestId)).toBe(false);
    expect(component.getSelectedCategories()).not.toContain(EventCategory.Environment);
  });

  it('should compute dropdownTriggerLabel based on selection count', () => {
    expect(component.dropdownTriggerLabel).toBe('Categorii');

    component.toggleInterest('social');
    expect(component.dropdownTriggerLabel).toContain('1');

    component.toggleInterest('animal_care');
    expect(component.dropdownTriggerLabel).toContain('2');
  });
});