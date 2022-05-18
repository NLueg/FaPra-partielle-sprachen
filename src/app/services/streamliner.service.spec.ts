import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';

import { StreamlinerService } from './streamliner.service';

describe('StreamlinerService', () => {
    let service: StreamlinerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: ToastrService, useValue: {} }],
        });
        service = TestBed.inject(StreamlinerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
