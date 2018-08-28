import {Component, ElementRef, OnInit, Renderer2} from '@angular/core';
import {ObservableMedia} from '@angular/flex-layout';
import {MatDialog, MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {first, map} from 'rxjs/operators';

import {categoryNames, Product} from '../../../../types';
import {AddProductComponent} from '../add-product/add-product.component';
import {AuthService} from '../auth.service';
import {MySnackbarService} from '../my-snackbar.service';
import {ProductFilter} from '../product-filter';
import {ProductsService} from '../products.service';
import {UsersService} from '../users.service';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent implements OnInit {
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
      private basketService: UsersService, private router: Router,
      private route: ActivatedRoute, private observableMedia: ObservableMedia,
      public dialog: MatDialog, private sbService: MySnackbarService) {}
  ngOnInit() {
    // credit http://disq.us/p/1ouo8m4
    const breakpoints:
        {[size: string]:
             number} = {['xs']: 1, ['sm']: 2, ['md']: 3, ['lg']: 4, ['xl']: 5};
    this.observableMedia.subscribe(x => this.cols = breakpoints[x.mqAlias]);

    let thisPF = this;
    this.sub = this.basketService.getBasket().subscribe(basket => {
      thisPF.products = basket;
    });
  }


  openDialog() {
    this.dialog.open(AddProductComponent, {data: this.addedProduct});
  }
  order() {
    let self = this;
    let obs = this.basketService.makeOrder().pipe(map(x => {
      this.products = [];
      return 'Order succesfully created';
    }));
    this.sbService.subscribeToSnackBar(obs);
  }
}
