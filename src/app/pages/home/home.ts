import { Component } from '@angular/core';
import { ProjectCardComponent } from '../../common/components/project-card/project-card';
import { FooterComponent } from '../../common/components/footer/footer';
import { TranslatePipe } from '../../common/pipes/translate-pipe';

@Component({
  selector: 'app-home',
  imports: [ProjectCardComponent, FooterComponent, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {}
