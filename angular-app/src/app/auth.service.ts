import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import * as jsSHA from 'jssha';
import {from, Observable} from 'rxjs';
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
    constructor(private http: HttpClient) {}

    login(username: string, password: string): Observable<User> {
      username = username.toLowerCase(); // all usernames must be lower-case
      let saltObs = this.http.post<Salts>('/api/auth/salts', {username})
                        .pipe(/* prevent double call*/ share());
      let obs = saltObs.pipe<User>(
          mergeMap((salts: Salts) => {
            let hashedPassword =
                sha512(sha512(password, salts.permSalt), salts.tempSalt);
            return this.http.put<User>(
                '/api/auth/login', {username, password: hashedPassword});
          }),
          share(), catchError(err => {
            // there's no way to instruct passport js what message to return on
            // failure, therefore
            // we change the message here
            if (err.error === 'Unauthorized') {
              err.error = 'Wrong username or password';
            }
            throw err;
          }));

      obs.subscribe(user => AuthService.currentUser = user);
      return obs;
    }

    logout() {
      let obs = this.http.put('/api/auth/logout', {}, {responseType: 'text'})
                    .pipe(share());
      obs.subscribe(() => AuthService.currentUser = null);
      return obs;
    }

    tryGetStoredLogin(): Observable<User> {
      let obs = this.http.get<User>('/api/users/me').pipe(share());
      obs.subscribe(user => AuthService.currentUser = user);
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
