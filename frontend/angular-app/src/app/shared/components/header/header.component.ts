import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ColorThemeService } from '../../services/themes.service';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  isDarkTheme: boolean = false;

  constructor(
    private readonly translateService: TranslateService, 
    private readonly colorThemeService: ColorThemeService,
    private readonly localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    // Use LocalStorageService to read the theme
    const savedTheme = this.localStorageService.getItem<'light' | 'dark'>('colorTheme');
    const theme = savedTheme || 'dark';
    this.isDarkTheme = theme === 'dark';
    this.setColorTheme(theme);
  }

  selectBtn(selectedBtn: 'light' | 'dark'): void {
    this.setColorTheme(selectedBtn);
  }

  changeLang(langCode: string): void {
    console.log('Changed language to:', langCode);
    this.localStorageService.setItem('selectedLang', langCode);
  }

  toggleTheme(event: any): void {
    this.isDarkTheme = event.checked;
    const mode: 'light' | 'dark' = this.isDarkTheme ? 'dark' : 'light';
    this.setColorTheme(mode);
  }

  setColorTheme(mode: 'light' | 'dark'): void {
    this.colorThemeService.setTheme(mode);
    this.localStorageService.setItem('colorTheme', mode);
  }
}
