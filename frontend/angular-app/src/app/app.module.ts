import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { MatSliderModule } from '@angular/material/slider';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { HomeComponent } from './home/home.component';
import { ContentComponent } from './content/content.component';
import { GalleriaComponent } from './galleria/galleria.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export function createTranslationLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

const modules = [
  MatSliderModule,
  BrowserModule,
  BrowserAnimationsModule,
  MatButtonModule,
  MatIconModule,
  HttpClientModule,
  LoggerModule.forRoot({
    level: NgxLoggerLevel.TRACE, // remove later just for debugging
    disableConsoleLogging: false,
  }),
  TranslateModule.forRoot({
    defaultLanguage: 'en',
    loader: {
      provide: TranslateLoader,
      useFactory: createTranslationLoader,
      deps: [HttpClient],
    },
  }),
  // Application Modules
  SharedModule,
  AppRoutingModule,
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ContentComponent,
    GalleriaComponent
  ],
  imports: modules,
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
