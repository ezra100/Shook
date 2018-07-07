import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsFeedComponent } from './products-feed.component';

describe('ProductsFeedComponent', () => {
  let component: ProductsFeedComponent;
  let fixture: ComponentFixture<ProductsFeedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductsFeedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
