import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatDialogRef, MatSnackBar } from '@angular/material';
import { Gender, User } from '../../../../types';
import { UsersService } from '../users.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup-dialog',
  templateUrl: './signup-dialog.component.html',
  styleUrls: ['./signup-dialog.component.scss']
})
export class SignupDialogComponent implements OnInit {
  @ViewChild('imgFileInput') imgFileInput:ElementRef;
  user : Partial<User> = {};
  lastSnackbar: MatSnackBarRef<SimpleSnackBar> = null;
  genderRef = Gender;
  constructor(
      public dialogRef: MatDialogRef<SignupDialogComponent>,
      public usersService: UsersService, public snackBar: MatSnackBar, public authService: AuthService) {
        //suggest the user his google profile details to sign-up with
        let user = this.authService.tryGetGoogleUserProfile();
        if(user){
          this.user = user;
        } 
      }

  ngOnInit() {}
  signup() {
    this.lastSnackbar && this.lastSnackbar.dismiss();
    let file : File = null;
    if(!this.user.imageURL){
      let element = <HTMLInputElement> this.imgFileInput.nativeElement;
      if(element.files && element.files[0] ){
        file =  element.files[0];
      }
      else{
        console.error('no img url, and no img file either');
        return;
      }
    }
    this.usersService.signup(this.user, file).subscribe((user: User) => {
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
