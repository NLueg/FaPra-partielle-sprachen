import { TestBed } from '@angular/core/testing';

import { Run } from '../../classes/diagram/run';
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

    it('should merge example correctly', () => {
        const result = service.mergeRuns([
            firstExampleFirstRun,
            firstExampleSecondRun,
            secondExampleFirstRun,
            secondExampleSecondRun,
        ]);

        expect(result).toEqual([
            {
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
                        target: 't7',
                    },
                    {
                        breakpoints: [],
                        source: 't2',
                        target: 't7',
                    },
                    {
                        breakpoints: [],
                        source: 't4',
                        target: 't5',
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
                    {
                        breakpoints: [],
                        source: 't5',
                        target: 't3',
                    },
                    {
                        breakpoints: [],
                        source: 't4',
                        target: 't3',
                    },
                ],
                elements: [
                    {
                        incomingArcs: [],
                        id: 't1',
                        label: 't1',
                        outgoingArcs: [
                            {
                                breakpoints: [],
                                source: 't1',
                                target: 't2',
                            },
                        ],
                    },
                    {
                        incomingArcs: [
                            {
                                breakpoints: [],
                                source: 't1',
                                target: 't2',
                            },
                        ],
                        id: 't2',
                        label: 't2',
                        outgoingArcs: [
                            {
                                breakpoints: [],
                                source: 't2',
                                target: 't4',
                            },
                            {
                                breakpoints: [],
                                source: 't2',
                                target: 't7',
                            },
                        ],
                    },
                    {
                        incomingArcs: [
                            {
                                breakpoints: [],
                                source: 't2',
                                target: 't4',
                            },
                        ],
                        id: 't4',
                        label: 't4',
                        outgoingArcs: [
                            {
                                breakpoints: [],
                                source: 't4',
                                target: 't7',
                            },
                            {
                                breakpoints: [],
                                source: 't4',
                                target: 't5',
                            },
                            {
                                breakpoints: [],
                                source: 't4',
                                target: 't3',
                            },
                        ],
                    },
                    {
                        incomingArcs: [
                            {
                                breakpoints: [],
                                source: 't4',
                                target: 't7',
                            },
                            {
                                breakpoints: [],
                                source: 't2',
                                target: 't7',
                            },
                        ],
                        id: 't7',
                        label: 't7',
                        outgoingArcs: [],
                    },
                    {
                        incomingArcs: [
                            {
                                breakpoints: [],
                                source: 't4',
                                target: 't5',
                            },
                        ],
                        id: 't5',
                        label: 't5',
                        outgoingArcs: [
                            {
                                breakpoints: [],
                                source: 't5',
                                target: 't6',
                            },
                            {
                                breakpoints: [],
                                source: 't5',
                                target: 't3',
                            },
                        ],
                    },
                    {
                        incomingArcs: [
                            {
                                breakpoints: [],
                                source: 't5',
                                target: 't6',
                            },
                        ],
                        id: 't6',
                        label: 't6',
                        outgoingArcs: [
                            {
                                breakpoints: [],
                                source: 't6',
                                target: 't3',
                            },
                        ],
                    },
                    {
                        incomingArcs: [
                            {
                                breakpoints: [],
                                source: 't6',
                                target: 't3',
                            },
                            {
                                breakpoints: [],
                                source: 't5',
                                target: 't3',
                            },
                            {
                                breakpoints: [],
                                source: 't4',
                                target: 't3',
                            },
                        ],
                        id: 't3',
                        label: 't3',
                        outgoingArcs: [],
                    },
                ],
                text: '.type run\n.events\nt1\nt2\nt4\nt7\nt5\nt6\nt3\n.arcs\nt1 t2\nt2 t4\nt4 t7\nt2 t7\nt4 t5\nt5 t6\nt6 t3\nt5 t3\nt4 t3',
                warnings: [],
            },
            {
                arcs: [
                    {
                        breakpoints: [],
                        source: 't6',
                        target: 't21',
                    },
                    {
                        breakpoints: [],
                        source: 't6',
                        target: 't22',
                    },
                    {
                        breakpoints: [],
                        source: 't22',
                        target: 't3',
                    },
                    {
                        breakpoints: [],
                        source: 't21',
                        target: 't3',
                    },
                    {
                        breakpoints: [],
                        source: 't6',
                        target: 't33',
                    },
                    {
                        breakpoints: [],
                        source: 't21',
                        target: 't10',
                    },
                ],
                elements: [
                    {
                        incomingArcs: [],
                        id: 't6',
                        label: 't6',
                        outgoingArcs: [
                            {
                                breakpoints: [],
                                source: 't6',
                                target: 't21',
                            },
                            {
                                breakpoints: [],
                                source: 't6',
                                target: 't22',
                            },
                            {
                                breakpoints: [],
                                source: 't6',
                                target: 't33',
                            },
                        ],
                    },
                    {
                        incomingArcs: [
                            {
                                breakpoints: [],
                                source: 't6',
                                target: 't21',
                            },
                        ],
                        id: 't21',
                        label: 't21',
                        outgoingArcs: [
                            {
                                breakpoints: [],
                                source: 't21',
                                target: 't3',
                            },
                            {
                                breakpoints: [],
                                source: 't21',
                                target: 't10',
                            },
                        ],
                    },
                    {
                        incomingArcs: [
                            {
                                breakpoints: [],
                                source: 't6',
                                target: 't22',
                            },
                        ],
                        id: 't22',
                        label: 't22',
                        outgoingArcs: [
                            {
                                breakpoints: [],
                                source: 't22',
                                target: 't3',
                            },
                        ],
                    },
                    {
                        incomingArcs: [
                            {
                                breakpoints: [],
                                source: 't22',
                                target: 't3',
                            },
                            {
                                breakpoints: [],
                                source: 't21',
                                target: 't3',
                            },
                        ],
                        id: 't3',
                        label: 't3',
                        outgoingArcs: [],
                    },
                    {
                        incomingArcs: [
                            {
                                breakpoints: [],
                                source: 't21',
                                target: 't10',
                            },
                        ],
                        id: 't10',
                        label: 't10',
                        outgoingArcs: [],
                    },
                    {
                        incomingArcs: [
                            {
                                breakpoints: [],
                                source: 't6',
                                target: 't33',
                            },
                        ],
                        id: 't33',
                        label: 't33',
                        outgoingArcs: [],
                    },
                ],
                text: '.type run\n.events\nt6\nt21\nt22\nt3\nt10\nt33\n.arcs\nt6 t21\nt6 t22\nt22 t3\nt21 t3\nt6 t33\nt21 t10',
                warnings: [],
            },
        ]);
    });
});

const firstExampleFirstRun: Run = {
    text: '.type ps\r\n.transitions\r\nt1\r\nt2\r\nt4\r\nt7\r\n.arcs\r\nt1 t2\r\nt2 t4\r\nt4 t7\r\nt2 t7\r\n',
    arcs: [
        { source: 't1', target: 't2', breakpoints: [] },
        { source: 't2', target: 't4', breakpoints: [] },
        { source: 't4', target: 't7', breakpoints: [] },
        { source: 't2', target: 't7', breakpoints: [] },
    ],
    elements: [
        {
            id: 't1',
            label: 't1',
            incomingArcs: [],
            outgoingArcs: [{ source: 't1', target: 't2', breakpoints: [] }],
        },
        {
            id: 't2',
            label: 't2',
            incomingArcs: [{ source: 't1', target: 't2', breakpoints: [] }],
            outgoingArcs: [
                { source: 't2', target: 't4', breakpoints: [] },
                { source: 't2', target: 't7', breakpoints: [] },
            ],
        },
        {
            id: 't4',
            label: 't4',
            incomingArcs: [{ source: 't2', target: 't4', breakpoints: [] }],
            outgoingArcs: [{ source: 't4', target: 't7', breakpoints: [] }],
        },
        {
            id: 't7',
            label: 't7',
            incomingArcs: [
                { source: 't4', target: 't7', breakpoints: [] },
                { source: 't2', target: 't7', breakpoints: [] },
            ],
            outgoingArcs: [],
        },
    ],
    warnings: [],
};

const firstExampleSecondRun: Run = {
    text: '.type ps\r\n.transitions\r\nt1\r\nt2\r\nt3\r\nt4\r\nt5\r\nt6\r\n.arcs\r\nt1 t2\r\nt2 t4\r\nt4 t5\r\nt5 t6\r\nt6 t3\r\nt5 t3\r\nt4 t3\r\n',
    arcs: [
        { source: 't1', target: 't2', breakpoints: [] },
        { source: 't2', target: 't4', breakpoints: [] },
        { source: 't4', target: 't5', breakpoints: [] },
        { source: 't5', target: 't6', breakpoints: [] },
        { source: 't6', target: 't3', breakpoints: [] },
        { source: 't5', target: 't3', breakpoints: [] },
        { source: 't4', target: 't3', breakpoints: [] },
    ],
    elements: [
        {
            id: 't1',
            label: 't1',
            incomingArcs: [],
            outgoingArcs: [{ source: 't1', target: 't2', breakpoints: [] }],
        },
        {
            id: 't2',
            label: 't2',
            incomingArcs: [{ source: 't1', target: 't2', breakpoints: [] }],
            outgoingArcs: [{ source: 't2', target: 't4', breakpoints: [] }],
        },
        {
            id: 't3',
            label: 't3',
            incomingArcs: [
                { source: 't6', target: 't3', breakpoints: [] },
                { source: 't5', target: 't3', breakpoints: [] },
                { source: 't4', target: 't3', breakpoints: [] },
            ],
            outgoingArcs: [],
        },
        {
            id: 't4',
            label: 't4',
            incomingArcs: [{ source: 't2', target: 't4', breakpoints: [] }],
            outgoingArcs: [
                { source: 't4', target: 't5', breakpoints: [] },
                { source: 't4', target: 't3', breakpoints: [] },
            ],
        },
        {
            id: 't5',
            label: 't5',
            incomingArcs: [{ source: 't4', target: 't5', breakpoints: [] }],
            outgoingArcs: [
                { source: 't5', target: 't6', breakpoints: [] },
                { source: 't5', target: 't3', breakpoints: [] },
            ],
        },
        {
            id: 't6',
            label: 't6',
            incomingArcs: [{ source: 't5', target: 't6', breakpoints: [] }],
            outgoingArcs: [{ source: 't6', target: 't3', breakpoints: [] }],
        },
    ],
    warnings: [],
};

const secondExampleFirstRun: Run = {
    text: '.type ps\r\n.transitions\r\nt6\r\nt21\r\nt22\r\nt3\r\n.arcs\r\nt6 t21\r\nt6 t22\r\nt22 t3\r\nt21 t3',
    arcs: [
        { source: 't6', target: 't21', breakpoints: [] },
        { source: 't6', target: 't22', breakpoints: [] },
        { source: 't22', target: 't3', breakpoints: [] },
        { source: 't21', target: 't3', breakpoints: [] },
    ],
    elements: [
        {
            id: 't6',
            label: 't6',
            incomingArcs: [],
            outgoingArcs: [
                { source: 't6', target: 't21', breakpoints: [] },
                { source: 't6', target: 't22', breakpoints: [] },
            ],
        },
        {
            id: 't21',
            label: 't21',
            incomingArcs: [{ source: 't6', target: 't21', breakpoints: [] }],
            outgoingArcs: [{ source: 't21', target: 't3', breakpoints: [] }],
        },
        {
            id: 't22',
            label: 't22',
            incomingArcs: [{ source: 't6', target: 't22', breakpoints: [] }],
            outgoingArcs: [{ source: 't22', target: 't3', breakpoints: [] }],
        },
        {
            id: 't3',
            label: 't3',
            incomingArcs: [
                { source: 't22', target: 't3', breakpoints: [] },
                { source: 't21', target: 't3', breakpoints: [] },
            ],
            outgoingArcs: [],
        },
    ],
    warnings: [],
};

const secondExampleSecondRun: Run = {
    text: '.type ps\r\n.transitions\r\nt6\r\nt21\r\nt33\r\nt10\r\n.arcs\r\nt6 t21\r\nt6 t33\r\nt21 t10',
    arcs: [
        { source: 't6', target: 't21', breakpoints: [] },
        { source: 't6', target: 't33', breakpoints: [] },
        { source: 't21', target: 't10', breakpoints: [] },
    ],
    elements: [
        {
            id: 't6',
            label: 't6',
            incomingArcs: [],
            outgoingArcs: [
                { source: 't6', target: 't21', breakpoints: [] },
                { source: 't6', target: 't33', breakpoints: [] },
            ],
        },
        {
            id: 't21',
            label: 't21',
            incomingArcs: [{ source: 't6', target: 't21', breakpoints: [] }],
            outgoingArcs: [{ source: 't21', target: 't10', breakpoints: [] }],
        },
        {
            id: 't33',
            label: 't33',
            incomingArcs: [{ source: 't6', target: 't33', breakpoints: [] }],
            outgoingArcs: [],
        },
        {
            id: 't10',
            label: 't10',
            incomingArcs: [{ source: 't21', target: 't10', breakpoints: [] }],
            outgoingArcs: [],
        },
    ],
    warnings: [],
};
