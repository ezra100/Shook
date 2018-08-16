import {Component, OnInit} from '@angular/core';
import {ObservableMedia} from '@angular/flex-layout';

import {User} from '../../../../types';
import {AdminService} from '../admin.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  awaitingUsers: User[];
  cols: number;
  constructor(
      private adminService: AdminService,
      private observableMedia: ObservableMedia) {}

  ngOnInit() {
    // credit http://disq.us/p/1ouo8m4
    const breakpoints:
        {[size: string]:
             number} = {['xs']: 1, ['sm']: 3, ['md']: 4, ['lg']: 5, ['xl']: 6};
    this.observableMedia.subscribe(x => this.cols = breakpoints[x.mqAlias]);

    this.adminService.getAwaitingUsers().subscribe(
        users => 
        {this.awaitingUsers = users});
  }
  // todo - implement load more
  authorizeUser(userID: string) {
    this.adminService.authorizeUser(userID).subscribe(user => {
      let index = this.awaitingUsers.findIndex(u => u._id === user._id);
      this.awaitingUsers.splice(index, 1);
    });
  }
  deleteUser(userID: string) {
    this.adminService.deleteUser(userID).subscribe(user => {
      let index = this.awaitingUsers.findIndex(u => u._id === user._id);
      this.awaitingUsers.splice(index, 1);
    })
  }
}
