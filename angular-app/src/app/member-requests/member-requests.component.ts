import {Component, Input, OnInit, Inject} from '@angular/core';

import {ChatRoom} from '../../../../types';
import {ChatRoomsService} from '../chat-rooms.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-member-requests',
  templateUrl: './member-requests.component.html',
  styleUrls: ['./member-requests.component.scss']
})
export class MemberRequestsComponent implements OnInit {
  isUserOwner: boolean;
  currentUserId = AuthService.currentUser._id;
  constructor(private chatRoomService: ChatRoomsService,  public dialogRef: MatDialogRef<MemberRequestsComponent>, @Inject(MAT_DIALOG_DATA) public room: ChatRoom) {
    this.isUserOwner = room.owner === AuthService.currentUser._id;
  }

  ngOnInit() {
  
  }
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
  removeMember(memberID){
    this.chatRoomService.removeMember(this.room._id, memberID).subscribe();
  }
  changeAdminStatus(oldValue: boolean, memberID: string){
    if(oldValue){
      this.chatRoomService.removeAdmin(this.room._id, memberID).subscribe();
    }else{
      this.chatRoomService.addAdmin(this.room._id, memberID).subscribe();
    }
  }
}
