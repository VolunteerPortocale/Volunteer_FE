import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavbarComponent } from './navbar';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return "/" for brandRoute when user is unauthenticated', () => {
    component.authService.isAuthenticated.set(false);
    expect(component.brandRoute()).toBe('/');
  });

  it('should return "/home-auth" for brandRoute when user is authenticated', () => {
    component.authService.isAuthenticated.set(true);
    expect(component.brandRoute()).toBe('/home-auth');
  });
});
