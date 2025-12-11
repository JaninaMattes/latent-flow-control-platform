import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject } from "rxjs";
import { LocalStorageService } from "./local-storage.service";

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly currentLangSubject = new BehaviorSubject<string>('en');
  public readonly currentLang$ = this.currentLangSubject.asObservable();

  constructor(
    private readonly translate: TranslateService,
    private readonly storage: LocalStorageService
  ) {
    const saved = this.storage.getItem<string>('selectedLang') || 'en';
    this.setLanguage(saved);
  }

  public setLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLangSubject.next(lang);
    this.storage.setItem('selectedLang', lang);
  }

  public get currentLanguage(): string {
    return this.currentLangSubject.value;
  }
}
