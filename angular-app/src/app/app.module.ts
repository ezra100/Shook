import {HttpClientModule} from '@angular/common/http';
import {enableProdMode, NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule, MatCardModule, MatCheckboxModule, MatDatepickerModule, MatDialogModule, MatExpansionModule, MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule, MatSelectModule, MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS} from '@angular/material';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {MatDividerModule} from '@angular/material/divider';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';

import {AddProductComponent} from './add-product/add-product.component';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HeaderComponent} from './header/header.component';
import {LoginFormComponent} from './login-form/login-form.component';
import {ProductComponent} from './product/product.component';
import {ProductsFeedComponent} from './products-feed/products-feed.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { SellersComponent } from './sellers/sellers.component';
import { HomeComponent } from './home/home.component';

enableProdMode();

@NgModule({
  declarations: [
    AppComponent, ProductsFeedComponent, AddProductComponent, ProductComponent,
    LoginFormComponent, HeaderComponent, ReviewsComponent, SellersComponent, HomeComponent
  ],
  imports: [
    MatSnackBarModule,   MatIconModule,      MatDialogModule,
    MatDividerModule,    FlexLayoutModule,   MatGridListModule,
    MatInputModule,      MatSelectModule,    MatCheckboxModule,
    ReactiveFormsModule, MatButtonModule,    NoopAnimationsModule,
    MatMomentDateModule, MatFormFieldModule, FormsModule,
    BrowserModule,       MatExpansionModule, MatCardModule,
    MatDatepickerModule, HttpClientModule,   AppRoutingModule,
    MatInputModule
  ],
  entryComponents: [AddProductComponent, LoginFormComponent],
  providers: [
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 3000}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
