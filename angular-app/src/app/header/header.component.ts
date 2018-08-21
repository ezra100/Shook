import {Component, OnInit} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';

import {AuthService} from '../auth.service';
import {LoginFormComponent} from '../login-form/login-form.component';
import {SignupDialogComponent} from '../signup-dialog/signup-dialog.component';
import {UpdateUserDetailsModalComponent} from '../update-user-details-modal/update-user-details-modal.component';
import { UserType } from '../../../../types';
import {MySnackbarService} from '../my-snackbar.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  auth = AuthService;
  constructor(
      public dialog: MatDialog, private authService: AuthService,
      public snackBar: MatSnackBar, private sbService: MySnackbarService) {}

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
    let obs = this.authService.logout();
    this.sbService.subscribeToSnackBar(obs);
  }
  isUserAdmin(){
    return this.auth.currentUser && this.auth.currentUser.userType === UserType.Admin;
  }
}
