import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { FooterComponent } from './footer';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the current year', () => {
    expect(component.currentYear).toBe(new Date().getFullYear());
  });

  it('should show error when submitting invalid email to newsletter', () => {
    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event;

    component.email.set('invalid-email');
    component.onSubscribe(fakeEvent);

    expect(component.errorMessage()).toContain('validă');
    expect(component.subscribed()).toBe(false);
  });

  it('should successfully subscribe when submitting valid email to newsletter', () => {
    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event;

    component.email.set('test@example.com');
    component.onSubscribe(fakeEvent);

    expect(component.errorMessage()).toBe('');
    expect(component.subscribed()).toBe(true);
  });

  it('should call window.scrollTo on scrollToTop', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    component.scrollToTop();
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });

    scrollToSpy.mockRestore();
  });

  it('should toggle showScrollTop based on window scroll position', () => {
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    component.onWindowScroll();
    expect(component.showScrollTop()).toBe(false);

    Object.defineProperty(window, 'scrollY', { value: 400, writable: true });
    component.onWindowScroll();
    expect(component.showScrollTop()).toBe(true);

    Object.defineProperty(window, 'scrollY', { value: 50, writable: true });
    component.onWindowScroll();
    expect(component.showScrollTop()).toBe(false);
  });
});
