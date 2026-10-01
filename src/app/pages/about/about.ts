import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { FooterComponent } from '../../common/components/footer/footer';
import { AuthService } from '../../service/auth.service';

export interface ImpactStat {
  value: string;
  labelKey: string;
  icon: string;
}

export interface ValueCard {
  titleKey: string;
  descKey: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    TranslatePipe,
    FooterComponent
  ],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class AboutComponent {
  readonly authService = inject(AuthService);

  readonly stats: ImpactStat[] = [
    { value: '5,000+', labelKey: 'ABOUT_PAGE.STATS.VOLUNTEERS', icon: 'people' },
    { value: '120+', labelKey: 'ABOUT_PAGE.STATS.NGOS', icon: 'corporate_fare' },
    { value: '35,000+', labelKey: 'ABOUT_PAGE.STATS.HOURS', icon: 'schedule' },
    { value: '250+', labelKey: 'ABOUT_PAGE.STATS.PROJECTS', icon: 'task_alt' }
  ];

  readonly values: ValueCard[] = [
    {
      titleKey: 'ABOUT_PAGE.VALUES.SOLIDARITY_TITLE',
      descKey: 'ABOUT_PAGE.VALUES.SOLIDARITY_DESC',
      icon: 'volunteer_activism',
      color: '#2b4c3f'
    },
    {
      titleKey: 'ABOUT_PAGE.VALUES.TRANSPARENCY_TITLE',
      descKey: 'ABOUT_PAGE.VALUES.TRANSPARENCY_DESC',
      icon: 'verified',
      color: '#1565c0'
    },
    {
      titleKey: 'ABOUT_PAGE.VALUES.IMPACT_TITLE',
      descKey: 'ABOUT_PAGE.VALUES.IMPACT_DESC',
      icon: 'trending_up',
      color: '#2e7d32'
    },
    {
      titleKey: 'ABOUT_PAGE.VALUES.INCLUSIVITY_TITLE',
      descKey: 'ABOUT_PAGE.VALUES.INCLUSIVITY_DESC',
      icon: 'favorite',
      color: '#c2185b'
    }
  ];
}
