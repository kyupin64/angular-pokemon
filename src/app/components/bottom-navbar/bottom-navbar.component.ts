import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-bottom-navbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    NgIf
  ],
  templateUrl: './bottom-navbar.component.html',
  styleUrl: './bottom-navbar.component.css'
})
export class BottomNavbarComponent {
  loggedIn: boolean;

  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loginService.getLoggedInBool().subscribe((loggedIn) => {
      this.loggedIn = loggedIn;
    });
  }

  goToSetup() {
    this.router.navigate(['./setup'])
  }

  goToMatching() {
    this.router.navigate(['./matching'])
  }

  goToProfile() {
    this.router.navigate(['./profile'])
  }
}
