import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {BrowserModule} from '@angular/platform-browser';

import {AddProductComponent} from './add-product/add-product.component';
import {AppComponent} from './app.component';
import {ProductComponent} from './product/product.component';
import {ProductsFeedComponent} from './products-feed/products-feed.component';
import { AppRoutingModule } from './/app-routing.module';

@NgModule({
  declarations: [
    AppComponent, ProductsFeedComponent, AddProductComponent, ProductComponent
  ],
  imports: [BrowserModule, MatCardModule, HttpClientModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
