import {Component, Input, OnInit} from '@angular/core';
import {Product, categoryNames} from '../../../../types';

@Component({

  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  @Input() product: Product;
  categoryNames = categoryNames;
  constructor() {}

  ngOnInit() {}
}
