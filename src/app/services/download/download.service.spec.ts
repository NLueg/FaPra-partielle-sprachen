import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';

import { DownloadService } from './download.service';

describe('ParserService', () => {
    let service: DownloadService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: ToastrService, useValue: {} }],
        });
        service = TestBed.inject(DownloadService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
