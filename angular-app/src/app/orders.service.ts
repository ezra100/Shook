import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from '../../../types';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(private http : HttpClient) { }
  getMyOrders(){
    return this.http.get<Order[]>('/api/orders/myOrders');
  }
}
