import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
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
});
