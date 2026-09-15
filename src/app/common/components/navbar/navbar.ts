import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UpperCasePipe } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { TranslationService, SupportedLanguage } from "../../../service/translation.service";
import { TranslatePipe } from '../../pipes/translate-pipe';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, UpperCasePipe, MatMenuModule, TranslatePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  readonly translationService = inject(TranslationService);

  changeLanguage(lang: SupportedLanguage): void {
    this.translationService.setLanguage(lang);
  }
}