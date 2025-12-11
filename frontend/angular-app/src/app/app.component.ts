import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserActivityService } from './auth/services/google-user-inactivity.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent {
  title = 'angular-app-fe';

  constructor(
    private readonly translate: TranslateService,
    private readonly activity: UserActivityService
  ) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');

    // Initialize user activity tracking
    this.activity.init();
  }
}
