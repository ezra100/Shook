import {AfterViewInit, Component, ElementRef, Input, OnInit} from '@angular/core';
import * as jquery from 'jquery';

import {categoryNames, Product} from '../../../../types';
import {UsersService} from '../users.service';
import { AuthService } from '../auth.service';

@Component({

  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit, AfterViewInit {
  auth = AuthService;
  ngAfterViewInit(): void {
    let subtitle = $(this.element.nativeElement).find('.product-subtitle');
    // let height = subtitle.outerHeight();
    subtitle.dotdotdot &&
        setTimeout(
            () => subtitle.dotdotdot({
              watch: false /*as a reminder - watching means polling every 100 or
                              500 ms, very expensive  performance wise*/
            }),
            500);
  }
  @Input() product: Product;

  categoryNames = categoryNames;
  constructor(private element: ElementRef, private usersService: UsersService) {
  }

  ngOnInit() {}
  addToBasket() {
    this.usersService.addToBakset(this.product._id, this.product.quantity)
        .subscribe();
  }
}
