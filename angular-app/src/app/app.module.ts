import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule, MatCardModule, MatDatepickerModule, MatExpansionModule, MatFormFieldModule, MatInputModule} from '@angular/material';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';

import {AddProductComponent} from './add-product/add-product.component';
import {AppRoutingModule} from './app-routing.module';
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
    ReactiveFormsModule, MatButtonModule, NoopAnimationsModule,
    MatMomentDateModule, MatFormFieldModule, FormsModule, BrowserModule,
    MatExpansionModule, MatCardModule, MatDatepickerModule, HttpClientModule,
    AppRoutingModule, MatInputModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
