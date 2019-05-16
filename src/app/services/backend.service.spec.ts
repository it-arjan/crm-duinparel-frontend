import { TestBed } from '@angular/core/testing';
import { BackendBase } from './base/backend.base.service';

describe('BackendBase', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BackendBase = TestBed.get(BackendBase);
    expect(service).toBeTruthy();
  })
})
