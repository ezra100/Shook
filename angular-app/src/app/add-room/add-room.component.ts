import {Component, OnInit} from '@angular/core';
import {Input} from '@angular/core';
import {MatDialogRef, MatSnackBar} from '@angular/material';

import {ChatRoom} from '../../../../types';
import {ChatRoomsService} from '../chat-rooms.service';

@Component({
  selector: 'app-add-room',
  templateUrl: './add-room.component.html',
  styleUrls: ['./add-room.component.scss']
})
export class AddRoomComponent implements OnInit {
  chatName: string = '';
  constructor(
      public dialogRef: MatDialogRef<AddRoomComponent>,
      private chatRoomService: ChatRoomsService, public snackBar: MatSnackBar) {}
  addChat() {
    let self = this;
    this.chatRoomService.createChat(this.chatName).subscribe(chat => {
      console.log(chat);
      this.snackBar.open('Chat added successfully', 'Close');
      this.dialogRef.close(chat);
    });
  }
  ngOnInit() {}
}
