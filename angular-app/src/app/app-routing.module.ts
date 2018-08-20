import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AdminGuard} from './admin-guard';
import {AdminPanelComponent} from './admin-panel/admin-panel.component';
import {AuthGuard} from './AuthGuard';
import {DmessagesComponent} from './dmessages/dmessages.component';
import {HomeComponent} from './home/home.component';
import {ProductsFeedComponent} from './products-feed/products-feed.component';
import {ReviewsComponent} from './reviews/reviews.component';
import {SellersComponent} from './sellers/sellers.component';
import { ChatRoomsComponent } from './chat-rooms/chat-rooms.component';
import { ResetModalComponent } from './reset-modal/reset-modal.component';


const routes: Routes = [
  {path: 'products', component: ProductsFeedComponent}, {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },  // i would rather the '' path will be to some random feed of all kinds
      // sellers, products and reviews.
  {path: 'reviews', component: ProductsFeedComponent},
  {path: 'sellers', component: ProductsFeedComponent},
  {path: 'home', component: HomeComponent},
  {path: 'dmessages', canActivate: [AuthGuard], component: DmessagesComponent},
  {path: 'admin', canActivate:[AdminGuard], component: AdminPanelComponent},
  {path: 'rooms', component: ChatRoomsComponent},
  {path: 'auth/completeReset', component: ResetModalComponent},
];

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule {
}
