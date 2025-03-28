import { Routes } from '@angular/router';
import { RegistrationPageComponent } from './registration-page/registration-page.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'registration',
    pathMatch: 'full',
  },
  {
    path: 'registration',
    component: RegistrationPageComponent,
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'registration',
  },
];
