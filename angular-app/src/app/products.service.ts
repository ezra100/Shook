

import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {from, Observable, Operator} from 'rxjs';
import {mergeMap} from 'rxjs/operators';

import {helpers} from '../../../helpers';
import {filters, IProduct} from '../../../types';


@Injectable({providedIn: 'root'})
export class ProductsService {
  constructor(private http: HttpClient) {}

  getProductsObserver(
      offset: number = 0, limit: number = 100,
      filter: filters.ProductFilter = {}): Observable<IProduct[]> {
    let body: any = {offset, limit, filter};

    body.filter = filter;
    let params = new HttpParams({fromObject: body});
    return this.http.get<IProduct[]>('/products/getLatest', {params});
  }
  addProduct(title: string, subtitle: string, link: URL, price: number):
      Observable<IProduct> {
    let product: IProduct = {title, subtitle, link: link.toString(), price};
    return this.http.post<IProduct>('/products/add', product);
  }
  updateProduct(
      id: string, title?: string, subtitle?: string, link?: URL,
      price?: number) {
    let product:
        IProduct = {_id: id, title, subtitle, link: link.toString(), price};
    return this.http.put<IProduct>('/products/update', product);
  }

  getProductByID(id: string) {
    return this.http.get<IProduct>(
        '/products/getByID', {params: new HttpParams({fromObject: {id}})});
  }

  deleteProduct(id: string) {
    return this.http.delete<IProduct>(
        '/products/getByID', {params: new HttpParams({fromObject: {id}})});
  }

  getAvgRatring(id: string) {
    return this.http.get<number>(
        '/products/getAvgRating', {params: new HttpParams({fromObject: {id}})});
  }

  getMyFeed() {
    return this.http.get<IProduct[]>('/products/myFeed');
  }
}
