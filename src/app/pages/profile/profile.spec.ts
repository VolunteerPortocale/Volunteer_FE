import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ProfileComponent } from './profile';
import { AuthService } from '../../service/auth.service';
import { UpdateUserGQL, UpdateUserPreferencesGQL } from '../../core/graphql/services.private';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser: () => null, getSubject: () => 'test' } },
        { provide: UpdateUserGQL, useValue: {} },
        { provide: UpdateUserPreferencesGQL, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create profile component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle personal details correctly', () => {
    expect(component.showPersonalDetails()).toBe(false);
    component.togglePersonalDetails();
    expect(component.showPersonalDetails()).toBe(true);
    expect(component.showPreferences()).toBe(false);
    component.togglePersonalDetails();
    expect(component.showPersonalDetails()).toBe(false);
  });

  it('should toggle preferences correctly', () => {
    expect(component.showPreferences()).toBe(false);
    component.togglePreferences();
    expect(component.showPreferences()).toBe(true);
    expect(component.showPersonalDetails()).toBe(false);
    component.togglePreferences();
    expect(component.showPreferences()).toBe(false);
  });
});
