import { Injectable } from "@angular/core";
import { of, map, catchError } from "rxjs";
import { LocalStorageService } from "src/app/shared/services/local-storage.service";
import { GoogleUserService } from "./google-user.services";
import { GoogleAuthService } from "./google-auth.service";

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly AUTH_CHECK_INTERVAL = 1000 * 60 * 5;

  constructor(private readonly localStorage: LocalStorageService,
              private readonly googleAuth: GoogleAuthService,
              private readonly googleUser: GoogleUserService) {}

              // TODO: Refactor to split google-auth service into multiple services
              
//   initAuthCheck() {
//     const cached = this.localStorage.getItem<{ lastChecked: number }>('authState');
//     const now = Date.now();

//     if (!cached || now - cached.lastChecked > this.AUTH_CHECK_INTERVAL) {
//       this.localStorage.setItem('authState', { lastChecked: now });
//       this.googleUser.setUser(null);
//       return of(false);
//     }

//     return this.googleAuth.checkAuth().pipe(
//       map(user => {
//         this.googleUser.setUser(user);
//         this.localStorage.setItem('authState', { lastChecked: now });
//         return true;
//       }),
//       catchError(() => {
//         this.googleUser.setUser(null);
//         this.localStorage.setItem('authState', { lastChecked: now });
//         return of(false);
//       })
//     );
//   }
}
