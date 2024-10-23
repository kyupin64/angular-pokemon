import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MatchingComponent } from './components/matching/matching.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SetupComponent } from './components/setup/setup.component';

export const routes: Routes = [
    { path: '',   redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'setup', component: SetupComponent },
    { path: 'matching', component: MatchingComponent },
    { path: 'profile', component: ProfileComponent }
];
