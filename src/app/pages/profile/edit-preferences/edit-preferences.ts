import { Component, inject } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { CurrentUserLoaderService } from '../../../service/current-user-loader.service';

@Component({
  selector: 'app-edit-preferences',
  imports: [],
  templateUrl: './edit-preferences.html',
  styleUrl: './edit-preferences.scss',
})
export class EditPreferences {
  readonly authService = inject(AuthService);
  readonly currentUserLoaderService = inject(CurrentUserLoaderService);
}
