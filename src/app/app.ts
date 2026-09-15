import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { NavbarComponent } from './common/components/navbar/navbar';
import { ProjectCardComponent } from './common/components/project-card/project-card';
import { TestDashboard } from './test-dashboard/test-dashboard';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, ProjectCardComponent, TestDashboard],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('volunteerio');
  protected readonly env = environment;
}
