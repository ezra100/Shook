import {Component, OnInit} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';

import {AuthService} from '../auth.service';
import {LoginFormComponent} from '../login-form/login-form.component';
import {SignupDialogComponent} from '../signup-dialog/signup-dialog.component';
import {UpdateUserDetailsModalComponent} from '../update-user-details-modal/update-user-details-modal.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  auth = AuthService;
  constructor(
      public dialog: MatDialog, private authService: AuthService,
      public snackBar: MatSnackBar) {}

  ngOnInit() {}
  onGoToProducts() {}
  openLoginDialog() {
    this.dialog.open(LoginFormComponent);
  }
  openSignupDialog() {
    this.dialog.open(SignupDialogComponent);
  }
  openUpdateDialog() {
    this.dialog.open(UpdateUserDetailsModalComponent);
  }
  logout() {
    this.authService.logout().subscribe(
        msg => this.snackBar.open(msg, 'Close', {duration: 3000}),
        err => this.snackBar.open(err.message, 'OK', {duration: 3000}));
  }
}
