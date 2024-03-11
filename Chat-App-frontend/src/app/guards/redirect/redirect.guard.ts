import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const redirectGuard: CanActivateFn = (route, state) => {
  if (inject(AuthService).isLoggedIn()) {
    return true;
  } else {
    return inject(Router).parseUrl('/login');
  }
};
