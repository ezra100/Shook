import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ProductsService} from 'src/app/products.service';

import {categoryNames, Product} from '../../../../types';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit {
  fullCategoryName = categoryNames;
  constructor(
      public productService: ProductsService,
      public dialogRef: MatDialogRef<AddProductComponent>,
      @Inject(MAT_DIALOG_DATA) public product: Product) {}
  ngOnInit() {
  }
  addProduct() {
    // todo - clear form once submitted successfully
    let obs = this.productService.addProduct(this.product);
    this.dialogRef.close();
    return obs;
  }
}
