import { Component, OnInit } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatDialogRef, MatSnackBar } from '@angular/material';
import { Gender, User } from '../../../../types';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-signup-dialog',
  templateUrl: './signup-dialog.component.html',
  styleUrls: ['./signup-dialog.component.scss']
})
export class SignupDialogComponent implements OnInit {

  user : Partial<User> = {};
  lastSnackbar: MatSnackBarRef<SimpleSnackBar> = null;
  genderRef = Gender;
  constructor(
      public dialogRef: MatDialogRef<SignupDialogComponent>,
      public usersService: UsersService, public snackBar: MatSnackBar) {}

  ngOnInit() {}
  signup() {
    this.lastSnackbar && this.lastSnackbar.dismiss();
    this.usersService.signup(this.user).subscribe((user: User) => {
      this.snackBar.open(
        user.firstName + ' successfully signed up!', 'Close');
      this.dialogRef.close();
    }, err => {
      this.lastSnackbar = this.snackBar.open(err.error.message || err.error, 'OK', {
         duration: 4000
       })});
  }
  log(obj:any){
    console.log(obj);
  }
}
