import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { NgIf } from '@angular/common';
import { LoginService } from '../../services/login.service';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [
    MatToolbarModule, 
    MatIcon,
    MatSidenavModule,
    MatButtonModule,
    MatSlideToggle,
    NgIf,
    RouterOutlet,
  ],
  templateUrl: './top-navbar.component.html',
  styleUrl: './top-navbar.component.css'
})
export class TopNavbarComponent {
  opened: boolean = false;
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

  logout() {
    this.loginService.logout();
    this.router.navigate(['./home']);
  }
}
