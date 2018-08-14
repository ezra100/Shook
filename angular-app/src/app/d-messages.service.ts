import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import * as io from 'socket.io-client';

import {Chat, DMessage, User} from '../../../types';

import {AuthService} from './auth.service';
import {helpers} from './helpers';

const dmUriBase = '/api/DMessages';
@Injectable({providedIn: 'root'})
export class DMessagesService {
  static socket: SocketIOClient.Socket;
  static msgSubject: Subject<DMessage> = new Subject();
  chats: Chat[] = null;
  constructor(private http: HttpClient) {}
  // do static init for the service
  static init() {
    AuthService.loginSubject.subscribe(user => {
      if (this.socket) {
        this.socket.close();
      }
      if (user) {
        this.socket = io('/', {path: '/socket.io/DMessages'});
        this.socket.on('dmessage', (message: DMessage) => {
          message.date = new Date(message.date);
          DMessagesService.msgSubject.next(message);
        });
      }
    });
    this.socket = io('/', {path: '/socket.io/DMessages'});
    this.socket.on('dmessage', (message: DMessage) => {
      message.date = new Date(message.date);
      DMessagesService.msgSubject.next(message);
    });
  }

  getSocket() {
    return DMessagesService.socket;
  }
  send(to: string, content: string) {
    this.getSocket().emit('dmessage', {to, content});
  }
  getChat(otherUser: string) {
    return this.http
        .get<Chat>(
            dmUriBase + '/getChat',
            {params: new HttpParams({fromObject: {otherUser}})})
        .pipe(map(c => {
          c.lastMessageDate = new Date(c.lastMessageDate);
          c.messages.forEach(m => m.date = new Date(m.date));
          return c;
        }));
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
    return DMessagesService.msgSubject;
  }

}

DMessagesService.init();