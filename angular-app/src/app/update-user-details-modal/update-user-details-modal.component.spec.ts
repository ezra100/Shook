import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateUserDetailsModalComponent } from './update-user-details-modal.component';

describe('UpdateUserDetailsModalComponent', () => {
  let component: UpdateUserDetailsModalComponent;
  let fixture: ComponentFixture<UpdateUserDetailsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateUserDetailsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateUserDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
