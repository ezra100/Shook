import {Component, OnInit} from '@angular/core';

import {Product} from '../../../types';

import {ProductsService} from './products.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Shook';
}
