import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import * as jsSHA from 'jssha';
import {EMPTY, Observable, Subject} from 'rxjs';
import {catchError, mergeMap, share} from 'rxjs/operators';

import {User} from '../../../types';

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
    constructor(private http: HttpClient, private router: Router) {
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
      AuthService.http.put<User>('/api/auth/verify', {token}).subscribe(
        user => {
          if(user){
            AuthService.loginSubject.next(user);
          }
        }, err =>{console.log(err.error)}
      );
    }

    logout() {
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

    requestPasswordReset(email?: string, username?: string) {
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
          '/api/auth/reset/complete', {key, username, newPassword})
    }
  }
  AuthService.init();
  (<any>window).onSignIn = AuthService.onGoogleSignIn;