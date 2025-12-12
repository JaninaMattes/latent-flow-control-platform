import { Component } from '@angular/core';
import { GoogleAuthService } from '../auth/services/google-auth.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})
export class HomeComponent {
  constructor(
    private readonly matIconRegistry: MatIconRegistry,
    private readonly sanitizer: DomSanitizer,
    private readonly userAuth: GoogleAuthService
  ) {
    this.matIconRegistry.addSvgIcon(
      'google',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/images/icons/google-logo.svg')
    );
  }

  public login() {
    this.userAuth.login();
  }
}
