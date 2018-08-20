import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {first} from 'rxjs/operators';

import {AuthService} from '../auth.service';

@Component({
  selector: 'app-reset-modal',
  templateUrl: './reset-modal.component.html',
  styleUrls: ['./reset-modal.component.scss']
})
export class ResetModalComponent implements OnInit {
  userID: string;
  key: string;
  newPassword: string;
  constructor(
      private route: ActivatedRoute, private authService: AuthService,
      public snackBar: MatSnackBar, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.pipe(first()).subscribe(params => {
      this.userID = params.userID;
      this.key = params.key;
    });
  }
  resetPassword() {
    this.authService.completeReset(this.key, this.userID, this.newPassword)
        .subscribe(
            (msg: string) => {
              this.snackBar.open(msg, 'OK');
              this.router.navigate(['/home']);
            },
            err => {
              this.snackBar.open(err.error || err, 'OK');
            });
    ;
  }
}
