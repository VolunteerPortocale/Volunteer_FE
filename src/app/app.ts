import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './common/components/navbar/navbar';
import { GlobalLoaderComponent } from './common/components/global-loader/global-loader.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, GlobalLoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
