import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {from, Observable, Operator} from 'rxjs';
import {share} from 'rxjs/operators';

import {Category, Product} from '../../../types';

import {MongoProductFilter} from './product-filter';


@Injectable({providedIn: 'root'})
export class ProductsService {
  constructor(private http: HttpClient) {}

  getLatest(
      offset: number = 0, limit: number = 100,
      filter: MongoProductFilter = {}): Observable<Product[]> {
    let body: any = {offset, limit, filter: JSON.stringify(filter)};
    let params = new HttpParams({fromObject: body});
    return this.http.get<Product[]>('/api/products/getLatest', {params});
  }
  addProduct(product: Product): Observable<Product> {
    let obs =
        this.http.post<Product>('/api/products/add', product).pipe(share());
    obs.subscribe();
    return obs;
  }
  updateProduct(
      id: string, title?: string, subtitle?: string, link?: URL, price?: number,
      category?: Category) {
    let product: Product =
        {_id: id, title, category, subtitle, link: link.toString(), price};
    let obs =
        this.http.put<Product>('/api/products/update', product).pipe(share());
    obs.subscribe();
    return obs;
  }

  getProductByID(id: string) {
    return this.http.get<Product>(
        '/api/products/getByID', {params: new HttpParams({fromObject: {id}})});
  }

  deleteProduct(id: string) {
    let obs = this.http
                  .delete<Product>(
                      '/api/products/getByID',
                      {params: new HttpParams({fromObject: {id}})})
                  .pipe(share());
    obs.subscribe();
    return obs;
  }

  getAvgRatring(id: string) {
    return this.http.get<number>(
        '/api/products/getAvgRating',
        {params: new HttpParams({fromObject: {id}})});
  }

  getMyFeed() {
    return this.http.get<Product[]>('/api/products/myFeed');
  }
}
