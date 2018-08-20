import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {User, Product} from '../../../types';
import {helpers} from './helpers';
import { share } from 'rxjs/internal/operators/share';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class UsersService {
  constructor(private http: HttpClient) {}
  signup(user: Partial<User>, file?: File) {
    let formData = new FormData();
    for(let key in user){
      formData.append(key, user[key]);
    }
    if(file){
      formData.append('imgFile', file);
    }
    let obs = this.http.post('/api/users/signup', formData).pipe(share());
    obs.subscribe();
    return obs;
  }
  updateUserDetails(user: Partial<User>, file?: File) {
    let formData = new FormData();
    for(let key in user){
      formData.append(key, user[key]);
    }
    if(file){
      formData.append('imgFile', file);
    }
    let obs = this.http.put('/api/users/updateDetails', formData).pipe(share());
    obs.subscribe();
    return obs;
  }
  follow(followee: string) {
    let obs = this.http.put('/api/users/follow', followee).pipe(share());
    obs.subscribe();
    return obs;
  }
  unfollow(followee: string) {
    let obs = this.http.put('/api/users/unfollow', followee).pipe(share());
    obs.subscribe();
    return obs;
  }
  addToBakset(productID: string, quantity: number) {
    let obs = this.http.put('/api/users/addToBasket', {productID, quantity}).pipe(share());
    obs.subscribe();
    return obs;
  }
  removeFromBasket(productID: string) {
    return this.addToBakset(productID, 0);
  }
  getUser(id: string) {
    return this.http.get<User>(
        '/api/users/user', {params: new HttpParams({fromObject: {_id: id}})})
  }
  getBasket() {
    return this.http.get<Product[]>('/api/users/basket');
  }
  getUserList(query: string) {
    return this.http.get<User[]>(
        '/api/users/usersList',
        {params: new HttpParams({fromObject: {query}})});
  }
}
