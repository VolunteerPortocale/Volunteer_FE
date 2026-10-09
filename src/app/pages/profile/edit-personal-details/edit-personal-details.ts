import { Component, inject } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { CurrentUserLoaderService } from '../../../service/current-user-loader.service';

@Component({
  selector: 'app-edit-personal-details',
  imports: [],
  templateUrl: './edit-personal-details.html',
  styleUrl: './edit-personal-details.scss',
})
export class EditPersonalDetails {
  readonly authService = inject(AuthService);
  readonly currentUserLoaderService = inject(CurrentUserLoaderService);
}
