import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Product, Review} from '../../../../types';
import {ProductsService} from '../products.service';
import {ReviewsService} from '../reviews.service';

@Component({
  selector: 'app-product-full',
  templateUrl: './product-full.component.html',
  styleUrls: ['./product-full.component.scss']
})
export class ProductFullComponent implements OnInit {
  product: Product;
  reviews: Review[];
  constructor(
      private route: ActivatedRoute, private productService: ProductsService,
      private reviewsService: ReviewsService) {}

  ngOnInit() {
    const id: string = this.route.snapshot.paramMap.get('id');
    this.productService.getProductByID(id).subscribe(p => {
      this.product = p;
    });
    this.reviewsService.getByProductID(id).subscribe(reviews => {
      this.reviews = reviews;
    })
  }
}
