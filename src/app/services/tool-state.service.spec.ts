import { TestBed } from '@angular/core/testing';

import { ToolStateService } from './tool-state.service';

describe('ToolStateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ToolStateService = TestBed.get(ToolStateService);
    expect(service).toBeTruthy();
  });
});
