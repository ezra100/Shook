import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {from, Observable, Operator} from 'rxjs';

import {Category, Product} from '../../../types';
import {MongoProductFilter} from './product-filter';


@Injectable({providedIn: 'root'})
export class ProductsService {
  constructor(private http: HttpClient) {}

  getProductsObserver(
      offset: number = 0, limit: number = 100,
      filter: MongoProductFilter = {}): Observable<Product[]> {
    let body: any = {offset, limit, filter: JSON.stringify(filter)};
    let params = new HttpParams({fromObject: body});
    return this.http.get<Product[]>('/products/getLatest', {params});
  }
  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>('/products/add', product);
  }
  updateProduct(
      id: string, title?: string, subtitle?: string, link?: URL, price?: number,
      category?: Category) {
    let product: Product =
        {_id: id, title, category, subtitle, link: link.toString(), price};
    return this.http.put<Product>('/products/update', product);
  }

  getProductByID(id: string) {
    return this.http.get<Product>(
        '/products/getByID', {params: new HttpParams({fromObject: {id}})});
  }

  deleteProduct(id: string) {
    return this.http.delete<Product>(
        '/products/getByID', {params: new HttpParams({fromObject: {id}})});
  }

  getAvgRatring(id: string) {
    return this.http.get<number>(
        '/products/getAvgRating', {params: new HttpParams({fromObject: {id}})});
  }

  getMyFeed() {
    return this.http.get<Product[]>('/products/myFeed');
  }
}
