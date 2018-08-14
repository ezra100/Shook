import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProductsFeedComponent } from './products-feed/products-feed.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { SellersComponent } from './sellers/sellers.component';
import { HomeComponent } from './home/home.component';
import { DmessagesComponent } from './dmessages/dmessages.component';
import { AuthGuard } from './AuthGuard';


const routes: Routes = [
  { path: 'products', component: ProductsFeedComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }, //i would rather the '' path will be to some random feed of all kinds sellers, products and reviews.
  { path: 'reviews', component: ReviewsComponent },
  { path: 'sellers', component: SellersComponent },
  { path: 'home', component: HomeComponent },
  {path: 'dmessages',canActivate: [AuthGuard], component: DmessagesComponent}
];

@NgModule({
  imports: [
    CommonModule,
     RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule ],
  declarations: []
})
export class AppRoutingModule { }
