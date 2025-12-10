import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IGoogleAuthUser } from 'src/app/models/google-auth-user.model';

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  private readonly authUserSubject = new BehaviorSubject<IGoogleAuthUser | null>(
    null
  );

  public authUser$ = this.authUserSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  /** Start login (redirect user to NestJS OAuth route) */
  public login() {
    globalThis.location.href = `${environment.apiUrl}/google-auth/login`;
  }

  /** Logout (backend removes HttpOnly cookie) */
  public logout() {
    return this.http
      .get(`${environment.apiUrl}/google-auth/logout`, {
        withCredentials: true,
      })
      .subscribe(() => {
        this.authUserSubject.next(null);
        this.router.navigate(['/home']);
      });
  }

    /** Check if user is authenticated (via HttpOnly cookie) */
  public checkAuth() {
    return this.http
      .get<IGoogleAuthUser>(`${environment.apiUrl}/google-auth/me`, {
        withCredentials: true,
      })
      .pipe(
        map((user) => {
          this.authUserSubject.next(user);
          return true;
        }),
        catchError(() => {
          this.authUserSubject.next(null);
          return of(false);
        })
      );
  }

  /** Returns the currently authenticated user */
  public get currentUser(): IGoogleAuthUser | null {
    return this.authUserSubject.value;
  }
}