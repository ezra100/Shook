

import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, Operator} from 'rxjs';
import {mergeMap} from 'rxjs/operators';

import {IProduct} from '../../../types';


@Injectable({providedIn: 'root'})
export class ProductsService {
  constructor(private http: HttpClient) {}

  getProductsObserver(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>( '/products/getLatest');
  }
  addProduct(title: string, subtitle: string, link: URL, price: number):
      Observable<{success: boolean, err?: string, body?:IProduct}> {
    let product: IProduct = {title, subtitle, link: link.toString(), price};
    //let params = new HttpParams({fromObject: <any>product});
    return this.http.post('/products/add', product)
        .pipe(mergeMap(async function(res: Response) {
          return {
            success: res.ok,
            body: (res.ok ? await res.json() : undefined),
            err: (res.ok? undefined : await res.text())
          };
        }));
  }
}
