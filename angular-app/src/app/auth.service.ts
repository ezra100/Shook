import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ChangeDetectorRef} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import * as jsSHA from 'jssha';
import {EMPTY, Observable, Subject} from 'rxjs';
import {catchError, mergeMap, share} from 'rxjs/operators';

import {client_id} from '../../../google-auth';
import {User} from '../../../types';
import { ApplicationRef } from '@angular/core';

function sha512(password: string, salt: string): string {
  var shaObj = new jsSHA('SHA-512', 'TEXT');
  shaObj.setHMACKey(salt, 'TEXT');
  shaObj.update(password);
  return shaObj.getHMAC('HEX');
}
type Salts = {
  tempSalt: string
  permSalt: string
};


  @Injectable({providedIn: 'root'})
  export class AuthService {
    static currentUser: User;
    static loginSubject: Subject<User|null> = new Subject();
    static http: HttpClient = null;
    static appRef: ApplicationRef = null;
    constructor(
        private http: HttpClient, private router: Router,
        private appRef: ApplicationRef) {
      if (!AuthService.appRef) {
        AuthService.appRef = this.appRef;
      }
      if (!AuthService.http) {
        AuthService.http = this.http;
      }
    }

    static init() {
      AuthService.loginSubject.subscribe(
          user => AuthService.currentUser = user);
    }

    login(username: string, password: string): Observable<User> {
      username = username.toLowerCase();  // all usernames must be lower-case
      let saltObs = this.http.post<Salts>('/api/auth/salts', {username})
                        .pipe(/* prevent double call*/ share());
      let obs = saltObs.pipe<User>(
          mergeMap((salts: Salts) => {
            let hashedPassword =
                sha512(sha512(password, salts.permSalt), salts.tempSalt);
            return this.http.put<User>(
                '/api/auth/login', {username, password: hashedPassword});
          }),
          share());
      obs.subscribe(user => {
        AuthService.loginSubject.next(user);
      });
      return obs;
    }

    static onGoogleSignIn(googleUser: gapi.auth2.GoogleUser) {
      if (!AuthService.http) {
        console.log('http client not injected yet, trying in 500ms');
        setTimeout(() => AuthService.onGoogleSignIn(googleUser), 500);
      }
      var response = googleUser.getAuthResponse();
      let token = response.id_token;
      AuthService.http.put<User>('/api/auth/verify', {token})
          .subscribe(
              user => {
                if (user) {
                  AuthService.loginSubject.next(user);
                }
                AuthService.appRef.tick();
              },
              err => {
                console.log(err.error);
              });
    }

    tryGetGoogleUserProfile() {
      let auth2 = gapi.auth2.init({client_id: client_id});
      if (auth2.isSignedIn.get()) {
        var profile = auth2.currentUser.get().getBasicProfile();
        let user: Partial<User> = {
          email: profile.getEmail(),
          firstName: profile.getName(),
          lastName: profile.getFamilyName(),
          imageURL: profile.getImageUrl()
        };
        return user;
      }
      return null;
    }

    logout() {
      // logout from google first
      var auth2 = gapi.auth2.getAuthInstance();
      auth2 && auth2.signOut().then(function() {
        console.log('Google user signed out.');
      });
      let obs = this.http.put('/api/auth/logout', {}, {responseType: 'text'})
                    .pipe(share());
      // for security, don't keep showing sensivtive data
      this.router.navigate(['/home']);

      obs.subscribe(() => AuthService.loginSubject.next());
      return obs;
    }

    tryGetStoredLogin(): Observable<User> {
      let obs = this.http.get<User>('/api/users/me')
                    .pipe(share(), catchError((err) => {
                            console.log(err.error);
                            return EMPTY;
                          }));
      obs.subscribe(user => {
        AuthService.loginSubject.next(user);
      });
      return obs;
    }

    requestPasswordReset(username?: string, email?: string) {
      if (!(email || username)) {
        throw 'you must provide email or a username';
      }
      let body: any = {};
      if (email) {
        body.email = email;
      } else {
        body.username = username;
      }
      return this.http.post('/api/auth/reset/request', body);
    }

    completeReset(key: string, username: string, newPassword: string) {
      return this.http.post(
          '/api/auth/reset/complete', {key, username, newPassword});
    }
  }
  AuthService.init();
  (<any>window).onSignIn = AuthService.onGoogleSignIn;