import { Component } from '@angular/core';
import { TopNavbarComponent } from './components/top-navbar/top-navbar.component';
import { BottomNavbarComponent } from './components/bottom-navbar/bottom-navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TopNavbarComponent,
    BottomNavbarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'pokemon';
}
