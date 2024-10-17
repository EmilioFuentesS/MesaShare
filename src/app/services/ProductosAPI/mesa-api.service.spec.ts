import { TestBed } from '@angular/core/testing';

import { MesaAPIService } from './mesa-api.service';

describe('MesaAPIService', () => {
  let service: MesaAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MesaAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
