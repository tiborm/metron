import { TestBed } from '@angular/core/testing';

import { MetronSharedLibService } from './metron-shared-lib.service';

describe('MetronSharedLibService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MetronSharedLibService = TestBed.get(MetronSharedLibService);
    expect(service).toBeTruthy();
  });
});
