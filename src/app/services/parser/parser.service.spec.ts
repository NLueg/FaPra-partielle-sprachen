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
            arcs: [
                {
                    breakpoints: [],
                    source: 't1',
                    target: 't2',
                },
                {
                    breakpoints: [],
                    source: 't2',
                    target: 't4',
                },
                {
                    breakpoints: [],
                    source: 't4',
                    target: 't3',
                },
                {
                    breakpoints: [],
                    source: 't4',
                    target: 't5',
                },
                {
                    breakpoints: [],
                    source: 't5',
                    target: 't3',
                },
                {
                    breakpoints: [],
                    source: 't5',
                    target: 'Verreisen',
                },
                {
                    breakpoints: [],
                    source: 'Verreisen',
                    target: 't3',
                },
            ],
            elements: [
                {
                    id: 't1',
                    incomingArcs: [],
                    label: 'Reiseziel auswählen',
                    outgoingArcs: [
                        {
                            breakpoints: [],
                            source: 't1',
                            target: 't2',
                        },
                    ],
                },
                {
                    id: 't2',
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: 't1',
                            target: 't2',
                        },
                    ],
                    label: 'Flug buchen',
                    outgoingArcs: [
                        {
                            breakpoints: [],
                            source: 't2',
                            target: 't4',
                        },
                    ],
                },
                {
                    id: 't3',
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: 't4',
                            target: 't3',
                        },
                        {
                            breakpoints: [],
                            source: 't5',
                            target: 't3',
                        },
                        {
                            breakpoints: [],
                            source: 'Verreisen',
                            target: 't3',
                        },
                    ],
                    label: 'Hotel buchen',
                    outgoingArcs: [],
                },
                {
                    id: 't4',
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: 't2',
                            target: 't4',
                        },
                    ],
                    label: 'Flug stornieren',
                    outgoingArcs: [
                        {
                            breakpoints: [],
                            source: 't4',
                            target: 't3',
                        },
                        {
                            breakpoints: [],
                            source: 't4',
                            target: 't5',
                        },
                    ],
                },
                {
                    id: 't5',
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: 't4',
                            target: 't5',
                        },
                    ],
                    label: 'Flug buchen',
                    outgoingArcs: [
                        {
                            breakpoints: [],
                            source: 't5',
                            target: 't3',
                        },
                        {
                            breakpoints: [],
                            source: 't5',
                            target: 'Verreisen',
                        },
                    ],
                },
                {
                    id: 'Verreisen',
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: 't5',
                            target: 'Verreisen',
                        },
                    ],
                    label: 'Verreisen',
                    outgoingArcs: [
                        {
                            breakpoints: [],
                            source: 'Verreisen',
                            target: 't3',
                        },
                    ],
                },
            ],
            offset: {
                x: 0,
                y: 0,
            },
            text: '.type run\n.events\nt1 | Reiseziel auswählen\nt2 | Flug buchen\nt3 | Hotel buchen\nt4 | Flug stornieren\nt5 | Flug buchen\nVerreisen\n.arcs\nt1 t2\nt2 t4\nt4 t3\nt4 t5\nt5 t3\nt5 Verreisen\nVerreisen t3\n',
            warnings: [],
        });
    });
});
