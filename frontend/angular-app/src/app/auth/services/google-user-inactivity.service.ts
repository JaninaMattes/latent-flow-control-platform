import { Injectable } from '@angular/core';
import { GoogleAuthService } from './google-auth.service';

@Injectable({ providedIn: 'root' })
export class UserActivityService {
  private readonly INACTIVITY_LIMIT = 1000 * 60 * 15; // 15 min
  private timer!: ReturnType<typeof setTimeout>;

  constructor(private readonly googleAuth: GoogleAuthService) {}

  init() {
    this.resetTimer();
    this.bindEvents();
  }

  private bindEvents() {
    /* Listen to user activities */
    globalThis.addEventListener('click', () => this.resetTimer());
    globalThis.addEventListener('mousemove', () => this.resetTimer());
    globalThis.addEventListener('keydown', () => this.resetTimer());
    globalThis.addEventListener('scroll', () => this.resetTimer());
  }
  /* Memory based inactivity service */
  private resetTimer() {
    clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      this.handleInactivity();
    }, this.INACTIVITY_LIMIT);
  }

  private handleInactivity() {
    this.googleAuth.logout();
  }
}
