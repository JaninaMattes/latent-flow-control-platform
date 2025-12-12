import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IGoogleAuthUser } from 'src/app/models/google-auth-user.model';
import { LocalStorageService } from 'src/app/shared/services/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {

  private readonly authUserSubject = new BehaviorSubject<IGoogleAuthUser | null>(null);
  public authUser$ = this.authUserSubject.asObservable();

  private readonly AUTH_CHECK_INTERVAL = 1000 * 60 * 5; // only every 5 minutes

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly localStorage: LocalStorageService
  ) {}

  public login(): void {
    globalThis.location.href = `${environment.apiUrl}/google-auth/login`;
  }

  /** Logout user and clear cached values */
  public logout() {
    return this.http
      .get(`${environment.apiUrl}/google-auth/logout`, { withCredentials: true })
      .subscribe(() => {

        this.localStorage.removeItem('authState');
        this.authUserSubject.next(null);
        this.router.navigate(['/home']);
      });
  }

  public initAuthCheck() {
    const cachedAuthState = this.localStorage.getItem<{
      lastChecked: number;
    }>('authState');

    if (!cachedAuthState?.lastChecked) {
      this.authUserSubject.next(null);
      return of(false);
    }

    const now = Date.now();
    if (now - cachedAuthState.lastChecked > this.AUTH_CHECK_INTERVAL) {
      // session expires 
      this.localStorage.setItem('authState', {
        lastChecked: now
      });

      this.authUserSubject.next(null);
      return of(false);
    }

    return this.checkAuth();
  }

  /** Validate HttpOnly JWT cookie */
  public checkAuth() {
    return this.http
      .get<IGoogleAuthUser>(`${environment.apiUrl}/google-auth/me`, {
        withCredentials: true,
      })
      .pipe(
        map((user) => {
          this.localStorage.setItem('authState', {
            lastChecked: Date.now()
          });

          this.authUserSubject.next(user);
          return true;
        }),
        catchError(() => {
          this.localStorage.setItem('authState', {
            lastChecked: Date.now()
          });

          this.authUserSubject.next(null);
          return of(false);
        })
      );
  }

  /** Property getter for synchronous access */
  public get currentUser(): IGoogleAuthUser | null {
    return this.authUserSubject.value;
  }
}
