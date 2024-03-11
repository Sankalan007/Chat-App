import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  if (!inject(AuthService).isLoggedIn()) {
    return true;
  } else {
    return inject(Router).parseUrl('/chats');
  }
};
