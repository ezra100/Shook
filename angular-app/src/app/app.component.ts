import {Component, OnInit} from '@angular/core';

import {Product} from '../../../types';

import {ProductsService} from './products.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  resizeTimeout: NodeJS.Timer;
  ngOnInit(): void {
    $(window).resize(() => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => $('.product-subtitle').dotdotdot(), 1000)
    });
  }
  title = 'Shook';
}
