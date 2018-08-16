import { TestBed, inject } from '@angular/core/testing';

import { ChatRoomsService } from './chat-rooms.service';

describe('ChatRoomsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatRoomsService]
    });
  });

  it('should be created', inject([ChatRoomsService], (service: ChatRoomsService) => {
    expect(service).toBeTruthy();
  }));
});
