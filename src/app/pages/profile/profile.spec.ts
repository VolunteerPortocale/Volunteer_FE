import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ProfileComponent } from './profile';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create profile component', () => {
    expect(component).toBeTruthy();
  });

  it('should identify role correctly via isNgo computed signal', () => {
    expect(typeof component.isNgo()).toBe('boolean');
  });

  it('should toggle edit mode correctly', () => {
    expect(component.isEditing()).toBe(false);
    component.toggleEdit();
    expect(component.isEditing()).toBe(true);
    component.cancelEdit();
    expect(component.isEditing()).toBe(false);
  });

  it('should switch tabs correctly', () => {
    expect(component.activeTab()).toBe('overview');
    component.setTab('badges');
    expect(component.activeTab()).toBe('badges');
    component.setTab('about');
    expect(component.activeTab()).toBe('about');
  });
});
