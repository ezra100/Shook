import {HttpClientModule} from '@angular/common/http';
import {enableProdMode, Injector, NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MAT_SNACK_BAR_DEFAULT_OPTIONS, MatBadgeModule, MatButtonModule, MatCardModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatDialogModule, MatExpansionModule, MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule, MatProgressBarModule, MatProgressSpinnerModule, MatSelectModule, MatSlideToggleModule, MatSnackBarModule, MatTabsModule, MatTooltipModule} from '@angular/material';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {MatDividerModule} from '@angular/material/divider';
import {MatToolbarModule} from '@angular/material/toolbar';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {DisqusModule} from 'ngx-disqus';
import { NgxLinkifyjsModule } from 'ngx-linkifyjs';


import {AddProductComponent} from './add-product/add-product.component';
import {AddRoomComponent} from './add-room/add-room.component';
import {AdminGuard} from './admin-guard';
import {AdminPanelComponent} from './admin-panel/admin-panel.component';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AuthGuard} from './AuthGuard';
import {ChatRoomsComponent} from './chat-rooms/chat-rooms.component';
import {DisqusComponent} from './disqus/disqus.component';
import {DmessagesComponent} from './dmessages/dmessages.component';
import {HeaderComponent} from './header/header.component';
import {HomeComponent} from './home/home.component';
import {LoginFormComponent} from './login-form/login-form.component';
import {MemberRequestsComponent} from './member-requests/member-requests.component';
import {ProductFullComponent} from './product-full/product-full.component';
import {ProductComponent} from './product/product.component';
import {ProductsFeedComponent} from './products-feed/products-feed.component';
import {ReversePipe} from './reverse.pipe'
import {ReviewCardComponent} from './review-card/review-card.component';
import {ReviewsComponent} from './reviews/reviews.component';
import {SellersComponent} from './sellers/sellers.component';
import {SignupDialogComponent} from './signup-dialog/signup-dialog.component';
import {UpdateUserDetailsModalComponent} from './update-user-details-modal/update-user-details-modal.component';
import {UserCardComponent} from './user-card/user-card.component';
import { ResetModalComponent } from './reset-modal/reset-modal.component';

 
@NgModule({
  declarations: [
    AppComponent,
    ProductsFeedComponent,
    AddProductComponent,
    ProductComponent,
    LoginFormComponent,
    HeaderComponent,
    ProductFullComponent,
    ReviewsComponent,
    SellersComponent,
    HomeComponent,
    SignupDialogComponent,
    DmessagesComponent,
    ReversePipe,
    ReviewCardComponent,
    AdminPanelComponent,
    UserCardComponent,
    ChatRoomsComponent,
    MemberRequestsComponent,
    UpdateUserDetailsModalComponent,
    AddRoomComponent,
    DisqusComponent,
    ResetModalComponent
  ],
  imports: [
    MatBadgeModule,
    MatProgressBarModule,
    MatChipsModule,
    MatSnackBarModule,
    MatIconModule,
    MatDialogModule,
    MatDividerModule,
    FlexLayoutModule,
    MatGridListModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatMomentDateModule,
    MatFormFieldModule,
    FormsModule,
    BrowserModule,
    MatExpansionModule,
    MatCardModule,
    MatDatepickerModule,
    HttpClientModule,
    AppRoutingModule,
    MatInputModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatTabsModule,
    DisqusModule.forRoot('shook-1'),
    NgxLinkifyjsModule
  ],
  entryComponents: [
    AddProductComponent, MemberRequestsComponent, LoginFormComponent,
    SignupDialogComponent, UpdateUserDetailsModalComponent, AddRoomComponent
  ],
  providers: [
    AuthGuard, AdminGuard,
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 3000}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
