import { TestBed } from '@angular/core/testing';

import { SubAdminService } from './sub-admin.service';

describe('SubAdminService', () => {
  let service: SubAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
