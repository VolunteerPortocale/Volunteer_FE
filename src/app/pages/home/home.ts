import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectCardComponent } from '../../common/components/project-card/project-card';
import { FooterComponent } from '../../common/components/footer/footer';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { AuthService } from '../../service/auth.service';
import { ROUTE_HELPERS } from '../../config/routes.config';

@Component({
  selector: 'app-home',
  imports: [ProjectCardComponent, FooterComponent, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && this.authService.isAuthenticated()) {
      this.router.navigate([ROUTE_HELPERS.homeAuth()]);
    }
  }
}
