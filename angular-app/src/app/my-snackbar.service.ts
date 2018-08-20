import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class MySnackbarService {
  constructor(public snackBar: MatSnackBar) {}

  sendSnackBar(msgObservable: Observable<string|Object>) {
    let self = this;
    msgObservable.subscribe(
        msg => {
          self.snackBar.open(
              typeof msg === 'string' ? msg : JSON.stringify(msg), 'Close');
        },
        err => {
          self.snackBar.open(
              typeof err.error === 'string' ? err.error : err, 'OK',
              {duration: 3500, panelClass: 'snackbar-error'});
        })
  }
}
