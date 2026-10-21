import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InitialLoadingService } from '../../../service/initial-loading.service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-loader.component.html',
  styleUrl: './global-loader.component.scss',
})
export class GlobalLoaderComponent {
  readonly loadingService = inject(InitialLoadingService);
}
