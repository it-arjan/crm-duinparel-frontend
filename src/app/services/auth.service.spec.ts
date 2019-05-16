import { TestBed } from '@angular/core/testing';

import { AuthBase } from './base/auth.base.service';

describe('AuthBase', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthBase = TestBed.get(AuthBase);
    expect(service).toBeTruthy();
  });
});
