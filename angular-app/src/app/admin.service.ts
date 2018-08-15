import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {User} from '../../../types';

@Injectable({providedIn: 'root'})
export class AdminService {
  constructor(private http: HttpClient) {}
  authorizeUser(userID: string) {
    return this.http.put<User>('/api/admin/authorizeUser', {userID});
  }
  deleteUser(userID: string) {
    return this.http.put<User>('/api/admin/deleteUser', {userID});
  }
  getAwaitingUsers() {
    return this.http.get<User[]>('/api/admin/usersToAuthorize');
  }
}
