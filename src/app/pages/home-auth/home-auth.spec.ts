import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { HomeAuthComponent } from './home-auth';

describe('HomeAuthComponent', () => {
  let component: HomeAuthComponent;
  let fixture: ComponentFixture<HomeAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeAuthComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeAuthComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should list all initial projects', () => {
    expect(component.filteredProjects().length).toBe(3);
  });

  it('should filter projects by category', () => {
    component.setCategory('ecology');
    expect(component.filteredProjects().length).toBe(1);
    expect(component.filteredProjects()[0].categoryFilter).toBe('ecology');

    component.setCategory('all');
    expect(component.filteredProjects().length).toBe(3);
  });

  it('should filter projects by search query', () => {
    component.onSearchChange('senior');
    expect(component.filteredProjects().length).toBe(1);
    expect(component.filteredProjects()[0].fallbackTitle).toContain('senior');

    component.clearSearch();
    expect(component.filteredProjects().length).toBe(3);
  });

  it('should toggle bookmarks', () => {
    expect(component.isBookmarked('eco-forest')).toBe(false);

    component.toggleBookmark('eco-forest');
    expect(component.isBookmarked('eco-forest')).toBe(true);

    component.toggleBookmark('eco-forest');
    expect(component.isBookmarked('eco-forest')).toBe(false);
  });

  it('should navigate to edit event route when editProject is called', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.editProject('eco-forest');
    expect(navigateSpy).toHaveBeenCalledWith(['/editeaza-eveniment', 'eco-forest']);
  });

  it('should navigate to admin event route when administerProject is called', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.administerProject('eco-forest');
    expect(navigateSpy).toHaveBeenCalledWith(['/administrare-eveniment', 'eco-forest']);
  });

  it('should return user first name / nickname when full name is available', () => {
    const authService = TestBed.inject(AuthService);
    authService.currentUser.set({
      name: 'Pavel Ciobanu',
      initials: 'PC',
      email: 'pavel@example.com'
    });
    expect(component.userNickname()).toBe('Pavel');
  });

  it('should return single name if provided without spaces', () => {
    const authService = TestBed.inject(AuthService);
    authService.currentUser.set({
      name: 'pavel99',
      initials: 'P',
      email: 'pavel99@example.com'
    });
    expect(component.userNickname()).toBe('pavel99');
  });

  it('should strip email domain if name or email is an email address', () => {
    const authService = TestBed.inject(AuthService);
    authService.currentUser.set({
      name: 'pavel.ciobanu@gmail.com',
      initials: 'PC',
      email: 'pavel.ciobanu@gmail.com'
    });
    expect(component.userNickname()).toBe('pavel.ciobanu');
    expect(component.userNickname()).not.toContain('@');
    expect(component.userNickname()).not.toContain('gmail.com');
  });

  it('should have internationalization keys on initial projects', () => {
    const projects = component.allProjects();
    expect(projects.length).toBeGreaterThan(0);
    const first = projects[0];
    expect(first.titleKey).toBeDefined();
    expect(first.descriptionKey).toBeDefined();
    expect(first.locationKey).toBeDefined();
    expect(first.date).toBeDefined();
    expect(first.spotsOccupied).toBeDefined();
  });

  it('should open and close the event details modal', () => {
    expect(component.selectedProjectModal()).toBeNull();

    const project = component.allProjects()[0];
    component.viewProject(project);
    expect(component.selectedProjectModal()).toEqual(project);

    component.closeModal();
    expect(component.selectedProjectModal()).toBeNull();
  });

  it('should track applied status for an event', () => {
    expect(component.isApplied('eco-forest')).toBe(false);

    component.applyToEvent('eco-forest');
    expect(component.isApplied('eco-forest')).toBe(true);
  });
});
