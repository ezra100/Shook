import {Component, OnInit} from '@angular/core';

import {Chat, DMessage, Message, User} from '../../../../types';
import {AuthService} from '../auth.service';
import {DMessagesService} from '../d-messages.service';
import {UsersService} from '../users.service';



@Component({
  selector: 'app-dmessages',
  templateUrl: './dmessages.component.html',
  styleUrls: ['./dmessages.component.scss']
})
export class DmessagesComponent implements OnInit {
  chats: Chat[] = null;
  currentUserID: string = null;
  activeChat: Chat & {newMsg?: string} = null;
  constructor(
      private dmessageService: DMessagesService,
      private userService: UsersService) {}

  ngOnInit() {
    // on login init chats
    let self = this;
    if (AuthService.currentUser) {
      self.initChats(AuthService.currentUser);
    }
    AuthService.loginSubject.subscribe(user =>{self.initChats(user)})
  }

  initChats(user: User) {
    if (user) {
      this.currentUserID = user._id;
      let self = this;
      if(!this.dmessageService){
        setTimeout(() => self.initChats(user), 500);
        return;
      }
      this.dmessageService.getRecent().subscribe(chats => {
        this.chats = chats;
        this.activeChat = chats[0];
        this.dmessageService.getDmessageObservable().subscribe(this.addMessage);
      })
    }
    // on logout - delete all chats
    else {
      this.chats = null;
      this.activeChat = null;
      this.currentUserID = null;
    }
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
        this.chats.find(c => c.user._id === user._id).user = user;
      });
    } else {
      // if chat is open just add the message to the end
      this.chats[i].messages.unshift(msg);
      this.chats[i].lastMessageDate = msg.date;
    }
  }

  selectChat(userID: string) {
    this.activeChat = this.chats.find(c => c.user._id === userID);
  }
  sendMessage() {
    if(!this.activeChat || !this.activeChat.newMsg){
      console.log("no active chat or no new msg");
      return;
    }
    this.dmessageService.send(this.activeChat.user._id, this.activeChat.newMsg);
  }
}
