import { Injectable } from "@angular/core";
import cssVars from "css-vars-ponyfill";
import { BehaviorSubject } from "rxjs";
import { darkTheme, lightTheme } from "src/assets/styles/themes";
import { LocalStorageService } from "./local-storage.service";

/**
 * Theme service manages and persists color schemes
 * usable throughout the UI components.
 */
@Injectable({ providedIn: 'root' })
export class ColorThemeService {

  private readonly themeSubject = new BehaviorSubject<'light' | 'dark'>('dark');
  theme$ = this.themeSubject.asObservable();

  constructor(private readonly storage: LocalStorageService) {
    // Load saved theme
    const saved = this.storage.getItem<'light' | 'dark'>('colorTheme');
    if (saved) {
      this.themeSubject.next(saved);
      this.applyTheme(saved);
    }
  }

  setTheme(mode: 'light' | 'dark') {
    if (this.themeSubject.value === mode) return; 

    this.themeSubject.next(mode);
    this.storage.setItem('colorTheme', mode);
    this.applyTheme(mode);
  }

  private applyTheme(mode: 'light' | 'dark') {
    const palette = mode === 'dark' ? darkTheme : lightTheme;

    cssVars({
      variables: { ...palette }
    });
  }

  get currentTheme(): 'light' | 'dark' {
    return this.themeSubject.value;
  }
}
