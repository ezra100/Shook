import { TestBed, inject } from '@angular/core/testing';

import { MySnackbarService } from './my-snackbar.service';

describe('MySnackbarService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MySnackbarService]
    });
  });

  it('should be created', inject([MySnackbarService], (service: MySnackbarService) => {
    expect(service).toBeTruthy();
  }));
});
