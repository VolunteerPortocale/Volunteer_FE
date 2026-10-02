import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { FooterComponent } from '../../common/components/footer/footer';

export type LegalTab = 'terms' | 'privacy' | 'cookies';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    TranslatePipe,
    FooterComponent
  ],
  templateUrl: './terms.html',
  styleUrl: './terms.scss'
})
export class TermsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly viewportScroller = inject(ViewportScroller);

  readonly activeTab = signal<LegalTab>('terms');
  readonly lastUpdated = '1 Octombrie 2026';

  ngOnInit(): void {
    this.route.url.subscribe(urlSegments => {
      const path = urlSegments.length > 0 ? urlSegments[0].path : '';
      if (path.includes('confidentialitate') || path.includes('privacy')) {
        this.activeTab.set('privacy');
      } else if (path.includes('cookie')) {
        this.activeTab.set('cookies');
      } else {
        this.activeTab.set('terms');
      }
    });

    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => {
          this.viewportScroller.scrollToAnchor(fragment);
        }, 150);
      }
    });
  }

  setTab(tab: LegalTab): void {
    this.activeTab.set(tab);

    const targetUrl = tab === 'terms'
      ? '/termeni'
      : tab === 'privacy'
        ? '/confidentialitate'
        : '/cookies';

    this.router.navigate([targetUrl], { replaceUrl: true });
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  scrollToSection(sectionId: string): void {
    this.viewportScroller.scrollToAnchor(sectionId);
  }

  printDocument(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
