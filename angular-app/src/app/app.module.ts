import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatExpansionModule} from '@angular/material/expansion';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './/app-routing.module';
import {AddProductComponent} from './add-product/add-product.component';
import {AppComponent} from './app.component';
import {LoginFormComponent} from './login-form/login-form.component';
import {ProductComponent} from './product/product.component';
import {ProductsFeedComponent} from './products-feed/products-feed.component';

@NgModule({
  declarations: [
    AppComponent, ProductsFeedComponent, AddProductComponent, ProductComponent,
    LoginFormComponent
  ],
  imports: [
    BrowserModule, MatExpansionModule, MatCardModule, MatDatepickerModule,
    HttpClientModule, AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
