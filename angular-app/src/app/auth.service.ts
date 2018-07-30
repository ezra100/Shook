import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import * as jsSHA from 'jssha';
import {from, Observable} from 'rxjs';
import {mergeMap} from 'rxjs/operators';

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
      let saltObs = this.http.post<Salts>('/auth/salts', {username});
      let obs =
          from(saltObs.toPromise()).pipe<User>(mergeMap((salts: Salts) => {
            console.log('salts2:' + salts.tempSalt);
            let hashedPassword =
                sha512(sha512(password, salts.permSalt), salts.tempSalt);
            return this.http.put<User>(
                '/auth/login', {username, password: hashedPassword});
          }));
      obs.subscribe(user => AuthService.currentUser = user);
      return obs;
    }

    logout() {
      let obs = this.http.put('/auth/logout', {}, {responseType: 'text'});
      obs.subscribe(() => AuthService.currentUser = null);
      return obs;
    }

    tryGetStoredLogin(): Observable<User> {
      let obs = this.http.get<User>('/users/me');
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
      return this.http.post('/auth/reset/request', body);
    }

    completeReset(key: string, username: string, newPassword: string) {
      return this.http.post(
          '/auth/reset/complete', {key, username, newPassword})
    }
  }
