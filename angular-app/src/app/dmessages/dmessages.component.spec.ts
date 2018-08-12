import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DmessagesComponent } from './dmessages.component';

describe('DmessagesComponent', () => {
  let component: DmessagesComponent;
  let fixture: ComponentFixture<DmessagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DmessagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DmessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
