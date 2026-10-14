import { Component, signal, inject, computed, HostListener, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../pipes/translate-pipe';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    TranslatePipe
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  readonly authService = inject(AuthService);
  readonly brandRoute = computed(() => this.authService.isAuthenticated() ? '/' : '/guest');
  readonly currentYear = new Date().getFullYear();
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

  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
