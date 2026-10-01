import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { SettingsComponent } from './settings';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create settings component', () => {
    expect(component).toBeTruthy();
  });

  it('should switch settings sections', () => {
    expect(component.activeSection()).toBe('general');
    component.setSection('notifications');
    expect(component.activeSection()).toBe('notifications');
    component.setSection('security');
    expect(component.activeSection()).toBe('security');
  });

  it('should validate password inputs', () => {
    component.updatePassword();
    expect(component.passwordError()).toBeTruthy();
  });
});
