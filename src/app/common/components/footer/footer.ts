import { Component, signal, inject, HostListener, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '../../pipes/translate-pipe';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    TranslatePipe
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  readonly currentYear = new Date().getFullYear();
  readonly email = signal<string>('');
  readonly subscribed = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly showScrollTop = signal<boolean>(false);

  ngOnInit(): void {
    this.checkScrollPosition();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.checkScrollPosition();
  }

  private checkScrollPosition(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.showScrollTop.set(window.scrollY > 250);
    }
  }

  onSubscribe(event: Event): void {
    event.preventDefault();
    const val = this.email().trim();

    if (!val || !val.includes('@') || !val.includes('.')) {
      this.errorMessage.set('Introdu o adresă de email validă.');
      return;
    }

    this.errorMessage.set('');
    this.subscribed.set(true);

    setTimeout(() => {
      this.email.set('');
      this.subscribed.set(false);
    }, 4000);
  }

  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
