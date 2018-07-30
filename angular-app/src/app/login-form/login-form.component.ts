import { Component, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  username: string = "";
  password: string = "";
  constructor(public dialogRef: MatDialogRef<LoginFormComponent>, public authService: AuthService, public snackBar: MatSnackBar ) { }

  ngOnInit() {
  }
  login(){
    this.authService.login(this.username, this.password).subscribe(
      user => {
        this.snackBar.open("Welcome " + user.firstName, "Close", {duration: 1500});
        this.dialogRef.close();
      }, err => {
        this.snackBar.open(err.status === 401? "Wrong username or password" : err.message, "OK", {duration: 2000})
      }
    );
  }
}
