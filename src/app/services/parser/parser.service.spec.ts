import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';

import { ParserService } from './parser.service';

describe('ParserService', () => {
    let service: ParserService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: ToastrService, useValue: {} }],
        });
        service = TestBed.inject(ParserService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
