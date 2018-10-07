import { TestBed, inject } from '@angular/core/testing';

import { TareaService } from './tarea.service';

describe('TareaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TareaService]
    });
  });

  it('should be created', inject([TareaService], (service: TareaService) => {
    expect(service).toBeTruthy();
  }));
});
