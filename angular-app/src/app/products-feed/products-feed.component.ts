import {Component, ElementRef, Input, OnInit, Renderer, Renderer2} from '@angular/core';
import {FormControl} from '@angular/forms';
import * as $ from 'jquery';
import {Subscription} from 'rxjs';

import {filters, IProduct} from '../../../../types';
import {ProductFilter} from '../product-filter';
import {ProductsService} from '../products.service';

@Component({
  selector: 'app-products-feed',
  templateUrl: './products-feed.component.html',
  styleUrls: ['./products-feed.component.scss']
})
export class ProductsFeedComponent implements OnInit {
  products: IProduct[] = [];
  sub: Subscription;
  loadingMore: boolean = false;
  filter: ProductFilter = new ProductFilter();
  beforeControlle = new FormControl(this.filter.date.before);
  afterControlle = new FormControl(this.filter.date.after);

  constructor(
      private service: ProductsService, elementRef: ElementRef,
      renderer: Renderer2) {
    let thisPF = this;
    let elem = $('#products');
    renderer.listen(document, 'scroll', function() {
      if ($(document).scrollTop() > 0.8 * $(document).height()) {
        thisPF.loadMore();
      }
    });
  }
  ngOnInit() {
    let thisPF = this;
    this.sub = this.service.getProductsObserver().subscribe(products => {
      thisPF.products = products;
    });
  }
  filterProducts() {
    this.sub.unsubscribe();
    this.sub =
        this.service.getProductsObserver(0, null, this.filter.toMongoFilter())
            .subscribe(products => this.products = products);
  }
  loadMore() {
    if (this.loadingMore) {
      return;
    }
    let thisPF = this;
    this.loadingMore = true;

    this.sub = this.service
                   .getProductsObserver(
                       this.products.length, null, this.filter.toMongoFilter())
                   .subscribe(products => {
                     thisPF.products.push(...products);
                     thisPF.loadingMore = false;
                   });
  }
}
