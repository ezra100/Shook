import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ChatRoom, DMessage} from '../../../types';

import io = require('socket.io');

const dmUriBase = '/api/DMessages';
@Injectable({providedIn: 'root'})
export class DMessagesService {
  private static socket: SocketIO.Server = null;
  constructor(private http: HttpClient) {}
  send(to: string, content: string) {
    return this.http.post(dmUriBase + '/send', {to, content});
  }
  getMesssages(otherUser: string) {
    return this.http.get<DMessage[]>(
        dmUriBase + '/getMessages',
        {params: new HttpParams({fromObject: {otherUser}})});
  }
  getRecent(limit: number = 100, offset: number = 0) {
    return this.http.get(dmUriBase + '/getRecent', {
      params: new HttpParams(
          {fromObject: {limit: limit.toString(), offset: offset.toString()}})
    })
  }

  getObservable() {
    return new Observable((subscriber) => {
      let socket = this.getSingletonSocket();
      socket.on('message', (message) => {
        subscriber.next(message);
      });
      return () => {};
    });
  }
  getSingletonSocket() {
    if (!DMessagesService.socket) {
      DMessagesService.socket = io(dmUriBase);
    }
    return DMessagesService.socket;
  }
}
