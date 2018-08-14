import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {Review} from '../../../types';

const reviewsUriBase = '/api/reviews';
@Injectable({providedIn: 'root'})
export class ReviewsService {
  constructor(private http: HttpClient) {}
  add(review: Partial<Review>) {
    return this.http.post<Review>(reviewsUriBase + '/add', review);
  }
  update(review: Partial<Review>) {
    return this.http.put<Review>(reviewsUriBase + '/update', review);
  }
  getByReviewId(id: string) {
    let params = new HttpParams({fromObject: {_id: id}});
    return this.http.get<Review>(reviewsUriBase + '/getById', {params});
  }
  getByProductID(productID: string){
    let params = new HttpParams({fromObject: {productID}});
    return this.http.get<Review[]>(reviewsUriBase + '/getLatest', {params});
  }
  getLatest(filter: any = {}) {
    return this.http.get<Review[]>(
        reviewsUriBase + '/getLatest',
        {params: new HttpParams({fromObject: filter})});
  }
  deleteReview(reviewID: string) {
    return this.http.delete(
        reviewsUriBase + '/delete',
        {params: new HttpParams({fromObject: {_id: reviewID}})})
  }
  likeReview(reviewID: string){
    return this.http.put(reviewsUriBase + '/like', {_id: reviewID});
  }
  dislikeReview(reviewID: string){
    return this.http.put(reviewsUriBase + '/dislike', {_id: reviewID});
  }
  removeDisOrLike(reviewID: string){
    return this.http.put(reviewsUriBase + '/removeLike', {_id: reviewID});
  }
}
