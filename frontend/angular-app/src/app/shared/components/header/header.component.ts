import { Component, OnInit } from '@angular/core';
import { ColorThemeService } from '../../services/themes.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  isDarkTheme: boolean = false;

  constructor(
    private readonly translate: LanguageService, 
    private readonly themeService: ColorThemeService
  ) { }

  ngOnInit(): void {
    // Use LocalStorageService to read the theme
    this.themeService.theme$.subscribe(theme => {
      this.isDarkTheme = theme === 'dark';
    });
  }

  changeLang(langCode: string): void {
    this.translate.setLanguage(langCode);
  }

  toggleTheme(event: MatSlideToggleChange) {
    const mode = event.checked ? 'dark' : 'light';
    this.themeService.setTheme(mode);
  }
}
