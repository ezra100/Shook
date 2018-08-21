import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef, MatSnackBar, MatSnackBarRef, SimpleSnackBar} from '@angular/material';

import {Gender, User} from '../../../../types';
import {AuthService} from '../auth.service';
import {UsersService} from '../users.service';
import { MySnackbarService } from '../my-snackbar.service';

@Component({
  selector: 'app-update-user-details-modal',
  templateUrl: './update-user-details-modal.component.html',
  styleUrls: ['./update-user-details-modal.component.scss']
})
export class UpdateUserDetailsModalComponent implements OnInit {
  @ViewChild('imgFileInput') imgFileInput: ElementRef;
  user: Partial<User> = {};
  lastSnackbar: MatSnackBarRef<SimpleSnackBar> = null;
  genderRef = Gender;
  constructor(
      public dialogRef: MatDialogRef<UpdateUserDetailsModalComponent>,
      public usersService: UsersService, public snackBar: MatSnackBar, private snackbarService : MySnackbarService) {}

  ngOnInit() {
    this.user = Object.assign({}, AuthService.currentUser);
  }
  update() {
    this.lastSnackbar && this.lastSnackbar.dismiss();
    let file: File = null;
    let element = <HTMLInputElement>this.imgFileInput.nativeElement;
    if (element.files && element.files[0]) {
      file = element.files[0];
    }
    let obs = this.usersService.updateUserDetails(this.user, file);
    this.snackbarService.subscribeToSnackBar(obs);
  }
  log(obj: any) {
    console.log(obj);
  }
}
