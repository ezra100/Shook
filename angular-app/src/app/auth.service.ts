import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import * as jsSHA from 'jssha';
import {Observable} from 'rxjs';
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
    currentUser: User;
    constructor(private http: HttpClient) {}

    login(username: string, password: string): Observable<User> {
      let obs = this.http.get<Salts>('/auth/salts')
                    .pipe<User>(mergeMap((salts: Salts) => {
                      let hashedPassword = sha512(
                          sha512(password, salts.permSalt), salts.tempSalt);
                      return this.http.put<User>(
                          '/auth/login', {username, password: hashedPassword});
                    }));
      obs.subscribe(user => this.currentUser = user);
      return obs;
    }

    logout() {
      return this.http.put('/auth/logout', {});
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
