import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GoogleAuthService } from 'src/app/auth/services/google-auth.service';

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.sass']
})
export class ProfileDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly dialogRef: MatDialogRef<ProfileDialogComponent>,
    private readonly auth: GoogleAuthService
  ) {}

  logout() {
    this.auth.logout();
    this.dialogRef.close();
  }
}
