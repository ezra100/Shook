import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material';

import {Product} from '../../../types';

import {AuthService} from './auth.service';
import {ProductsService} from './products.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  resizeTimeout: NodeJS.Timer;
  constructor(private authService: AuthService, public snackBar: MatSnackBar) {}
  ngOnInit(): void {
    $(window).resize(() => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout =
          setTimeout(() => $('.product-subtitle').dotdotdot(), 1000)
    });
    this.authService.tryGetStoredLogin().subscribe(
        user => this.snackBar.open(
            'Welcome ' + user.firstName + '!', 'Close', {duration: 3000}),
        err => console.log('User not logged in yet', err));
  }
  title = 'Shook';
}
