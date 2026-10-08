import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../common/pipes/translate-pipe';

@Component({
  selector: 'app-profile-overview',
  imports: [MatIcon, RouterLink, TranslatePipe],
  templateUrl: './profile-overview.html',
  styleUrl: './profile-overview.scss',
})
export class ProfileOverview {}
