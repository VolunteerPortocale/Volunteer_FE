import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SignupComponent } from './signup';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [provideRouter([])],
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

  it('should toggle interests correctly', () => {
    const interest = 'Muncă Ecologică';
    expect(component.selectedInterests().includes(interest)).toBe(false);

    component.toggleInterest(interest);
    expect(component.selectedInterests().includes(interest)).toBe(true);

    component.toggleInterest(interest);
    expect(component.selectedInterests().includes(interest)).toBe(false);
  });
});