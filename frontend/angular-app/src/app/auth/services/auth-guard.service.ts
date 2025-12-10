import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { GoogleAuthService } from './google-auth.service';
import { map } from 'rxjs';

export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const auth = inject(GoogleAuthService);

  return auth.checkAuth().pipe(
    map(isAuthenticated => {
      if (isAuthenticated) return true;
      auth.login(); // get GoogleOAuth 
      return false;
    })
  );
};

export const authChildGuard = AuthGuard;