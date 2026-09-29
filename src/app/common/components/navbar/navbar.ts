import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UpperCasePipe } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { TranslationService, SupportedLanguage } from "../../../service/translation.service";
import { AuthService } from '../../../service/auth.service';
import { TranslatePipe } from '../../pipes/translate-pipe';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    UpperCasePipe,
    MatMenuModule,
    MatDividerModule,
    TranslatePipe
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  readonly translationService = inject(TranslationService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  changeLanguage(lang: SupportedLanguage): void {
    this.translationService.setLanguage(lang);
  }

  login(): void {
    this.authService.login();
    this.router.navigate(['/home-auth']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
