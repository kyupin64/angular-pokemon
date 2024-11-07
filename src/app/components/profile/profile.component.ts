import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';

import { User } from '../../interfaces/user';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  currentUser: User | null = null;

  constructor(private loginService: LoginService) {}

  ngOnInit() {
    this.loginService.getCurrentUser().subscribe((currentUser) => {
      if (currentUser) {
        this.currentUser = currentUser;
      }
    });
  }
}
