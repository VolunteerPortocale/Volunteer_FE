import { Component } from '@angular/core';
import { ProjectCardComponent } from '../../common/components/project-card/project-card';
import { TranslatePipe } from '../../common/pipes/translate-pipe';

@Component({
  selector: 'app-home',
  imports: [ProjectCardComponent, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {}
