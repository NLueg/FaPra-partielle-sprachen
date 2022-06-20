import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';

import { exampleContent } from '../upload/example-file';
import { ParserService } from './parser.service';

describe('ParserService', () => {
    let service: ParserService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: ToastrService, useValue: { toasts: [] } }],
        });
        service = TestBed.inject(ParserService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should parse example content', () => {
        const errors = new Set<string>();
        const result = service.parse(exampleContent, errors);

        expect(result).toEqual({
            text: '.type ps\n.transitions\nt1\nt2\nt3\nt4\nt5\nt6\n.arcs\nt1 t2\nt2 t4\nt4 t3\nt4 t5\nt5 t3\nt5 t6\nt6 t3\n',
            arcs: [
                { source: 't1', target: 't2', breakpoints: [] },
                { source: 't2', target: 't4', breakpoints: [] },
                { source: 't4', target: 't3', breakpoints: [] },
                { source: 't4', target: 't5', breakpoints: [] },
                { source: 't5', target: 't3', breakpoints: [] },
                { source: 't5', target: 't6', breakpoints: [] },
                { source: 't6', target: 't3', breakpoints: [] },
            ],
            elements: [
                {
                    label: 't1',
                    incomingArcs: [],
                    outgoingArcs: [
                        { source: 't1', target: 't2', breakpoints: [] },
                    ],
                },
                {
                    label: 't2',
                    incomingArcs: [
                        { source: 't1', target: 't2', breakpoints: [] },
                    ],
                    outgoingArcs: [
                        { source: 't2', target: 't4', breakpoints: [] },
                    ],
                },
                {
                    label: 't3',
                    incomingArcs: [
                        { source: 't4', target: 't3', breakpoints: [] },
                        { source: 't5', target: 't3', breakpoints: [] },
                        { source: 't6', target: 't3', breakpoints: [] },
                    ],
                    outgoingArcs: [],
                },
                {
                    label: 't4',
                    incomingArcs: [
                        { source: 't2', target: 't4', breakpoints: [] },
                    ],
                    outgoingArcs: [
                        { source: 't4', target: 't3', breakpoints: [] },
                        { source: 't4', target: 't5', breakpoints: [] },
                    ],
                },
                {
                    label: 't5',
                    incomingArcs: [
                        { source: 't4', target: 't5', breakpoints: [] },
                    ],
                    outgoingArcs: [
                        { source: 't5', target: 't3', breakpoints: [] },
                        { source: 't5', target: 't6', breakpoints: [] },
                    ],
                },
                {
                    label: 't6',
                    incomingArcs: [
                        { source: 't5', target: 't6', breakpoints: [] },
                    ],
                    outgoingArcs: [
                        { source: 't6', target: 't3', breakpoints: [] },
                    ],
                },
            ],
            warnings: [],
        });
    });
});
