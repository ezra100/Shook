import {Component, OnInit} from '@angular/core';
import {CanActivate} from '@angular/router';

import {Chat, ChatRoom, Message, User} from '../../../../types';
import {AuthService} from '../auth.service';
import {ChatRoomsService} from '../chat-rooms.service';
import {UsersService} from '../users.service';

@Component({
  selector: 'app-chat-rooms',
  templateUrl: './chat-rooms.component.html',
  styleUrls: ['./chat-rooms.component.scss']
})
export class ChatRoomsComponent implements OnInit {
  chats: ChatRoom[] = null;
  fChats: ChatRoom[] = null;
  currentUserID: string = null;
  activeChat: ChatRoom&{newMsg?: string} = null;
  query: string = '';
  searchMsgs: boolean = false;
  usersListResults: User[];
  isSearchUsers: boolean = false;
  constructor(
      private chatRoomsService: ChatRoomsService,
      private userService: UsersService) {}
  ngOnInit() {
    ;
    // on login init chats
    let self = this;
    window.onhashchange = () => {
      self.selectChat(location.hash.substr(1));
    };
    if (AuthService.currentUser) {
      self.initChats(AuthService.currentUser);
    }
    AuthService.loginSubject.subscribe(user => {self.initChats(user)})
  }

  initChats(user: User) {
    if (user) {
      this.currentUserID = user._id;
      let self = this;
      if (!this.chatRoomsService) {
        setTimeout(() => self.initChats(user), 500);
        return;
      }
      this.chatRoomsService.getRecent().subscribe(chats => {
        this.fChats = this.chats = chats;
        this.activeChat = this.fChats[0];
        this.chatRoomsService.getMsgObservable().subscribe(
            (msg) => this.addMessage(msg));
      })
    }
    // on logout - delete all chats
    else {
      this.chats = this.fChats = null;
      this.activeChat = null;
      this.currentUserID = null;
    }
  }
  search() {
    this.isSearchUsers ? this.searchUsers() : this.filterChats()
  }
  addMessage(msg: Message) {
    let i = this.chats.findIndex(c => c._id === msg.roomID);
    // if chat isn't open - create it
    if (i < 0) {
      console.error(`chat ${msg.roomID} wasn't found among the active chats`);
      return;
    }
    this.chats[i].messages.push(msg);
    this.chats.unshift(...this.chats.splice(i, 1));

    // this.chats[i].lastMessageDate = msg.date;
    this.filterChats();
  }

  selectChat(roomID: string) {
    this.activeChat = this.chats.find(c => c._id === roomID);
    location.hash = roomID;
  }
  sendMessage() {
    if (!this.activeChat || !this.activeChat.newMsg) {
      console.error('no active chat or no new msg');
      return;
    }
    this.chatRoomsService.sendMsg(this.activeChat._id, this.activeChat.newMsg);
    this.activeChat.newMsg = '';
  }
  filterChats() {
    // escape the query
    let regex = new RegExp(
        this.query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'), 'i');
    // search for the query in username, first name, last name and in the
    // messages if checked
    this.fChats = this.chats.filter(
        c => regex.test(c._id) || regex.test(c.name) ||
            (this.searchMsgs && c.messages.find(m => regex.test(m.content))));
  }
  searchUsers() {
    let self = this;
    this.userService.getUserList(self.query).subscribe(userList => {
      self.usersListResults = userList;
    })
  }
  addChatByID(userID: string) {
    let chatTryFind = this.chats.find(c => c.user._id === userID);
    if (chatTryFind) {
      this.activeChat = chatTryFind;
      this.isSearchUsers = false;
      this.filterChats();
      return;
    }
    this.chatRoomsService.g(userID).subscribe(chat => {
      this.activeChat = chat;
      this.chats.push(chat);
      //todo manage empty messages
      this.chats.sort(
          (a, b) => -a.messages[a.messages.length-1].date.getTime() + b.messages[a.messages.length-1].date.getTime());
      this.filterChats();
    });
    this.isSearchUsers = false;
  }
}
