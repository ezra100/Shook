import {Component, ElementRef, OnInit, Renderer2} from '@angular/core';
import {ObservableMedia} from '@angular/flex-layout';
import {MatDialog, MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {first} from 'rxjs/operators';

import {categoryNames, Product} from '../../../../types';
import {AddProductComponent} from '../add-product/add-product.component';
import {AuthService} from '../auth.service';
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
  reachedEndOfFeed: boolean = false;
  filter: ProductFilter = new ProductFilter();
  fullCategoryName = categoryNames;
  public cols: number;
  timeoutID: NodeJS.Timer;
  addedProduct: Product = {};
  authService = AuthService;
  panelOpenState: boolean = false;
  constructor(
      private service: ProductsService, private router: Router,
      private route: ActivatedRoute, private observableMedia: ObservableMedia,
      public dialog: MatDialog) {
  }
  ngOnInit() {
    // credit http://disq.us/p/1ouo8m4
    const breakpoints:
        {[size: string]:
             number} = {['xs']: 1, ['sm']: 2, ['md']: 3, ['lg']: 4, ['xl']: 5};
    this.observableMedia.subscribe(x => this.cols = breakpoints[x.mqAlias]);

    let thisPF = this;
    this.route.queryParams.pipe(first()).subscribe(params => {
      if (params.filter) {
        this.filter = new ProductFilter(params.filter);
        this.filterProducts(false);
      }
    });
    this.sub = this.service.getLatest().subscribe(products => {
      thisPF.products = products;
    });
    // let elem = this.elementRef.nativeElement;
    // elem.height = screen.height * 2.5;
    // this.renderer.listen(elem, 'scroll', function() {
    //   if ($(elem).scrollTop() > 0.8 * $(elem).height()) {
    //     thisPF.loadMore();
    //   }
    // });
  }

  filterChanged(timeout: number = 700) {
    // clear the previous timeout
    clearTimeout(this.timeoutID);
    // set a new timeout
    this.timeoutID = setTimeout(() => this.filterProducts(true, this), timeout);
  }

  filterProducts(navigate: boolean = true, thisPF = this) {
    if (navigate) {
      let queryParams: Params = {filter: this.filter.stringify()};
      thisPF.router.navigate(
          [], {relativeTo: thisPF.route, replaceUrl: true, queryParams});
    }
    thisPF.sub && thisPF.sub.unsubscribe();
    thisPF.sub =
        thisPF.service.getLatest(0, null, thisPF.filter.toMongoFilter())
            .subscribe(products => {
              thisPF.products = products;
            });
  }
  loadMore() {
    if (this.loadingMore || this.reachedEndOfFeed) {
      return;
    }
    let thisPF = this;
    this.loadingMore = true;

    this.sub =
        this.service
            .getLatest(this.products.length, null, this.filter.toMongoFilter())
            .subscribe(products => {
              if (products.length === 0) {
                thisPF.reachedEndOfFeed = true;
              }
              thisPF.products.push(...products);
              thisPF.loadingMore = false;
            });
  }
  openDialog() {
    this.dialog.open(AddProductComponent, {data: this.addedProduct});
  }
}
