import {Component, OnInit} from '@angular/core';

import {Order} from '../../../../types';
import {OrdersService} from '../orders.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  pageEvent = {pageIndex:0, pageSize:1};
  orders: Order[] = [];
  constructor(private orderService: OrdersService) {}

  ngOnInit() {
    this.orderService.getMyOrders().subscribe(orders => this.orders = orders)
  }
}
