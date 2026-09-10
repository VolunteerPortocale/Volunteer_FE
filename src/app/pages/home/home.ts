import { Component } from '@angular/core';
import { ProjectCardComponent } from '../../common/components/project-card/project-card';

@Component({
  selector: 'app-home',
  imports: [ProjectCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {}
