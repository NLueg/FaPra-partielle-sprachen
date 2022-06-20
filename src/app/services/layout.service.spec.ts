import { TestBed } from '@angular/core/testing';

import { Run } from '../classes/diagram/run';
import { LayoutService } from './layout.service';

describe('LayoutService', () => {
    let service: LayoutService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LayoutService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // TODO: Breakpoints are recursive
    it('should layout example content correctly', () => {
        const result = service.layout(exampleInput);
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
                    target: 't6',
                },
                {
                    breakpoints: [],
                    source: 't6',
                    target: 't3',
                },
            ],
            elements: [
                {
                    incomingArcs: [],
                    label: 't1',
                    outgoingArcs: [
                        {
                            breakpoints: [],
                            source: 't1',
                            target: 't2',
                        },
                    ],
                    x: 100,
                    y: 160,
                },
                {
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: 't1',
                            target: 't2',
                        },
                    ],
                    label: 't2',
                    outgoingArcs: [
                        {
                            breakpoints: [],
                            source: 't2',
                            target: 't4',
                        },
                    ],
                    x: 200,
                    y: 160,
                },
                {
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
                            source: 't6',
                            target: 't3',
                        },
                    ],
                    label: 't3',
                    outgoingArcs: [],
                    x: 600,
                    y: 160,
                },
                {
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: 't2',
                            target: 't4',
                        },
                    ],
                    label: 't4',
                    outgoingArcs: [
                        {
                            breakpoints: [
                                {
                                    arc: expect.anything(),
                                    x: 400,
                                    y: 80,
                                },
                                {
                                    arc: expect.anything(),
                                    x: 500,
                                    y: 40,
                                },
                            ],
                            source: 't4',
                            target: 't3',
                        },
                        {
                            breakpoints: [],
                            source: 't4',
                            target: 't5',
                        },
                    ],
                    x: 300,
                    y: 160,
                },
                {
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: 't4',
                            target: 't5',
                        },
                    ],
                    label: 't5',
                    outgoingArcs: [
                        {
                            breakpoints: [
                                {
                                    arc: expect.anything(),
                                    x: 500,
                                    y: 280,
                                },
                            ],
                            source: 't5',
                            target: 't3',
                        },
                        {
                            breakpoints: [],
                            source: 't5',
                            target: 't6',
                        },
                    ],
                    x: 400,
                    y: 240,
                },
                {
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: 't5',
                            target: 't6',
                        },
                    ],
                    label: 't6',
                    outgoingArcs: [
                        {
                            breakpoints: [],
                            source: 't6',
                            target: 't3',
                        },
                    ],
                    x: 500,
                    y: 160,
                },
            ],
            text: '.type ps\n.transitions\nt1\nt2\nt3\nt4\nt5\nt6\n.arcs\nt1 t2\nt2 t4\nt4 t3\nt4 t5\nt5 t3\nt5 t6\nt6 t3\n',
            warnings: [],
        });
    });
});

const exampleInput: Run = {
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
            outgoingArcs: [{ source: 't1', target: 't2', breakpoints: [] }],
        },
        {
            label: 't2',
            incomingArcs: [{ source: 't1', target: 't2', breakpoints: [] }],
            outgoingArcs: [{ source: 't2', target: 't4', breakpoints: [] }],
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
            incomingArcs: [{ source: 't2', target: 't4', breakpoints: [] }],
            outgoingArcs: [
                { source: 't4', target: 't3', breakpoints: [] },
                { source: 't4', target: 't5', breakpoints: [] },
            ],
        },
        {
            label: 't5',
            incomingArcs: [{ source: 't4', target: 't5', breakpoints: [] }],
            outgoingArcs: [
                { source: 't5', target: 't3', breakpoints: [] },
                { source: 't5', target: 't6', breakpoints: [] },
            ],
        },
        {
            label: 't6',
            incomingArcs: [{ source: 't5', target: 't6', breakpoints: [] }],
            outgoingArcs: [{ source: 't6', target: 't3', breakpoints: [] }],
        },
    ],
    warnings: [],
};
