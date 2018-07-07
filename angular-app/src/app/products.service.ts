

import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, Operator} from 'rxjs';
import {mergeMap} from 'rxjs/operators';

import {IProduct} from '../../../types';

const base = 'https://localhost:3000';

@Injectable({providedIn: 'root'})
export class ProductsService {
  constructor(private http: HttpClient) {}

  getProductsObserver(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(base + '/products/getLatest');
  }
  addProduct(title: string, subtitle: string, link: URL, price: number):
      Observable<{success: boolean, body: string|IProduct}> {
    let product: IProduct = {title, subtitle, link: link.toString(), price};
    let params = new HttpParams({fromObject: <any>product});
    return this.http.post('/products/add', {params})
        .pipe(mergeMap(async function(res: Response) {
          return {
            success: res.ok,
            body: (res.ok ? await res.json() : await res.text())
          };
        }));
  }
}
