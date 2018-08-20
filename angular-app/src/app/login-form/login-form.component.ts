import {Component, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar, MatSnackBarRef, SimpleSnackBar} from '@angular/material';

import {AuthService} from '../auth.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  username: string = '';
  password: string = '';
  lastSnackbar: MatSnackBarRef<SimpleSnackBar> = null;
  constructor(
      public dialogRef: MatDialogRef<LoginFormComponent>,
      public authService: AuthService, public snackBar: MatSnackBar) {}

  ngOnInit() {}
  login() {
    this.lastSnackbar && this.lastSnackbar.dismiss();
    this.authService.login(this.username, this.password).subscribe(user => {
      this.snackBar.open(
          'Welcome ' + user.firstName + '!', 'Close', {duration: 3000});
      this.dialogRef.close();
    }, err => {
      this.lastSnackbar = this.snackBar.open(err.error, 'OK', {
         duration: 4000
       })});
  }
  resetPassword(userID: string){
    this.authService.requestPasswordReset(userID).subscribe(
      (msg: string) => this.snackBar.open(msg, 'OK')
    );
    this.dialogRef.close();
  }
}
