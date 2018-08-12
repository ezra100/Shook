import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../../../types';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient ) { }
  signup(user: Partial<User>){
    return this.http.post('/api/users/signup', user);
  }
  updateUserDetails(user : Partial<User>){
    return this.http.put('/api/users/updateDetails', user);
  }
  follow(followee : string){
    return this.http.put('/api/users/follow', followee);
  }
  unfollow(followee : string){
    return this.http.put('/api/users/unfollow', followee);
  }
  addToBakset(productID: string, quantity : number){
    return this.http.put('/api/users/addToBasket', {productID, quantity});
  }
  removeFromBasket(productID : string){
    return this.addToBakset(productID, 0);
  }
  getUser(id: string){
    return this.http.get<User>('/api/users/user', {params: new HttpParams({fromObject:{_id:id}})})
  }
  getBasketSum(){
    return this.http.get('/api/users/basketSum');
  }
}
