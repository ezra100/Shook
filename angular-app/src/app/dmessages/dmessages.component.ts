import {Component, OnInit} from '@angular/core';
import {CanActivate} from '@angular/router';

import {Chat, DMessage, Message, User} from '../../../../types';
import {AuthService} from '../auth.service';
import {DMessagesService} from '../d-messages.service';
import {UsersService} from '../users.service';
import { helpers } from '../helpers';

@Component({
  selector: 'app-dmessages',
  templateUrl: './dmessages.component.html',
  styleUrls: ['./dmessages.component.scss']
})
export class DmessagesComponent implements OnInit {
  chats: Chat[] = null;
  fChats: Chat[] = null;
  currentUserID: string = null;
  activeChat: Chat&{newMsg?: string} = null;
  query: string = '';
  searchMsgs: boolean = false;
  usersListResults: User[];
  isSearchUsers: boolean = false;
  constructor(
      private dmessageService: DMessagesService,
      private userService: UsersService) {}
  ngOnInit() {;
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
      if (!this.dmessageService) {
        setTimeout(() => self.initChats(user), 500);
        return;
      }
      this.dmessageService.getRecent().subscribe(chats => {
        this.fChats = this.chats = chats;
        this.activeChat = this.fChats[0];
        this.dmessageService.getDmessageObservable().subscribe(
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
  addMessage(msg: DMessage) {
    let participant =
        msg.from === AuthService.currentUser._id ? msg.to : msg.from;
    let i = this.chats.findIndex(c => c.user._id === participant);
    // if chat isn't open - create it
    if (i < 0) {
      this.chats.push({
        lastMessageDate: msg.date,
        messages: [msg],
        // we'll get the user details late
        user: {_id: participant}
      });

      this.userService.getUser(participant).subscribe(user => {
        let chat = this.chats.find(c => c.user._id === user._id);
        if (chat) {
          chat.user = user;
        }
      });
    } else {
      // if chat is open just add the message to the beginning
      this.chats[i].messages.push(msg);
      this.chats[i].lastMessageDate = msg.date;
    }
    this.chats.unshift(...this.chats.splice(i, 1));
    this.filterChats();
  }

  selectChat(userID: string) {
    this.activeChat = this.chats.find(c => c.user._id === userID);
    location.hash = userID;
  }
  sendMessage() {
    if (!this.activeChat || !this.activeChat.newMsg) {
      console.error('no active chat or no new msg');
      return;
    }
    this.dmessageService.send(this.activeChat.user._id, this.activeChat.newMsg);
    this.activeChat.newMsg = '';
  }
  filterChats() {
    // escape the query
    let regex = new RegExp(
        this.query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'), 'i');
    // search for the query in username, first name, last name and in the
    // messages if checked
    this.fChats = this.chats.filter(
        c => regex.test(c.user._id) || regex.test(c.user.firstName) ||
            regex.test(c.user.lastName) ||
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
    this.dmessageService.getChat(userID).subscribe(chat => {
      this.activeChat = chat;
      this.chats.push(chat);
      this.chats.sort(
          (a, b) => -helpers.compareDMChats(a,b));
      this.filterChats();
    });
    this.isSearchUsers = false;
  }
}
