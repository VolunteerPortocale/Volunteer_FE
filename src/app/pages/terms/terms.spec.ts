import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { TermsComponent } from './terms';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('TermsComponent', () => {
  let component: TermsComponent;
  let fixture: ComponentFixture<TermsComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([
          { path: 'termeni', component: TermsComponent },
          { path: 'confidentialitate', component: TermsComponent },
          { path: 'cookies', component: TermsComponent }
        ]),
        {
          provide: ActivatedRoute,
          useValue: {
            url: of([{ path: 'termeni' }]),
            fragment: of(null)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TermsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create TermsComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize active tab to terms', () => {
    expect(component.activeTab()).toBe('terms');
    expect(component.lastUpdated).toBeDefined();
  });

  it('should switch tabs to privacy and update route', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.setTab('privacy');

    expect(component.activeTab()).toBe('privacy');
    expect(navigateSpy).toHaveBeenCalledWith(['/confidentialitate'], { replaceUrl: true });
    navigateSpy.mockRestore();
  });

  it('should switch tabs to cookies and update route', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.setTab('cookies');

    expect(component.activeTab()).toBe('cookies');
    expect(navigateSpy).toHaveBeenCalledWith(['/cookies'], { replaceUrl: true });
    navigateSpy.mockRestore();
  });

  it('should scroll to section', () => {
    const scroller = (component as any).viewportScroller;
    const scrollSpy = vi.spyOn(scroller, 'scrollToAnchor').mockImplementation(() => {});

    component.scrollToSection('art-2');

    expect(scrollSpy).toHaveBeenCalledWith('art-2');
    scrollSpy.mockRestore();
  });

  it('should trigger print safely', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    component.printDocument();
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
