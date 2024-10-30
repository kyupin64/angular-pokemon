import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private loginService: LoginService, 
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    let isLoggedIn: boolean;

    this.loginService.getLoggedInBool().subscribe(loggedIn => {
      isLoggedIn = loggedIn;
    });

    if (!isLoggedIn) {
      this.router.navigate(['/home']); // redirect to home if not logged in
      return false;
    }
    return true;
  }
}
