import { Injectable } from '@angular/core';
import { IComment } from '../../../types';
import { HttpClient, HttpParams } from '@angular/common/http';


const commentsUriBase = '/api/comments';
@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  constructor(private http: HttpClient) { }
  add(IComment: Partial<IComment>) {
    return this.http.post<IComment>(commentsUriBase + '/add', IComment);
  }
  update(IComment: Partial<IComment>) {
    return this.http.put<IComment>(commentsUriBase + '/update', IComment);
  }
  getById(id: string) {
    let params = new HttpParams({fromObject: {_id: id}});
    return this.http.get<IComment>(commentsUriBase + '/getById', {params});
  }
  getLatest(filter: any = {}) {
    return this.http.get<IComment[]>(
        commentsUriBase + '/getLatest',
        {params: new HttpParams({fromObject: filter})});
  }
  deleteIComment(ICommentID: string) {
    return this.http.delete(
        commentsUriBase + '/delete',
        {params: new HttpParams({fromObject: {_id: ICommentID}})})
  }
  likeIComment(ICommentID: string){
    return this.http.put(commentsUriBase + '/like', {_id: ICommentID});
  }
  dislikeIComment(ICommentID: string){
    return this.http.put(commentsUriBase + '/dislike', {_id: ICommentID});
  }
  removeDisOrLike(ICommentID: string){
    return this.http.put(commentsUriBase + '/removeLike', {_id: ICommentID});
  }
}
