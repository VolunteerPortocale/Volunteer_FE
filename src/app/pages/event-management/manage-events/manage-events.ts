import { Component } from '@angular/core';
import { MyProjectNgoComponent } from './my-project-NGO/my-project-ngo';

@Component({
  selector: 'app-manage-events',
  standalone: true,
  imports: [MyProjectNgoComponent],
  templateUrl: './manage-events.html',
  styleUrl: './manage-events.scss',
})
export class ManageEvents {}

export * from './my-project-NGO/my-project-ngo';
