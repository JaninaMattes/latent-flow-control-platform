import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GoogleAuthService } from 'src/app/auth/services/google-auth.service';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.sass']
})
export class LoginDialogComponent {
  // constructor(
  //   private readonly dialogRef: MatDialogRef<LoginDialogComponent>,
  //   private readonly authService: GoogleAuthService
  // ) {}

  // loginWithGoogle() {
  //   this.authService.login();
  //   this.dialogRef.close();
  // }
}
