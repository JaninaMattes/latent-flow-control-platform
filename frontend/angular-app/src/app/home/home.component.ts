import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../shared/components/login-dialog/login-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent {

  // constructor(private readonly dialog: MatDialog) {} 

  // openLoginDialog(): void {
  //   const dialogRef = this.dialog.open(LoginDialogComponent, {
  //     width: '400px', 
  //     disableClose: true 
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log('The dialog was closed', result);
  //   });
  // }
}