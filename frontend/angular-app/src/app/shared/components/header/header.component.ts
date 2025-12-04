import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ColorThemeService } from '../../services/themes.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  isDarkTheme: boolean = false;

  constructor(
    private translateService: TranslateService, 
    private colorThemeService: ColorThemeService
  ) { }

  ngOnInit(): void {
    const colorTheme: 'light' | 'dark' = JSON.parse(localStorage.getItem('colorTheme') as string);
    const theme = colorTheme ? colorTheme : 'dark';
    this.isDarkTheme = theme === 'dark';
    this.setColorTheme(theme);
  }

  selectBtn(selectedBtn: string): void {
    localStorage.setItem('colorTheme', JSON.stringify(selectedBtn));
  }

  changeLang(langCode: string): void {
    console.log('Changed language to:', langCode);
  }

  toggleTheme(event: any): void {
    this.isDarkTheme = event.checked;
    const mode: 'light' | 'dark' = this.isDarkTheme ? 'dark' : 'light';
    this.setColorTheme(mode);
  }

  setColorTheme(mode: 'light' | 'dark'): void {
    this.colorThemeService.setTheme(mode);
    localStorage.setItem('colorTheme', JSON.stringify(mode));
  }
}