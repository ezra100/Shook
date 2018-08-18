import {Component, Input, OnInit, Inject} from '@angular/core';

import {ChatRoom} from '../../../../types';
import {ChatRoomsService} from '../chat-rooms.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-member-requests',
  templateUrl: './member-requests.component.html',
  styleUrls: ['./member-requests.component.scss']
})
export class MemberRequestsComponent implements OnInit {
  constructor(private chatRoomService: ChatRoomsService,  public dialogRef: MatDialogRef<MemberRequestsComponent>, @Inject(MAT_DIALOG_DATA) public room: ChatRoom) {}

  ngOnInit() {}
  deleteRequest(memberID: string) {
    this.chatRoomService.removeMemberRequest(this.room._id, memberID)
        .subscribe(() => {
          let i = this.room.memberRequests.indexOf(memberID);
          this.room.memberRequests.splice(i, 1);
        });
  }
  authorize(memberID: string) {
    this.chatRoomService.addMember(this.room._id, memberID).subscribe(() => {
      let i = this.room.memberRequests.indexOf(memberID);
      this.room.memberRequests.splice(i, 1);
      this.room.members.push(memberID);
    });
  }
}
