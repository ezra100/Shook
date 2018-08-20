import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {User, Product, Basket} from '../../../types';
import {helpers} from './helpers';

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
    return this.http.post('/api/users/signup', formData);
  }
  updateUserDetails(user: Partial<User>, file?: File) {
    let formData = new FormData();
    for(let key in user){
      formData.append(key, user[key]);
    }
    if(file){
      formData.append('imgFile', file);
    }
    return this.http.put('/api/users/updateDetails', formData);
  }
  follow(followee: string) {
    return this.http.put('/api/users/follow', followee);
  }
  unfollow(followee: string) {
    return this.http.put('/api/users/unfollow', followee);
  }
  addToBakset(productID: string, quantity: number) {
    return this.http.put('/api/users/addToBasket', {productID, quantity});
  }
  removeFromBasket(productID: string) {
    return this.addToBakset(productID, 0);
  }
  getUser(id: string) {
    return this.http.get<User>(
        '/api/users/user', {params: new HttpParams({fromObject: {_id: id}})})
  }
  getBasket() {
    return this.http.get<Bakset>('/api/users/basket');
  }
  getUserList(query: string) {
    return this.http.get<User[]>(
        '/api/users/usersList',
        {params: new HttpParams({fromObject: {query}})});
  }
}
