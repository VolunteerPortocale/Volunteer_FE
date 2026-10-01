import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AboutComponent } from './about';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create about component', () => {
    expect(component).toBeTruthy();
  });

  it('should have impact stats and values loaded with translation keys', () => {
    expect(component.stats.length).toBeGreaterThan(0);
    expect(component.values.length).toBeGreaterThan(0);
    expect(component.stats[0].labelKey).toContain('ABOUT_PAGE.STATS');
    expect(component.values[0].titleKey).toContain('ABOUT_PAGE.VALUES');
    expect(component.values[0].descKey).toContain('ABOUT_PAGE.VALUES');
  });
});
