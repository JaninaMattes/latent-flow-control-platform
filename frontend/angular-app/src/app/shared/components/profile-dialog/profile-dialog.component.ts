// profile-dialog.component.ts
import { Component, Input } from "@angular/core";
import { GoogleAuthService } from "src/app/auth/services/google-auth.service";
import { IGoogleAuthUser } from "src/app/models/google-auth-user.model";

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.sass']
})
export class ProfileDialogComponent {
  
  @Input() user: IGoogleAuthUser | null = null;

  constructor(private readonly userAuth: GoogleAuthService) {}

  logout() {
    this.userAuth.logout();
  }
}
