import {ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {MatDialog} from '@angular/material';

import {Action, ChatRoom, LikeType, LikeUpdate, Message, SIORoomUpdate, User} from '../../../../types';
import {AuthService} from '../auth.service';
import {ChatRoomsService} from '../chat-rooms.service';
import {helpers} from '../helpers';
import {MemberRequestsComponent} from '../member-requests/member-requests.component';
import { AddRoomComponent } from '../add-room/add-room.component';


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
  liveOnlyChat: boolean = false;
  filterIAdmin: boolean = false;
  filterIOwn: boolean = false;
  @ViewChild('imgFileInput') imgInput:ElementRef;
  constructor(
      private chatRoomsService: ChatRoomsService, public dialog: MatDialog,
      private cdRef: ChangeDetectorRef) {}
  ngOnInit() {
    let self = this;
    window.onhashchange = () => {
      self.selectChat(location.hash.substr(1));
    };
    // on login init chats
    if (AuthService.currentUser) {
      self.initChats(AuthService.currentUser);
    }
    AuthService.loginSubject.subscribe(user => {self.initChats(user)});
    ChatRoomsService.updatesSubject.subscribe(
        update => self.updateChat(update));
    ChatRoomsService.likesUpdateSubject.subscribe(update => {
      self.updateLikes(update);
    })
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
  // update a property of one of the chats, recieved via socket.io
  updateChat(update: SIORoomUpdate) {
    let chat = this.chats.find(c => c._id === update.roomID);
    if (chat) {
      switch (update.action) {
        case Action.Add:
          chat[update.field].push(update.value);
          break;
        case Action.Remove:
          let i = chat[update.field].indexOf(update.value);
          if (i < 0) {
            console.error(`value not found in chat`, chat, update);
            return;
          }
          chat[update.field].splice(i, 1);
      }
    }
  }
  //
  updateLikes(update: LikeUpdate) {
    let chat = this.chats.find(c => c._id === update.roomID);
    if (!chat) {
      console.error(`chat ${update.roomID} not found`, update);
      return;
    }
    let msg = chat.messages.find(m => m._id === update.msgID);
    if (!msg) {
      console.error(
          `msg ${update.msgID} was not found in  chat ${update.roomID}`,
          update);
      return;
    }
    // first remove the user from both arrays to prevent duplicates
    let i = msg.likes.indexOf(update.userID);
    while (~i) {
      msg.likes.splice(i, 1);
      i = msg.likes.indexOf(update.userID);
    }
    i = msg.dislikes.indexOf(update.userID);
    while (~i) {
      msg.dislikes.splice(i, 1);
      i = msg.likes.indexOf(update.userID);
    }
    switch (update.action) {
      case LikeType.Like:
        msg.likes.push(update.userID);
        break;
      case LikeType.Disike:
        msg.dislikes.push(update.userID);
        break;
    }
    // this.cdRef.detectChanges();
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
    let imgInputElem :HTMLInputElement = this.imgInput.nativeElement;
    let file = imgInputElem.files[0];
    this.chatRoomsService.sendMsg(
        this.activeChat._id, this.activeChat.newMsg, !this.liveOnlyChat, file);
    this.activeChat.newMsg = '';


  }
  filterChats() {
    // escape the query
    let regex = new RegExp(helpers.escapeRegExp(this.query), 'i');
    // search for the query in username, first name, last name and in the
    // messages if checked
    this.fChats = this.chats.filter(
        c => {
          let bool = regex.test(c._id) || regex.test(c.name) ||
              (this.searchMsgs && c.messages.find(m => regex.test(m.content)));
          if (this.filterIAdmin) {
            if (this.filterIOwn) {
              bool = bool && c.owner === this.currentUserID;
            } else {
              bool = bool && <any>~c.admins.indexOf(this.currentUserID);
            }
          }

          return bool;
        }

    );
  }
  searchChats() {
    let self = this;
    this.chatRoomsService
        .getRooms(self.query, this.searchMembers, this.searchMsgs)
        .subscribe(chats => {
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
      this.chats.sort((a, b) => -helpers.compareChatRooms(a, b));
      this.filterChats();
    });
    this.isSearchInAddMode = false;
  }
  openRequestsDialog() {
    this.dialog.open(MemberRequestsComponent, {data: this.activeChat});
  }
  openAddChatRoomDialog() {
    let self = this;
    const dialogRef = this.dialog.open(AddRoomComponent);
    dialogRef.afterClosed().subscribe(chat =>
    {
      self.chats.push(chat);
      self.filterChats();
    });
  }
  // sends a member request to the active chat
  sendMemberRequest() {
    this.chatRoomsService.sendMemberRequest(this.activeChat._id).subscribe();
  }

  leaveRoom(
      roomID: string = this.activeChat._id, cancelMembership: boolean = true) {
    this.chatRoomsService.leaveRoom(roomID);
    if (cancelMembership) {
      this.chatRoomsService.removeMember(roomID, this.currentUserID)
          .subscribe();
    }
    let i = this.chats.findIndex(c => c._id === roomID);
    if (~i) {
      this.chats.splice(i, 1);
    }
    if (roomID === this.activeChat._id) {
      this.activeChat = null;
    }
  }
  likeClicked(msgID: string) {
    let msg = this.activeChat.messages.find(m => m._id === msgID);
    let roomID: string = this.activeChat._id;
    if (~msg.likes.indexOf(this.currentUserID)) {
      this.chatRoomsService.removeLikeDislike(roomID, msgID);
    } else {
      this.chatRoomsService.likeMsg(roomID, msgID);
    }
  }
  dislikeClicked(msgID: string) {
    let msg = this.activeChat.messages.find(m => m._id === msgID);
    let roomID: string = this.activeChat._id;
    if (~msg.dislikes.indexOf(this.currentUserID)) {
      this.chatRoomsService.removeLikeDislike(roomID, msgID);
    } else {
      this.chatRoomsService.dislikeMsg(roomID, msgID);
    }
  }
}
