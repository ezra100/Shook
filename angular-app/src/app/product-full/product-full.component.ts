import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Product} from '../../../../types';
import {ProductsService} from '../products.service';

@Component({
  selector: 'app-product-full',
  templateUrl: './product-full.component.html',
  styleUrls: ['./product-full.component.scss']
})
export class ProductFullComponent implements OnInit {
  product: Product;
  comments: Comment [] = [];
  constructor(
      private route: ActivatedRoute, private productService: ProductsService) {}

  ngOnInit() {
    const id: string = this.route.snapshot.paramMap.get('id');
    this.productService.getProductByID(id).subscribe(p => this.product = p);
    
  }
}
