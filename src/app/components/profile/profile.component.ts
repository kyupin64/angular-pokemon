import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { User } from '../../interfaces/user';
import { LoginService } from '../../services/login.service';
import { UsersService } from '../../services/users.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIcon
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  currentUser: User | null = null;
  viewingUser: User | null = null;
  userSubscription: Subscription;

  constructor(
    private loginService: LoginService, 
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.userSubscription = this.loginService.getCurrentUser().subscribe((currentUser) => {
      if (currentUser) {
        this.currentUser = currentUser;
      };
    });
  }

  ngOnDestroy() {
    // unsubscribe to avoid memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    };
  }

  async goToUserProfile(username: string) {
    const foundUser = await this.usersService.getUserWithUsername(username);

    if (foundUser) this.viewingUser = foundUser;
    return;
  }

  closeUserProfile() {
    this.viewingUser = null;
  }
}
