import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MatchingComponent } from './components/matching/matching.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SetupComponent } from './components/setup/setup.component';

export const routes: Routes = [
    { path: '',   redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'setup', component: SetupComponent },
    { path: 'matching', component: MatchingComponent },
    { path: 'profile', component: ProfileComponent }
];
