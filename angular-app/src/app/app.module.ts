import {HttpClientModule} from '@angular/common/http';
import {enableProdMode, NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MAT_SNACK_BAR_DEFAULT_OPTIONS, MatButtonModule, MatCardModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatDialogModule, MatExpansionModule, MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule, MatProgressBarModule, MatProgressSpinnerModule, MatSelectModule, MatSnackBarModule} from '@angular/material';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {MatDividerModule} from '@angular/material/divider';
import {MatToolbarModule} from '@angular/material/toolbar';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';

import {AddProductComponent} from './add-product/add-product.component';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {DmessagesComponent} from './dmessages/dmessages.component';
import {HeaderComponent} from './header/header.component';
import {HomeComponent} from './home/home.component';
import {LoginFormComponent} from './login-form/login-form.component';
import {ProductFullComponent} from './product-full/product-full.component';
import {ProductComponent} from './product/product.component';
import {ProductsFeedComponent} from './products-feed/products-feed.component';
import {ReversePipe} from './reverse.pipe'
import {ReviewsComponent} from './reviews/reviews.component';
import {SellersComponent} from './sellers/sellers.component';
import {SignupDialogComponent} from './signup-dialog/signup-dialog.component';
import { ReviewCardComponent } from './review-card/review-card.component';
import { AuthGuard } from './AuthGuard';

enableProdMode();

@NgModule({
  declarations: [
    AppComponent, ProductsFeedComponent, AddProductComponent, ProductComponent,
    LoginFormComponent, HeaderComponent, ProductFullComponent, ReviewsComponent,
    SellersComponent, HomeComponent, SignupDialogComponent, DmessagesComponent,
    ReversePipe,
    ReviewCardComponent
  ],
  imports: [
    MatProgressBarModule, MatChipsModule,
    MatSnackBarModule,    MatIconModule,
    MatDialogModule,      MatDividerModule,
    FlexLayoutModule,     MatGridListModule,
    MatInputModule,       MatSelectModule,
    MatCheckboxModule,    ReactiveFormsModule,
    MatButtonModule,      BrowserAnimationsModule,
    MatMomentDateModule,  MatFormFieldModule,
    FormsModule,          BrowserModule,
    MatExpansionModule,   MatCardModule,
    MatDatepickerModule,  HttpClientModule,
    AppRoutingModule,     MatInputModule,
    MatToolbarModule,     MatProgressSpinnerModule,
  ],
  entryComponents:
      [AddProductComponent, LoginFormComponent, SignupDialogComponent],
  providers:
      [AuthGuard, {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 3000}}],
  bootstrap: [AppComponent]
})
export class AppModule {
}
