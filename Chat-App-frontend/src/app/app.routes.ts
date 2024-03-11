import { Routes } from '@angular/router';
import { ChatsComponent } from './pages/communication/chats/chats.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { authGuard } from './guards/auth/auth.guard';
import { redirectGuard } from './guards/redirect/redirect.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'chats', title: 'MeghDoot - Chats', component: ChatsComponent, canActivate: [redirectGuard] },
  {
    path: 'login',
    title: 'MeghDoot - Login',
    component: LoginComponent,
    canActivate: [authGuard],
  },
];
