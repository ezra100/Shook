import {Component, OnInit} from '@angular/core';
import {Input} from '@angular/core';
import {Order} from '../../../../types';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  @Input() order: Order;
  dataSource;
  orderSum: number;
  displayedColumns: string[] = ['productID', 'quantity', 'price', 'total'];
  constructor() {}

  ngOnInit() {
    let sum = 0;
    this.dataSource = this.order.products;
    this.order.products.forEach(p => {
      p.totalPrice = p.currentPrice * p.quantity;
      sum += p.totalPrice;
    });
    this.orderSum = sum;
  }
}
