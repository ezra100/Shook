import {Component, ElementRef, Input, OnInit, Renderer, Renderer2} from '@angular/core';
import {Subscription} from 'rxjs';

import {filters, IProduct} from '../../../../types';
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
  @Input() filter: filters.ProductFilter;
  constructor(
      private service: ProductsService, elementRef: ElementRef,
      renderer: Renderer2) {
    let thisPF = this;
    renderer.listen(elementRef.nativeElement, 'scroll', function() {
      if ($(elementRef.nativeElement).scrollTop() +
              $(elementRef.nativeElement).height() >
          0.8 * $(elementRef.nativeElement).height()) {
        thisPF.loadMore();
      }
    });
  }
  ngOnInit() {
    this.sub = this.service.getProductsObserver().subscribe(
        products => this.products = products);
  }
  filterProducts() {
    this.sub.unsubscribe();
    this.sub = this.service.getProductsObserver(0, null, this.filter)
                   .subscribe(products => this.products = products);
  }
  loadMore() {
    if (this.loadingMore) {
      return;
    }
    this.loadingMore = true;
    this.sub = this.service
                   .getProductsObserver(this.products.length, null, this.filter)
                   .subscribe(products => this.products.concat(products));
  }
}
