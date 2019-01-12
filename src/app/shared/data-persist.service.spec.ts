import { TestBed } from '@angular/core/testing';

import { DataPersistService } from '../services/data-persist.service';

describe('DataPersistService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataPersistService = TestBed.get(DataPersistService);
    expect(service).toBeTruthy();
  });
});
