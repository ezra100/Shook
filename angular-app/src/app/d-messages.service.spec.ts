import { TestBed, inject } from '@angular/core/testing';

import { DMessagesService } from './d-messages.service';

describe('DMessagesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DMessagesService]
    });
  });

  it('should be created', inject([DMessagesService], (service: DMessagesService) => {
    expect(service).toBeTruthy();
  }));
});
