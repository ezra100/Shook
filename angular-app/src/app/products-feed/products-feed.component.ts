import {Component, ElementRef, Input, OnInit, Renderer, Renderer2} from '@angular/core';
import {FormControl} from '@angular/forms';
import * as $ from 'jquery';
import {Subscription} from 'rxjs';

import {filters, categoryNames, Product} from '../../../../types';
import {ProductFilter} from '../product-filter';
import {ProductsService} from '../products.service';

@Component({
  selector: 'app-products-feed',
  templateUrl: './products-feed.component.html',
  styleUrls: ['./products-feed.component.scss']
})
export class ProductsFeedComponent implements OnInit {
  products: Product[] = [];
  sub: Subscription;
  loadingMore: boolean = false;
  endOfFeed: boolean = false;
  filter: ProductFilter = new ProductFilter();
  beforeControl = new FormControl(this.filter.date.before);
  afterControl = new FormControl(this.filter.date.after);
  fullCategoryName = categoryNames;

  constructor(
      private service: ProductsService,private elementRef: ElementRef,
      private renderer: Renderer2) {
    }
  ngOnInit() {
    let thisPF = this;
    this.sub = this.service.getProductsObserver().subscribe(products => {
      thisPF.products = products;
    });
    let elem = this.elementRef.nativeElement;
    elem.height = screen.height * 2.5;
    this.renderer.listen(elem, 'scroll', function() {
      if ($(elem).scrollTop() > 0.8 * $(elem).height()) {
        thisPF.loadMore();
      }
    });
  }
  filterProducts() {
    this.sub.unsubscribe();
    this.sub =
        this.service.getProductsObserver(0, null, this.filter.toMongoFilter())
            .subscribe(products => this.products = products);
  }
  loadMore() {
    if (this.loadingMore || this.endOfFeed) {
      return;
    }
    let thisPF = this;
    this.loadingMore = true;

    this.sub = this.service
                   .getProductsObserver(
                       this.products.length, null, this.filter.toMongoFilter())
                   .subscribe(products => {
                     if (products.length === 0) {
                       thisPF.endOfFeed = true;
                     }
                     thisPF.products.push(...products);
                     thisPF.loadingMore = false;
                   });
  }
}
