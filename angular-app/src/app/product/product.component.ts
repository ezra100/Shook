import {AfterViewInit, Component, ElementRef, Input, OnInit} from '@angular/core';
import * as jquery from 'jquery';

import {categoryNames, Product} from '../../../../types';

@Component({

  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit, AfterViewInit {
  ngAfterViewInit(): void {
    let subtitle = $(this.element.nativeElement).find('.product-subtitle');
    let height = subtitle.outerHeight();
    subtitle.dotdotdot && subtitle.dotdotdot({height});
  }
  @Input() product: Product;
  categoryNames = categoryNames;
  constructor(private element: ElementRef) {}

  ngOnInit() {}
}
