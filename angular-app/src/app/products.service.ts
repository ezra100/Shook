

import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable,from, Operator} from 'rxjs';
import {mergeMap} from 'rxjs/operators';

import {IProduct} from '../../../types';


@Injectable({providedIn: 'root'})
export class ProductsService {
  constructor(private http: HttpClient) {}

  getProductsObserver(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>( '/products/getLatest');
  }
  addProduct(title: string, subtitle: string, link: URL, price: number):
      Observable<IProduct> {
    let product: IProduct = {title, subtitle, link: link.toString(), price};
    return this.http.post<IProduct>('/products/add', product);
  }
}
