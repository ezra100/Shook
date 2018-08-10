import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  getBasketSum(){
    return this.http.get('/api/users/basketSum');
  }
}
