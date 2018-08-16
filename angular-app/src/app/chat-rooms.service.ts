import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {forkJoin, Observable, Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import * as io from 'socket.io-client';

import {ChatRoom, Message, User} from '../../../types';

import {AuthService} from './auth.service';
import {helpers} from './helpers';

@Injectable({providedIn: 'root'})
export class ChatRoomsService {
  static socket: SocketIOClient.Socket;
  static msgSubject: Subject<Message> = new Subject();
  static init() {
    AuthService.loginSubject.subscribe(user => {
      if (this.socket) {
        this.socket.close();
      }
      if (user) {
        this.socket = io('/', {path: '/socket.io/rooms'});
        this.socket.on('msg', (message: Message) => {
          message.date = new Date(message.date);
          this.msgSubject.next(message);
        });
      }
    });
    this.socket = io('/', {path: '/socket.io/rooms'});
    this.socket.on('msg', (message: Message) => {
      message.date = new Date(message.date);
      this.msgSubject.next(message);
    });
  }
  constructor(private http: HttpClient) {}

  enterRoom(roomID: string) {
    this.getSocket().emit('join', roomID);
  }

  leaveRoom(roomID: string) {
    this.getSocket().emit('leave', roomID);
  }

  sendMsg(roomID: string, msg: string) {
    this.getSocket().emit('msg', msg);
  }

  getMsgObservable() {
    return ChatRoomsService.msgSubject;
  }

  getSocket() {
    return ChatRoomsService.socket;
  }
  searchForChats(query: string, searchInMessages: string) {}
  getChat(roomID: string): Observable<ChatRoom> {
    return this.http.get<ChatRoom>(
        '/api/rooms/getByID', {params: new HttpParams({fromObject: {roomID}})});
  }
}
