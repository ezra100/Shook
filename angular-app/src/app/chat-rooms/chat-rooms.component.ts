import {Component, OnInit} from '@angular/core';

import {ChatRoom, Message, User} from '../../../../types';
import {AuthService} from '../auth.service';
import {ChatRoomsService} from '../chat-rooms.service';
import {helpers} from '../helpers';
import { MatDialog } from '@angular/material';
import { MemberRequestsComponent } from '../member-requests/member-requests.component';


//todo: request to join
//  authorize/delete request
// add/delete admins
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
  searchMembers: boolean = false;
  chatsListResults: ChatRoom[];
  isSearchInAddMode: boolean = false;
  constructor(private chatRoomsService: ChatRoomsService, public dialog: MatDialog) {}
  ngOnInit() {
    let self = this;
    window.onhashchange = () => {
      self.selectChat(location.hash.substr(1));
    };
    // on login init chats
    if (AuthService.currentUser) {
      self.initChats(AuthService.currentUser);
    }
    AuthService.loginSubject.subscribe(user => {self.initChats(user)})
  }

  initChats(user: User) {
    if (user) {
      // in order that the server's socket will recognize
      // the user we need to reconnect
      this.chatRoomsService.reconnect();
      this.currentUserID = user._id;
      let self = this;
      if (!this.chatRoomsService) {
        setTimeout(() => self.initChats(user), 500);
        return;
      }
      this.chatRoomsService.getMyRooms().subscribe(chats => {
        this.fChats = this.chats = chats;
        this.activeChat = this.fChats[0];
        this.chatRoomsService.getMsgObservable().subscribe(
            (msg) => this.addMessage(msg));

        this.chatRoomsService.join(chats.map(c => c._id));
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
    this.isSearchInAddMode ? this.searchChats() : this.filterChats()
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
    let regex = new RegExp(helpers.escapeRegExp(this.query), 'i');
    // search for the query in username, first name, last name and in the
    // messages if checked
    this.fChats = this.chats.filter(
        c => regex.test(c._id) || regex.test(c.name) ||
            (this.searchMsgs && c.messages.find(m => regex.test(m.content))));
  }
  searchChats() {
    let self = this;
    this.chatRoomsService.getRooms(self.query, this.searchMembers, this.searchMsgs).subscribe(chats => {
      self.chatsListResults = chats;
    })
  }
  addChatByID(roomID: string) {
    let self = this;
    let chatTryFind = this.chats.find(c => c._id === roomID);
    if (chatTryFind) {
      this.activeChat = chatTryFind;
      this.isSearchInAddMode = false;
      this.filterChats();
      return;
    }
    this.chatRoomsService.getRoom(roomID).subscribe(chat => {
      self.chatRoomsService.join(roomID);
      this.activeChat = chat;
      this.chats.push(chat);
      // todo manage empty messages
      this.chats.sort((a, b) => -helpers.compareChatRooms(a, b));
      this.filterChats();
    });
    this.isSearchInAddMode = false;
  }
  openRequestsDialog(){
    this.dialog.open(MemberRequestsComponent, {data:this.activeChat});
  }
  // sends a member request to the active chat
  sendMemberRequest(){
    this.chatRoomsService.sendMemberRequest(this.activeChat._id);
  }
}
