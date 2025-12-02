// src/app/services/theme.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentTheme: 'light' | 'dark' = 'dark';

  setTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme;
    document.body.setAttribute('data-theme', theme);
  }

  toggleTheme() {
    this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark');
  }

  getTheme() {
    return this.currentTheme;
  }
}
