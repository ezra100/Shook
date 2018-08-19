import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {map, share} from 'rxjs/operators';
import * as io from 'socket.io-client';

import {ChatRoom, LikeUpdate, Message, SIORoomUpdate,} from '../../../types';



@Injectable({providedIn: 'root'})
export class ChatRoomsService {
  static socket: SocketIOClient.Socket;
  static msgSubject: Subject<Message> = new Subject();
  static updatesSubject: Subject<SIORoomUpdate> = new Subject();
  static likesUpdateSubject: Subject<LikeUpdate> = new Subject();
  constructor(private http: HttpClient) {}

  // reconnects the socket to the server, so that the user credentials will
  // appear on server side, notice that this will remove all rooms joining on
  // server side
  reconnect() {
    let self = ChatRoomsService;
    if (self.socket) {
      self.socket.close();
    }
    self.socket = io('/', {path: '/socket.io/rooms'});
    self.socket.on('msg', (message: Message) => {
      message.date = new Date(message.date);
      self.msgSubject.next(message);
    });
    self.socket.on('room-update', update => {
      self.updatesSubject.next(update);
    });
    self.socket.on('likes-update', update => {
      self.likesUpdateSubject.next(update);
    });
    self.socket.on('diconnect', (reason)=>{
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        self.socket.connect();
      }
    })
  }

  join(roomIDs: string|string[]) {
    this.getSocket().emit('join', roomIDs);
  }

  leaveRoom(roomID: string) {
    this.getSocket().emit('leave', roomID);
  }

  async sendMsg(
      roomID: string, content: string, saveToDb: boolean = true, file?: File) {
    let msg = <Message>{content, roomID, saveToDb};
    if (file) {
      msg.imageURL = await this.getImgUrl(file).toPromise().catch(err => {
        console.error(err);
        return null;
      });
    }
    this.getSocket().emit('msg', msg);
  }

  getImgUrl(file: File) {
    let formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>('/api/rooms/getImgURL', formData);
  }

  getMsgObservable() {
    return ChatRoomsService.msgSubject;
  }

  getMyRooms() {
    return this.http.get<ChatRoom[]>('/api/rooms/groupsImMemberOf')
        .pipe(map(chats => {
          chats.forEach(c => {
            c.messages.forEach(m => {
              m.date = new Date(m.date);
              return m;
            })
            if (c.lastMsg) c.lastMsg.date = new Date(c.lastMsg.date);
          })
          return chats;
        }));
    ;
  }
  // parameters are the queries to search for in the name of the room, in
  // members or in messages
  getRooms(
      query?: string, searchMembers: boolean = false,
      searchMessages: boolean = false) {
    let filter: any = {};
    filter.name = query;
    if (searchMembers) filter.members = query;
    if (searchMessages) filter.messages = query;
    return this.http
        .get<ChatRoom[]>(
            '/api/rooms/getRooms',
            {params: new HttpParams({fromObject: filter})})
        .pipe(map(chats => {
          chats.forEach(c => {
            c.messages.forEach(m => {
              m.date = new Date(m.date);

              return m;
            })
            if (c.lastMsg) c.lastMsg.date = new Date(c.lastMsg.date);
          });
          return chats;
        }));
  }

  getSocket() {
    return ChatRoomsService.socket;
  }
  getRoom(roomID: string): Observable<ChatRoom> {
    return this.http
        .get<ChatRoom>(
            '/api/rooms/getByID',
            {params: new HttpParams({fromObject: {roomID}})})
        .pipe(map(c => {
          c.messages.forEach(m => {
            m.date = new Date(m.date);
            return m;
          })
          if (c.lastMsg) c.lastMsg.date = new Date(c.lastMsg.date);
          return c;
        }));
  }

  addMember(roomID: string, member: string) {
    let obs = this.http.put('/api/rooms/addMember', {roomID, member}).pipe(share());
    obs.subscribe();
        return obs;
  }
  removeMemberRequest(roomID: string, member: string) {
    let obs = this.http.put('/api/rooms/removeMemberRequest', {roomID, member}).pipe(share());
    obs.subscribe();
        return obs;
  }
  addAdmin(roomID: string, adminID: string) {
    let obs = this.http.put('/api/rooms/addAdmin', {roomID, adminID}).pipe(share());
    obs.subscribe();
        return obs;
  }
  removeAdmin(roomID: string, adminID: string) {
    let obs = this.http.put('/api/rooms/removeAdmin', {roomID, adminID}).pipe(share());
    obs.subscribe();
        return obs;
  }
  createChat(name: string, admins?: string[]) {
    let body: any = {name};
    if (admins) body.admins = admins;
    let obs = this.http.post<ChatRoom>(
        '/api/rooms/createRoom', {name, admins}).pipe(share());
        obs.subscribe();
        return obs;
  }
  sendMemberRequest(roomID: string) {
    let obs = this.http.put('/api/rooms/requestMembership', {roomID}).pipe(share());
    obs.subscribe();
        return obs;
  }
  removeMember(roomID, memberID) {
    let obs =  this.http.put('/api/rooms/removeMember', {roomID, memberID}).pipe(share());
    obs.subscribe();
        return obs;
  }

  likeMsg(roomID: string, messageID: string) {
    let obs =
        this.http.put('/api/rooms/likeMsg', {roomID, messageID}).pipe(share());
    obs.subscribe();
    return obs;
  }
  dislikeMsg(roomID: string, messageID: string) {
    let obs = this.http.put('/api/rooms/dislikeMsg', {roomID, messageID})
                  .pipe(share());
    obs.subscribe();
    return obs;
  }
  removeLikeDislike(roomID: string, messageID: string) {
    let obs = this.http.put('/api/rooms/removeLikeDislike', {roomID, messageID})
                  .pipe(share());
    obs.subscribe();
    return obs;
  }
}
