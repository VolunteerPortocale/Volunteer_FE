import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { HomeComponent } from './home';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to / if user is authenticated', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    authService.isAuthenticated.set(true);

    component.ngOnInit();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should not navigate if user is unauthenticated', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    authService.isAuthenticated.set(false);

    component.ngOnInit();
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
