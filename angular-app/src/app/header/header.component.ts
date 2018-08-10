import {Component, OnInit} from '@angular/core';
import {MatDialog, MatIconRegistry, MatSnackBar} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

import {AuthService} from '../auth.service';
import {LoginFormComponent} from '../login-form/login-form.component';
import { SignupDialogComponent } from '../signup-dialog/signup-dialog.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  auth = AuthService;
  constructor(
      public dialog: MatDialog, iconRegistry: MatIconRegistry,
      sanitizer: DomSanitizer, private authService: AuthService,
      public snackBar: MatSnackBar) {
    iconRegistry.addSvgIcon(
        'account',
        sanitizer.bypassSecurityTrustResourceUrl(
            'assets/icons/sharp-account_box-24px.svg'));
  }

  ngOnInit() {}
  onGoToProducts() {
    
  }
  openLoginDialog() {
    this.dialog.open(LoginFormComponent);
  }
  openSignupDialog() {
    this.dialog.open(SignupDialogComponent);
  }
  logout() {
    this.authService.logout().subscribe(
        msg => this.snackBar.open(msg, 'Close', {duration: 3000}), err => this.snackBar.open(err.message, "OK", {duration: 3000}));
  }
}
