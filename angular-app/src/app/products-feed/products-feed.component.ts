import { Component, OnInit } from '@angular/core';
import { IProduct } from '../../../../types';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-products-feed',
  templateUrl: './products-feed.component.html',
  styleUrls: ['./products-feed.component.scss']
})
export class ProductsFeedComponent implements OnInit {

  products: IProduct[] = [];
  constructor(private service: ProductsService) {
  }
  ngOnInit() {
    this.subscribeToProducts();
  }
  subscribeToProducts() {
    this.service.getProductsObserver().subscribe(products => this.products = products);
  }

}
