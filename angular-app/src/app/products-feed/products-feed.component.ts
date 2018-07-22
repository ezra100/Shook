import {Component, ElementRef, Input, OnInit, Renderer, Renderer2} from '@angular/core';
import {ObservableMedia} from '@angular/flex-layout';
import {FormControl} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import * as $ from 'jquery';
import {Observable, Subscription} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {categoryNames, filters, Product} from '../../../../types';
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
  reload = false;
  public cols: number;

  constructor(
      private service: ProductsService, private elementRef: ElementRef,
      private renderer: Renderer2, private router: Router,
      private route: ActivatedRoute, private observableMedia: ObservableMedia) {
  }
  ngOnInit() {
    // credit http://disq.us/p/1ouo8m4
    const breakpoints:
        {[size: string]:
             number} = {['xs']: 1, ['sm']: 2, ['md']: 3, ['lg']: 4, ['xl']: 5};
    this.observableMedia.subscribe(x => this.cols = breakpoints[x.mqAlias]);

    if (this.reload) {
      return;
    }
    let thisPF = this;
    this.route.queryParams.subscribe(params => {
      if (params.filter) {
        this.filter = new ProductFilter(params.filter);
        this.filterProducts(false);
      }
    });
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
  filterProducts(navigate: boolean = true) {
    if (navigate) {
      this.reload = true;
      let queryParams: Params = {filter: this.filter.stringify()};
      this.router.navigate(
          [], {relativeTo: this.route, replaceUrl: true, queryParams});
    }
    this.sub && this.sub.unsubscribe();
    this.sub =
        this.service.getProductsObserver(0, null, this.filter.toMongoFilter())
            .subscribe(products => {
              this.products = products;
            });
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
