import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import * as io from 'socket.io-client';

import {Chat, DMessage} from '../../../types';

import {AuthService} from './auth.service';

const dmUriBase = '/api/DMessages';
@Injectable({providedIn: 'root'})
export class DMessagesService {
  private static socket: SocketIOClient.Socket = null;
  chats: Chat[] = null;
  constructor(private http: HttpClient) {}
  send(to: string, content: string) {
    this.getSingletonSocket().emit('dmessage', {to, content});
  }
  getMesssages(otherUser: string) {
    return this.http.get<DMessage[]>(
        dmUriBase + '/getMessages',
        {params: new HttpParams({fromObject: {otherUser}})});
  }
  getRecent(limit: number = 100, offset: number = 0) {
    return this.http
        .get<Chat[]>(dmUriBase + '/getRecent', {
          params: new HttpParams({
            fromObject: {limit: limit.toString(), offset: offset.toString()}
          })
        })
        .pipe(map(chats => {
          chats.forEach(c => {
            c.lastMessageDate = new Date(c.lastMessageDate);
            c.messages.forEach(m => m.date = new Date(m.date));
          })
          return chats;
        }));
  }

  getDmessageObservable() {
    return new Observable<DMessage>((subscriber) => {
      let socket = this.getSingletonSocket();
      socket.on('dmessage', (message: DMessage) => {
        message.date = new Date(message.date);
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
