import { Component, OnInit } from '@angular/core';
import { ColorThemeService } from '../../services/themes.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { LanguageService } from '../../services/language.service';
import { GoogleAuthService } from 'src/app/auth/services/google-auth.service';
import { Observable, tap } from 'rxjs';
import { IGoogleAuthUser } from 'src/app/models/google-auth-user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass'],
})
export class HeaderComponent implements OnInit {
  isDarkTheme: boolean = false;
  user$: Observable<IGoogleAuthUser | null>;

  constructor(
    private readonly translate: LanguageService,
    private readonly colorTheme: ColorThemeService,
    private readonly userAuth: GoogleAuthService
  ) {
    this.user$ = this.userAuth.authUser$;
  }

  ngOnInit(): void {
    // Use LocalStorageService to read the theme
    this.colorTheme.theme$.subscribe((theme) => {
      this.isDarkTheme = theme === 'dark';
    });
  }

  public changeLang(langCode: string): void {
    this.translate.setLanguage(langCode);
  }

  public toggleTheme(event: MatSlideToggleChange) {
    const mode = event.checked ? 'dark' : 'light';
    this.colorTheme.setTheme(mode);
  }
}
