import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-disqus',
  templateUrl: './disqus.component.html',
  styleUrls: ['./disqus.component.scss']
})
export class DisqusComponent implements OnInit {
  pageID = location.href;
  constructor() { }

  ngOnInit() {
  }

}
