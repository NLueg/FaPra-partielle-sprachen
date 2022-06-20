import { TestBed } from '@angular/core/testing';

import { MergeService } from './merge.service';

describe('MergeService', () => {
    let service: MergeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MergeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
